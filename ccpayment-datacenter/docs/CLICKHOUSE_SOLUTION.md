# CCPayment 商户数据模块 — ClickHouse 部署解决方案

> **版本**：v1.2
> **日期**：2026-05-14
> **适用模块**：数据看板 → 商户数据 / 财务看板
> **部署平台**：AWS（us-east-1 / N. Virginia）
> **目标读者**：技术负责人
>
> **已确认决策**：
> - HA：单机起步，暂不规划主备 / 集群
> - 区域：美国 us-east-1，不做跨区域备份
> - 历史迁移：3 年 MySQL 历史流水全量回灌
> - 培训：不引入外部 ClickHouse 咨询，由内部团队自研

---

## 〇、Executive Summary

### 一句话方案
**AWS 单节点 `m6i.2xlarge`（8 vCPU / 32 GB / 300 GB gp3 SSD），AWS DMS 把 MySQL 流水增量同步到 S3，ClickHouse 用 S3Queue 引擎消费入库，物化视图做日级预聚合，后端 API 只读 ClickHouse + Redis 缓存，备份到 S3。**

### 核心指标

| 指标 | 数值 |
|---|---|
| AWS 月成本（按需价） | ~$435 |
| AWS 月成本（1 年 Savings Plan） | ~$345 |
| 数据保留 | 3 年 |
| 查询 p95 延迟目标 | < 300 ms |
| CDC 数据延迟 | 1–2 分钟（DMS batch 间隔） |
| 故障恢复 RTO | < 1 小时 |
| 故障恢复 RPO | < 24 小时 |
| 3 年磁盘稳态占用 | ~35 GB |
| 磁盘容量 | 300 GB（5× 余量，业务 3× 增长仍够，可在线扩容到 16 TB） |

### 关键决策一览

| # | 决策 | 选了什么 | 否决了什么 | 核心理由 |
|---|---|---|---|---|
| 1 | 数据库选型 | ClickHouse | MySQL / Elasticsearch | OLAP 工作负载本质匹配列存 |
| 2 | 部署形态 | 单节点（长期） | 主备 / 集群 | 并发 ≤ 5，内部系统，单机 + S3 备份够用；HA 已确认**不在规划范围** |
| 3 | 配置规格 | 8c32g + 1TB | 4c16g / 16c64g | 节省的硬件成本 < 运维风险溢价 |
| 4 | AWS 实例 | `m6i.2xlarge` | `m7i` / `r6i` / `c6i` | 性价比 + 稳定性最优 |
| 5 | 磁盘类型 | gp3 300GB | io2 / instance store / 大容量 | OLAP 顺序读吞吐优先，gp3 可配置且可在线扩容 |
| 6 | 数据同步 | **AWS DMS → S3 → CH S3Queue** | Debezium+MSK / MaterializedMySQL / 双写 / 定时 ETL | 全托管 + 零运维 + 1–2 min 延迟运营完全可接受 |
| 7 | 预聚合策略 | AggregatingMergeTree + MV | 定时跑日/周/月/季报表 | 解决"时间筛选不灵活"核心痛点 |
| 8 | 维度数据 | ClickHouse Dictionary | 镜像维度表 | 避免大 JOIN + 5 分钟同步元数据 |
| 9 | API 层 | 批接口 + Redis 缓存 | 一卡片一接口 | 5 并发场景下连接复用 + 减少 CH 负载 |
| 10 | 备份 | 每日全量 → S3 + Glacier | EBS Snapshot | 跨可用区抗机房级故障 + 成本低 |

---

## 一、背景与目标

### 1.1 现状痛点

公司当前数据看板基于 MySQL，依赖**定时跑任务输出固定口径报表**：

| 痛点 | 影响 |
|---|---|
| 报表起止时间固定（如「上周」「上月」） | 运营无法自由选择时间窗，跨月对比要找开发 |
| 长周期统计性能差 | 3 个月以上的聚合查询要分钟级 |
| 新增维度走开发排期 | 业务响应慢，运营自助能力受限 |
| MySQL 行存做 OLAP 性价比低 | 数据量增长后扩容只能堆硬件 |

### 1.2 业务目标

1. **灵活时间筛选**：任意起止区间，从「今日」到「今年至今」到自定义任意 N 天
2. **OLAP 标准查询**：地区 / 行业 / 商户 / 时间 维度自由组合
3. **秒级响应**：运营点开任意卡片 < 300 ms 出数据
4. **低运维负担**：1 人能管，每月运维投入 < 2 小时

### 1.3 系统边界

| 维度 | 数值 |
|---|---|
| 使用对象 | 公司内部运营人员 |
| 并发量 | ≤ 5 同时在线 |
| 数据规模（估算） | 日均流水 ~50 万行（充值 30w + 换币 10w + 归集 10w） |
| 3 年数据量 | ~5.5 亿行 |
| 涉及模块 | 商户数据（已设计） + 财务看板（待开发，复用同源流水） |
| SLA | 工作时间可用 ≥ 99%；非工作时间允许故障窗口 |

---

## 二、技术选型决策

### 2.1 为什么选 ClickHouse？

#### 否决方案

**A. 继续用 MySQL + 优化（如分库分表、读写分离）**
- ❌ 解决不了 OLAP 工作负载的本质问题：行存格式做大表聚合，IO 放大严重
- ❌ 报表灵活性问题无解：任意时间窗 + 任意维度组合 = MySQL 索引爆炸
- ❌ 投入产出比低：再多优化也只是延缓痛点，3 年内必再次重构

**B. Elasticsearch**
- ❌ ES 是为全文搜索设计的，做聚合是「能用」不是「擅长」
- ❌ `cardinality` 聚合是 HyperLogLog **近似值**，与商户数据模块「累计行 B 口径」要求的精确去重冲突
- ❌ 内存敏感：32 GB 物理内存最多给 JVM 8G 堆，5 并发大聚合容易触发 circuit breaker
- ❌ 存储放大：倒排索引对每个字段建索引，存储成本是 ClickHouse 的 3–8 倍
- ✅ ES 唯一胜出场景是"商户名/ID 模糊搜索"，但这件事 MySQL 直接 `LIKE` 已经够用，不值得引入

**C. Snowflake / BigQuery / Redshift（云数仓）**
- ❌ 成本数量级更高：Redshift 最小 `ra3.xlplus` 节点 ~$1500/月，Snowflake 按 credit 计费更不可控
- ❌ 数据出境合规问题：CCPayment 涉及跨境支付，数据出境监管严格
- ❌ 锁定云厂商，未来迁移成本高

#### ClickHouse 优势对应本项目需求

| 项目需求 | ClickHouse 能力 |
|---|---|
| 任意时间窗 GROUP BY | 列存 + partition 裁剪，扫描成本最小化 |
| 跨年长周期聚合 | `MergeTree` 顺序读 + 列压缩比 10× |
| 多维度自由组合 | 物化视图按主流维度预聚合，未命中走原始表 |
| 精确去重（累计行 B 口径） | `uniqExact` 精确，不走近似 |
| 单机够用 | 4c16g 起就能跑生产，资源效率高 |
| SQL 原生 | 后端开发零学习成本 |
| 物化视图增量更新 | 解决"定时报表"的灵活性死结 |

### 2.2 为什么单机而非集群？

#### 决策矩阵

| 形态 | 月成本 | RTO | 复杂度 | 是否推荐 |
|---|---|---|---|---|
| **单机 + S3 备份** ⭐ | $420 | ~1 小时 | 低 | ✅ 一期方案 |
| 1 主 1 副本 + Keeper | $900 | < 1 分钟 | 中 | ⏸ 视一期反馈再上 |
| 多分片集群 | $2000+ | < 1 分钟 | 高 | ❌ 远超当前需求 |

#### 单机够用的依据

1. **并发 5 不需要分担读压力**：单机 8 核可承担 max_concurrent_queries=10 的设置
2. **数据量小**：3 年 ~5.5 亿行，单机轻松；CH 单机正式压测纪录可达千亿行
3. **故障容忍**：内部运营后台，非交易链路；S3 备份 + 新机器恢复在 1 小时内完成是可接受的
4. **演进路径**：schema 第一天就用 `ReplicatedMergeTree`（兼容未来加副本，**不用迁数据**）

#### 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| EC2 单机故障 | 低（AWS SLA 99.99%） | 看板不可用 1 小时 | 每日 S3 备份 + 自动化恢复脚本 |
| EBS 卷损坏 | 极低 | 数据丢失最多 24 小时 | EBS Snapshot + S3 备份双保险 |
| 可用区故障 | 极低 | 看板不可用数小时 | S3 跨 AZ 复制，可在另一 AZ 拉起新机器 |

### 2.3 为什么 8c32g 而非 4c16g / 16c64g？

**横向对比**：

| 配置 | 月成本（按需） | 单查询 p95 | 5 并发 OOM 风险 | 余量 |
|---|---|---|---|---|
| 4c16g | ~$245 | 500ms–1s | 中（max_memory_usage 只能给 6G） | 0 |
| **8c32g ⭐** | ~$385 | < 300ms | 低（max_memory_usage 16G） | 3 年内不用升 |
| 16c64g | ~$770 | < 200ms | 极低 | 5+ 年余量，但短期闲置 |

**核心权衡**：8c32g 比 4c16g 多花 $140/月 = $1680/年 ≈ ¥1.2 万。这笔钱**远低于一次 OOM 事故的运维 + 业务影响成本**。16c64g 在并发 5 的场景下 8 个核基本闲置，是浪费。

**4c16g 在本项目的具体局限**（即使把 §4 的全部优化都用上）：

| 局限 | 实际表现 |
|---|---|
| `max_threads = 4` | 单查询并行度差，财务看板"年度营收按月切片"类大窗口聚合慢 |
| `max_memory_usage` 最多设 6–8 GB | 跨年 GROUP BY 频繁溢盘到磁盘，p95 劣化 |
| `uniqExact` 内存压力 | 累计行 B 口径必须精确去重，5 并发同时跑 OOM 风险高 |
| 后台 merge / MV 物化无余量 | CDC 高峰期会和查询抢资源，写入抖动传导到查询 |
| 财务看板加进来 MV 翻倍 | 6 个月内就要再升级一次，停机迁数据 |

> **常见误区辨析**：有些技术文章（如「16G 单机跑 2 亿日志」）展示了 CH 在小内存下的极限，这些案例的工作负载是**单用户 + 简单 count 查询 + 单一日志表**，与我们 5 并发 + 多维 OLAP + 精确去重的场景**本质不同**。文章里的优化手段我们都用了（见 §4.1–4.4），但优化无法弥补工作负载差异带来的内存需求差。

### 2.4 为什么 AWS m6i.2xlarge？

#### AWS 实例族对比

| 实例 | CPU | 内存 | 月成本（us-east-1 按需） | 适合度 |
|---|---|---|---|---|
| `t3.2xlarge`（突发型） | 8 vCPU | 32 GB | $240 | ❌ CH 持续 CPU 高，会被限速 |
| `c6i.2xlarge`（计算优化） | 8 vCPU | 16 GB | $250 | ❌ 内存不够 |
| `c6i.4xlarge` | 16 vCPU | 32 GB | $500 | ❌ CPU 过剩 |
| `m6i.2xlarge`（通用） ⭐ | 8 vCPU | 32 GB | $280 | ✅ CPU/内存比 1:4，与 CH 工作负载完美匹配 |
| `m6a.2xlarge`（AMD） | 8 vCPU | 32 GB | $252 | ✅ 便宜 10%，性能略低，备选 |
| `m7i.2xlarge`（Sapphire Rapids） | 8 vCPU | 32 GB | $300 | ⚠️ 新一代，性能 +10%，但成本高、案例少 |
| `r6i.xlarge`（内存优化） | 4 vCPU | 32 GB | $200 | ❌ CPU 不够 |

#### 选 m6i 的理由

1. **CPU/内存比 1:4 与 CH 工作负载完美吻合**（CH 是 CPU+IO 密集型，每核需要 ~4G 内存做查询缓冲）
2. **Intel Ice Lake** 第 3 代至强，CH 在 Intel 上有更好的 SIMD 优化（`SSE4.2` / `AVX2`）
3. **生产成熟度**：m6 系列发布 3 年，生态稳定，故障率数据透明
4. **价格梯度合适**：$280/月（按需）是甜点位
5. **EBS 优化默认开启**：m6i 内置 EBS 网络带宽，磁盘 IO 不抢主网

#### 为什么不选 m7i？

- **新硬件 ≠ 新性能**：m7i 比 m6i 单核性能提升约 10–15%，但价格高 7%
- **生态成熟度**：m7i 发布较新，CH 22.x 在新代 CPU 上的调优案例少
- **不必要的领先**：本项目工作负载远未触到 m6i 的天花板

#### 为什么不选 m6a（AMD）？

可以选，便宜 10%。但**推荐 m6i 的理由**：
- ClickHouse 官方 benchmark 在 Intel 上稍优（特别是 AVX2 优化的聚合函数）
- 公司如果其他服务多在 Intel 实例上，运维心智一致性更好
- 差价仅 $30/月，不值得为它增加运维差异性

> **若公司有 AWS Savings Plan 或 Reserved Instances**：1 年期 m6i.2xlarge 大约 $200/月，3 年期约 $140/月。**强烈建议买 1 年 SP**（折扣 ~30%，且不绑死实例族）。

### 2.5 为什么 gp3 1TB 而非 io2 / instance store？

#### EBS 类型对比

| 类型 | IOPS | 吞吐 | 1TB 月成本 | 适用 |
|---|---|---|---|---|
| **gp3** ⭐ | 3000–16000 可配 | 125–1000 MB/s 可配 | $80 + IOPS/吞吐附加费 | ✅ 通用 SSD，本场景最优 |
| gp2 | 3000–16000（捆绑容量） | 250 MB/s | $100 | ❌ 已被 gp3 完全替代 |
| io2 Block Express | 最高 256000 | 4000 MB/s | $1000+ | ❌ 过度配置，CH 不需要这么高 IOPS |
| Instance Store（NVMe） | 极高 | 极高 | 0（含在实例费） | ❌ **机器停机数据全丢**，不能做主存储 |
| EFS / FSx | 中等 | 中等 | 高 | ❌ 网络文件系统，CH 不建议 |

#### gp3 推荐配置

| 参数 | 推荐值 | 月成本 | 理由 |
|---|---|---|---|
| 容量 | 300 GB | $24 | 3 年稳态 ~35GB，5× 余量；可在线扩容到 16 TB，**起步小、按需扩** |
| IOPS | 6000 | $15 | OLAP 顺序读为主，6000 远超需要 |
| 吞吐 | 250 MB/s | $5 | 列扫描吞吐型，gp3 默认 125 不够，提到 250 |
| **小计** | | **~$44/月** | |

#### 容量规划详解

| 数据层 | 3 年稳态占用 |
|---|---|
| L0 原始流水（充值 + 换币 + 归集 3 张表） | ~14 GB |
| L1 物化视图（merchant + region + industry） | ~6 GB |
| 财务看板 MV | ~5 GB |
| 索引 + Mark + 压缩字典 | ~5 GB |
| Merge 中间态（瞬时） | ~10 GB |
| WAL / system log / temp | ~5 GB |
| **稳态总计** | **~35 GB** |
| 业务 3× 增长情景 | ~105 GB |
| 业务 5× 增长情景 | ~175 GB |

**300 GB 选型逻辑**：
- ✅ 5× 当前稳态余量
- ✅ 业务量翻 3 倍仍未达 50% 使用率
- ✅ ClickHouse 健康线"使用率 < 80%" 留足缓冲
- ✅ EBS gp3 支持**在线扩容到 16 TB，无停机**：将来真不够，1 条 AWS CLI 命令搞定
- ❌ **不推荐 1 TB**：3 年用不到，每月多花 $60，年浪费 ~$720
- ❌ **不推荐 100 GB**：稳态已占 35%，业务 2× 就告急，运维频次高

#### 为什么不用 Instance Store（实例存储）？

很多人会想：m6i.2xlarge 没自带 NVMe instance store，但 m5d / i3 系列有，岂不是更快更便宜？

**坚决不用 instance store 作为 CH 主存储**：
1. **实例停止 = 数据销毁**：AWS instance store 是 ephemeral 的，机器一旦 stop（不只是 reboot）数据就没了
2. **EBS 是网络存储但已足够快**：gp3 250 MB/s 对 CH 顺序读完全够用
3. **可以用 instance store 做临时空间**（如 CH 的 `tmp_path` 用于大查询溢盘），但**不能做数据盘**

### 2.6 数据同步：为什么用 AWS DMS → S3 → ClickHouse S3Queue？

**推荐方案：AWS DMS（Database Migration Service）以 CDC 模式从 MySQL 增量同步到 S3，ClickHouse 用原生 S3Queue 引擎自动消费入库。**

#### 推荐架构

```
MySQL binlog (ROW 模式)
    ↓
AWS DMS replication instance (dms.t3.medium, 全托管)
    ↓
S3 staging bucket (Parquet 文件，每 1–2 分钟刷新)
    ↓
ClickHouse S3Queue Engine 表
    ↓ Materialized View
ReplicatedMergeTree L0 事实表
```

#### 选 DMS 的核心理由

| 维度 | DMS（推荐） | Debezium + MSK | 自建 Kafka |
|---|---|---|---|
| 业务侵入 | 零 | 零 | 零 |
| 运维成本 | **极低（AWS 全托管）** | 中 | 高 |
| 月成本 | $75（dms.t3.medium） | ~$150 | ~$50 |
| 配置复杂度 | **低（控制台几下出 task）** | 中 | 高 |
| 延迟 | 1–2 分钟 | 5–10 秒 | 5–10 秒 |
| 适合场景 | **运营后台（本项目）** | 实时风控 / 交易链路 | 极致省钱场景 |

**对本项目来说"延迟 1–2 分钟" 完全可接受**：
- 运营人员看的是聚合后的趋势 / 统计，不是实时交易流
- 旧 MySQL 报表系统延迟以「天」计算，DMS 已是质的提升
- 节省的 Kafka 运维心智可以投入到业务和 schema 优化上

#### DMS 配置要点

| 项 | 配置 |
|---|---|
| 实例规格 | dms.t3.medium（单 AZ，$75/月）。需要 HA 时升 Multi-AZ ~$150/月 |
| 源端 | MySQL（启用 binlog ROW 模式 + binlog_row_image=FULL） |
| 目标端 | S3 endpoint，格式 Parquet + gzip 压缩 |
| 模式 | Full Load + CDC（先全量回灌历史，再增量同步） |
| 刷新策略 | 每 1 分钟或累计 64 MB 刷一个文件 |
| 同步对象 | `deposit_flow` / `swap_flow` / `aggregation_flow`（按需追加） |
| 监控 | DMS task metrics → CloudWatch → SNS 告警 |

#### S3 staging bucket 设计

```
s3://ccpayment-cdc-staging/
├── deposit_flow/year=2026/month=05/day=14/hour=10/*.parquet
├── swap_flow/year=2026/...
└── aggregation_flow/year=2026/...
```

**Lifecycle 策略**：CH 消费完成 7 天后自动删除（原始 CDC 文件不需要长期保留，CH 已是真理来源）。月成本 < $1。

#### ClickHouse 消费端

ClickHouse 24.x 原生支持 `S3Queue` 引擎，**类比 Kafka 引擎但消费 S3**：

```sql
-- S3Queue 引擎：自动 poll S3 prefix，单次消费保证 exactly-once
CREATE TABLE s3q_deposit (
  -- 与 raw_deposit 字段一致
) ENGINE = S3Queue('s3://ccpayment-cdc-staging/deposit_flow/**/*.parquet', 'Parquet')
SETTINGS
  mode = 'unordered',
  s3queue_polling_min_timeout_ms = 30000,    -- 30s 轮询
  s3queue_keeper_path = '/clickhouse/s3queue/deposit';

-- MV 自动把消费数据落到 L0 事实表
CREATE MATERIALIZED VIEW mv_ingest_deposit
TO raw_deposit AS
SELECT * FROM s3q_deposit;
```

CH Keeper 自动追踪已消费文件，重启或扩副本时不会重复消费。

#### 其他方案（仅记录，本项目不采用）

> 以下方案在本场景下都被否决，仅供完整性记录。如未来需求变化（如要求秒级延迟、多下游分发），可参考演进。

**A. Debezium + AWS MSK（完整 CDC 链路）**
延迟 5–10 秒，灵活性最高；但月成本 +$80、运维复杂度上一档；仅在未来引入实时风控 / 多下游消费时考虑。

**B. Debezium 同机 + 自建 Kafka（极简自建）**
月成本最低（~$50），但与 CH 抢资源、单点风险高、需 Kafka 运维经验；不推荐生产长跑。

**C. MaterializedMySQL（CH 内置 binlog 引擎）**
官方仍标记为 Experimental（CH 24.x），DDL 变更易导致同步中断；不建议生产。

**D. 应用层双写（业务代码同时写 MySQL + 队列）**
业务侵入 + 一致性弱；否决。

**E. 定时 ETL（每 N 分钟批 SQL）**
退回旧 MySQL 报表模式，违背重构初衷；否决。

### 2.7 为什么用物化视图而非定时跑批？

**这是整个方案的灵魂决策。**

#### 旧 MySQL 模式（要否决的）

```
定时任务（每天凌晨）
    ↓
跑 SQL 生成「日报」「周报」「月报」「季度报」表
    ↓
前端只能消费这些固定口径
    ↓
运营想看「3.7-4.21」？→ 没数据，等开发新建一个报表
```

**问题**：本质是把"灵活的时间筛选"权力锁死在开发手里。

#### 新方案：物化视图（MV）+ AggregatingMergeTree

```
L0 事实表（原始流水）
    ↓ INSERT 触发
Materialized View（增量计算，无 cron）
    ↓
L1 日级聚合表（AggregatingMergeTree）
    ↓ 查询时
任意 GROUP BY toMonday(date) / toStartOfMonth(date) / ...
```

**关键点**：
1. **MV 是 INSERT 触发，不是 cron**：每来一条流水，30 秒内 L1 累加完成
2. **只做"日"这一层聚合**：周/月/季都在查询时切窗，**完美对齐 README §2.1.2 的 rolling-from-end 语义**
3. **运营选「3.7-4.21」**：直接 `WHERE date BETWEEN '2026-03-07' AND '2026-04-21' GROUP BY merchant_id`，子秒级返回

#### 物化视图设计

| 层 | 引擎 | 主键 | 解决问题 |
|---|---|---|---|
| **L0 raw_deposit / raw_swap / raw_aggregation** | `ReplicatedMergeTree` | `(merchant_id, event_time)` PARTITION BY toYYYYMM | 明细页 / DrillModal / 抽屉 |
| **L1 mv_daily_merchant** | `AggregatingMergeTree` | `(date, merchant_id)` PARTITION BY toYYYYMM | KPI 表、商户排行 |
| **L1 mv_daily_region** | `AggregatingMergeTree` | `(date, region)` | 地区分布饼图 |
| **L1 mv_daily_industry** | `AggregatingMergeTree` | `(date, industry)` | 行业分布饼图 |
| **L1 mv_daily_finance** | `AggregatingMergeTree` | `(date, currency, biz_line)` | 财务看板 |

#### 与项目 README 的对齐

- README §2.1.5「单一数据源 + 桶聚合」 → L0 是真理来源，L1 是同源聚合
- README §2.1.6「累计行 B 口径」 → `uniqExact` 精确去重，符合"窗口内去重商户数"
- README §2.1.2「rolling-from-end 周期」 → 查询时切窗，物化视图天然支持

### 2.8 为什么维度表用 Dictionary 而非镜像？

商户元数据（id / name / region / industry / status）这种「**小表 + 高频 join + 变化慢**」的场景，ClickHouse Dictionary 是为它量身定制的：

```sql
CREATE DICTIONARY merchant_dim (
  id UInt64,
  name String,
  region String,
  industry String,
  status UInt8
)
PRIMARY KEY id
SOURCE(MYSQL(
  host '...' port 3306
  user 'readonly' password '...'
  db 'ccpayment' table 'merchants'
))
LIFETIME(MIN 300 MAX 600)  -- 5–10 分钟刷新
LAYOUT(HASHED());
```

**优势**：
- ✅ 直接 `dictGet('merchant_dim', 'industry', 12345)` 替代 JOIN，O(1) 内存查表
- ✅ 不需要 CDC 同步维度变更，每 5 分钟自动刷
- ✅ 不占 CH 主存储

**对比 JOIN**：
- ❌ CH 的 JOIN 是右表全量广播到内存做 hash，10w 商户 × ~500B = 50MB 内存，5 并发 = 250MB，每查询都重复加载
- ❌ 维度更新还要走 CDC，链路长

### 2.9 为什么用 Redis 缓存？

```
运营请求 → API → Redis（命中？）
                      ↓ 否
                    ClickHouse → 写入 Redis（TTL 5min）→ 返回
```

**性价比最高的优化**：
- 运营点开商户数据页 = 9 个卡片并发请求
- 同一个时间窗 + unit 的请求短时间内重复率极高（运营会反复刷）
- 5 分钟 TTL 内的二次请求 = 0 CH 负载

**Redis 选型**：
- AWS ElastiCache for Redis，`cache.t4g.micro`（2 vCPU / 0.5 GB）≈ $13/月
- 或直接在同一台 EC2 装 Redis（够用，省 $13/月）

### 2.10 为什么 API 用批接口？

❌ 反例：商户数据页 9 个卡片 = 9 个 HTTP 请求 = 9 个 CH 连接 = 5 并发用户 × 9 = 45 个 CH 连接同时打过来

✅ 推荐：
```
POST /api/merchant/dashboard
Body: { from, to, unit }
Response: {
  kpiTable: {...},
  trendChart: {...},
  regionDistribution: {...},
  industryDistribution: {...},
  rankings: { deposit: [...], swap: [...] },
  feeRanking: { service: [...], swap: [...], aggregation: [...] }
}
```

后端用 CH 的 multi-query（一次 TCP 连接发多条 SELECT）+ 并发 await，前端一次拿全。

**收益**：
- 5 并发 × 9 卡片 = 45 CH 查询 → 缩减为 5 个连接 × 1 批 = 5 个 CH 连接
- 减少 HTTP 握手 / TLS 开销
- 缓存粒度更粗，命中率更高

---

## 三、整体架构

### 3.1 系统架构图

```
┌──────────────────────────────────────────────────────────────────────┐
│                       生产 MySQL（业务事务库）                          │
│   merchants / deposit_flow / swap_flow / aggregation_flow / users    │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ binlog (ROW 模式)
                                 ▼
                       ┌──────────────────┐
                       │   AWS DMS        │  dms.t3.medium 单 AZ
                       │   (CDC 模式)     │  全托管，零运维
                       └────────┬─────────┘
                                ▼ Parquet 文件，每 1–2 分钟
                       ┌──────────────────┐
                       │   AWS S3         │  CDC staging bucket
                       │   (staging)      │  7 天 lifecycle 自动清理
                       └────────┬─────────┘
                                ▼ S3Queue 引擎自动 poll
┌──────────────────────────────────────────────────────────────────────┐
│           ClickHouse 单节点  EC2 m6i.2xlarge (8c32g)                   │
│                                                                       │
│   S3Queue 表 ──MV──► raw_deposit / raw_swap / raw_agg (L0)           │
│                              │                                        │
│                              ├──MV──► mv_daily_merchant   (L1)        │
│                              ├──MV──► mv_daily_region     (L1)        │
│                              ├──MV──► mv_daily_industry   (L1)        │
│                              └──MV──► mv_daily_finance    (L1)        │
│                                                                       │
│   Dictionary: merchant_dim  ◄── MySQL，TTL 5 min                      │
│                                                                       │
│   EBS gp3 300GB（数据 + WAL，可在线扩）                                 │
└────────────────┬──────────────────────────────────┬──────────────────┘
                 │                                  │
                 │ 每日 BACKUP                      │ SQL
                 ▼                                  ▼
        ┌────────────────┐                ┌─────────────────┐
        │  AWS S3        │                │  Backend API    │
        │  + Glacier IA  │                │  Go/Java/Node   │
        │  (跨 AZ)       │                │  + Redis 缓存   │
        └────────────────┘                └────────┬────────┘
                                                   │ REST/JSON
                                                   ▼
                                          ┌─────────────────┐
                                          │  React 前端      │
                                          │  数据看板        │
                                          └─────────────────┘
```

### 3.2 AWS 资源清单

| 资源 | 规格 | 数量 | 用途 |
|---|---|---|---|
| EC2 `m6i.2xlarge` | 8 vCPU, 32 GB | 1 | ClickHouse 主节点 |
| EBS `gp3` | 300 GB, 6000 IOPS, 250 MB/s | 1 | CH 数据盘（可在线扩容） |
| **DMS replication instance** | `dms.t3.medium` 单 AZ | 1 | MySQL → S3 CDC 全托管同步 |
| **S3 bucket（CDC staging）** | 标准存储 | 1 | DMS 输出的 Parquet 文件中转区，7 天 lifecycle |
| ElastiCache `cache.t4g.micro` | 2 vCPU, 0.5 GB | 1 | Redis 缓存（或与 API 同机部署） |
| S3 bucket（备份） | 标准存储 + Glacier IA | 1 | CH 数据备份 30 天热 + 3 年归档 |
| VPC | - | 1 | 私有网络隔离 |
| Security Group | - | 3 | EC2 / DMS / Redis 各一组 |
| CloudWatch | - | - | 监控与告警 |
| IAM Role | - | 3 | EC2 → S3、DMS → S3、CH → S3Queue |

### 3.3 网络拓扑

```
VPC: 10.0.0.0/16 [us-east-1]
├── Private Subnet A (10.0.1.0/24) [us-east-1a]
│   ├── EC2 ClickHouse  (10.0.1.10)
│   ├── DMS replication (10.0.1.20)
│   └── ElastiCache     (10.0.1.30)
├── Application Subnet (10.0.10.0/24)
│   └── Backend API (现有，复用)
└── VPC Endpoint → S3（避免走公网，省 NAT 流量费）
```

**安全组规则**：
- ClickHouse: 仅接受 Backend API 子网的 9000/9440 (TCP/native) + 8123/8443 (HTTP)
- DMS: 仅接受 VPC 内部 + 出站连 MySQL 源端 + 出站连 S3 endpoint
- S3 Gateway Endpoint：让 CH / DMS 通过私网访问 S3，免 NAT Gateway 流量费

---

## 四、ClickHouse Schema 设计

### 4.1 表结构概览

```sql
-- ============================================================
-- L0: 原始流水事实表（含 CODEC 列级压缩 + TokenBF 跳数索引）
-- ============================================================

CREATE TABLE raw_deposit ON CLUSTER '{cluster}' (
  event_id       UInt64        CODEC(Delta, ZSTD(1)),
  merchant_id    UInt64        CODEC(T64, ZSTD(1)),
  user_id        UInt64        CODEC(T64, ZSTD(1)),
  event_time     DateTime64(3) CODEC(DoubleDelta, ZSTD(1)),
  amount_usd     Decimal(18, 6) CODEC(T64, ZSTD(1)),
  amount_native  Decimal(18, 6) CODEC(T64, ZSTD(1)),
  currency       LowCardinality(String),
  chain          LowCardinality(String),
  network_fee    Decimal(18, 6) CODEC(T64, ZSTD(1)),
  service_fee    Decimal(18, 6) CODEC(T64, ZSTD(1)),
  status         LowCardinality(String),
  remark         String         CODEC(ZSTD(3)),  -- 长文本走更高 ZSTD 级别
  -- ... 业务字段

  -- TokenBF 跳数索引：加速商户名 / 备注的模糊搜索
  INDEX idx_remark remark TYPE tokenbf_v1(8192, 3, 0) GRANULARITY 4
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/raw_deposit', '{replica}')
PARTITION BY toYYYYMM(event_time)
ORDER BY (merchant_id, event_time, event_id)
TTL toDateTime(event_time) + INTERVAL 3 YEAR
SETTINGS index_granularity = 8192;

-- 类似创建 raw_swap, raw_aggregation

-- ============================================================
-- L1: 日级物化视图
-- ============================================================

CREATE TABLE mv_daily_merchant ON CLUSTER '{cluster}' (
  date              Date,
  merchant_id       UInt64,
  deposit_count     AggregateFunction(count),
  deposit_amount    AggregateFunction(sum, Decimal(18, 6)),
  network_cost      AggregateFunction(sum, Decimal(18, 6)),
  service_fee       AggregateFunction(sum, Decimal(18, 6)),
  uniq_users        AggregateFunction(uniqExact, UInt64)
) ENGINE = ReplicatedAggregatingMergeTree('/clickhouse/tables/{shard}/mv_daily_merchant', '{replica}')
PARTITION BY toYYYYMM(date)
ORDER BY (date, merchant_id);

CREATE MATERIALIZED VIEW mv_daily_merchant_consumer
TO mv_daily_merchant AS
SELECT
  toDate(event_time) AS date,
  merchant_id,
  countState() AS deposit_count,
  sumState(amount_usd) AS deposit_amount,
  sumState(network_fee) AS network_cost,
  sumState(service_fee) AS service_fee,
  uniqExactState(user_id) AS uniq_users
FROM raw_deposit
GROUP BY date, merchant_id;

-- 类似创建 mv_daily_region, mv_daily_industry, mv_daily_finance
```

### 4.2 查询示例（与 README 对齐）

#### 商户数据 KPI 表 — "本周 reg/ver/txn/idle"
```sql
SELECT
  countMergeIf(deposit_count, deposit_count > 0) AS txn_merchants,
  countMergeIf(deposit_count, deposit_count = 0) AS idle_merchants,
  uniqExactMerge(uniq_users) AS active_users
FROM mv_daily_merchant
WHERE date BETWEEN '2026-05-06' AND '2026-05-12';
```

#### 充值排行 Top 10
```sql
SELECT
  merchant_id,
  dictGet('merchant_dim', 'name', merchant_id) AS name,
  sumMerge(deposit_amount) AS total
FROM mv_daily_merchant
WHERE date BETWEEN ? AND ?
GROUP BY merchant_id
ORDER BY total DESC
LIMIT 10;
```

#### 地区分布饼图
```sql
SELECT
  region,
  sumMerge(deposit_amount) AS total
FROM mv_daily_region
WHERE date BETWEEN ? AND ?
GROUP BY region;
```

#### 抽屉 TxnDrawer — 单商户日级笔数
```sql
SELECT
  date,
  countMerge(deposit_count) AS count,
  sumMerge(deposit_amount) AS deposit
FROM mv_daily_merchant
WHERE merchant_id = ? AND date BETWEEN ? AND ?
GROUP BY date ORDER BY date;
```

### 4.3 关键设计原则

| 原则 | 体现 |
|---|---|
| **分区裁剪** | `PARTITION BY toYYYYMM(event_time)` — 查询带时间过滤可跳过无关分区 |
| **主键排序** | `ORDER BY (merchant_id, event_time)` — 按商户连续存储，单商户查询极快 |
| **数据 TTL** | `TTL event_time + INTERVAL 3 YEAR` — 自动清理 3 年前数据 |
| **低基数字段** | `LowCardinality(String)` — 币种、链等字段压缩比再提升 5× |
| **CODEC 列级压缩** | 时序字段 `DoubleDelta + ZSTD`、整数 `T64 + ZSTD`、长文本 `ZSTD(3)` — 磁盘再省 30–50% |
| **TokenBF 跳数索引** | 商户名 / 备注模糊搜索从全表扫降到亚秒级 |
| **副本预留** | `ReplicatedMergeTree` 即使单节点也用 Replicated 引擎，未来加副本零迁移 |
| **物化视图增量** | `AggregateFunction(...) + xxxState() / xxxMerge()` — INSERT 触发 |

### 4.4 写入纪律（Batch Insert）

ClickHouse 极不喜欢小批量插入：每次 INSERT 都生成一个 part，merge 压力剧增，CPU/IO 抢资源会拖慢查询。**纪律**：

| 项 | 推荐值 |
|---|---|
| 单批次行数 | ≥ 5000 行 |
| 单批次时间窗 | ≤ 1 秒 |
| 写入并行度 | 单表 ≤ 4 个并发 producer |
| part 数告警阈值 | 单表 active parts > 300 触发 P2 告警 |
| 限流参数 | `parts_to_delay_insert=300` / `parts_to_throw_insert=600` |

我们的链路里这个纪律由 **DMS → S3 → ClickHouse S3Queue 引擎** 天然保证：
- DMS 按 64 MB / 1 分钟刷一个 Parquet 文件，单文件已是数千行级 batch
- S3Queue 消费时按文件粒度 INSERT，避免小批量
- MV 物化结果走 batch 写入 L1 表
- 不会出现"一条流水一个 INSERT"的反模式

---

## 五、运维与监控

### 5.1 备份策略

| 项 | 配置 |
|---|---|
| 备份方式 | ClickHouse 原生 `BACKUP DATABASE ccpayment TO S3(...)` |
| 频率 | 每日凌晨 03:00（业务低峰） |
| 保留 | 近 30 天在 S3 Standard，30 天后自动转 S3 Glacier IA，3 年后归档 Deep Archive |
| 跨 AZ | S3 默认跨 AZ 复制，单 AZ 故障不影响 |
| 验证 | 每周自动恢复一次到测试环境验证可用性 |
| 恢复时间 | 单库恢复 < 1 小时（取决于数据量） |

**Lifecycle 配置**：
```
S3 Standard           → 30 天 → S3 Glacier IA   → 1 年 → Glacier Deep Archive → 3 年后删除
$0.023/GB/月            $0.0125/GB/月              $0.00099/GB/月
```

### 5.2 监控指标

| 指标层 | 工具 | 关键指标 |
|---|---|---|
| OS 层 | CloudWatch Agent + node_exporter | CPU、内存、磁盘 IO、网络 |
| ClickHouse | 内置 `/metrics` endpoint + Prometheus | Query/sec、慢查询、Merge 队列、副本延迟、内存使用 |
| 业务层 | API metrics | p50/p95/p99 查询延迟、缓存命中率、错误率 |
| CDC | DMS task metrics + CloudWatch | CDCLatencySource / CDCLatencyTarget、S3 写入速率、错误数 |
| 摄取 | CH `system.s3queue` 表 | S3Queue 消费进度、未处理文件数 |
| 告警 | CloudWatch Alarms + SNS → 飞书/钉钉 | 见下方告警规则 |

### 5.3 告警规则

| 告警 | 触发条件 | 严重度 | 响应 |
|---|---|---|---|
| EC2 CPU > 80% 持续 5min | CloudWatch | P2 | 检查慢查询 |
| EBS 磁盘使用 > 70% | CloudWatch | P2 | 评估扩容或清理 |
| EBS 磁盘使用 > 85% | CloudWatch | P1 | 紧急扩容 |
| CH 内存使用 > 28GB | Prometheus | P1 | 检查 OOM 风险 |
| DMS CDCLatencyTarget > 5 min | CloudWatch | P2 | 检查 DMS task / 源端 binlog |
| S3Queue 未消费文件 > 100 | CH metric | P2 | 检查 CH 摄取能力 |
| 备份失败 | S3 事件 | P1 | 人工介入 |
| 查询 p95 > 1s 持续 10min | API metrics | P2 | 检查 CH 健康 |
| EC2 实例不可用 | CloudWatch | P0 | 触发 DR 流程 |

### 5.4 灾难恢复（DR）

**RTO < 1 小时，RPO < 24 小时**。

**故障场景与应对**：

| 场景 | 应对 | RTO |
|---|---|---|
| ClickHouse 进程 crash | systemd 自动重启 | < 1 min |
| EC2 实例宕机 | CloudWatch 触发 SNS → 运维拉起新实例 + EBS attach | ~15 min |
| EBS 卷损坏 | 从最近 EBS Snapshot 恢复 | ~30 min |
| 整个 AZ 故障 | 从 S3 备份在其他 AZ 拉起新 EC2 + 新 EBS | ~1 hour |
| 误删数据 | 从最近 S3 备份恢复（数据库级或表级） | ~30 min – 1 hour |

**DR 自动化**：
- Terraform 管理所有 AWS 资源，可一键复刻整套基础设施
- 恢复脚本：`scripts/restore-from-s3.sh <backup-id>` 一键恢复

---

## 六、成本估算

### 6.1 月度成本明细（AWS us-east-1 区，按需价）

**推荐方案成本（DMS → S3 → CH）**：

| 服务 | 规格 | 月成本（USD） |
|---|---|---|
| EC2 m6i.2xlarge（ClickHouse） | 8 vCPU / 32 GB | $280 |
| EBS gp3（300 GB + 6000 IOPS + 250 MB/s） | 300 GB | $44 |
| **DMS replication instance** | dms.t3.medium 单 AZ | **$75** |
| **S3 CDC staging（7 天 lifecycle）** | < 10 GB | **~$1** |
| ElastiCache cache.t4g.micro（可选，可省） | 2 vCPU / 0.5 GB | $13 |
| S3 备份（30 天 Standard + Glacier 归档） | ~100 GB | $5 |
| 数据传输（VPC Endpoint → S3 免流量费） | - | $2 |
| CloudWatch（日志 + 指标） | - | $15 |
| **小计** | | **~$435** |

**其他形态对比**（仅作参考，本项目不采用）：

| 形态 | 月成本 | 与推荐差异 |
|---|---|---|
| ⭐ **DMS 全托管（推荐）** | **~$435** | 基准 |
| Debezium + MSK 完整链路 | ~$515 | +$80：MSK 3 broker + Debezium EC2，换 5 秒级延迟 |
| Debezium 同机 + 自建 Kafka | ~$385 | -$50：省钱但运维复杂 + 单点风险 |

### 6.2 成本优化路径

| 措施 | 节省 | 适合时机 |
|---|---|---|
| 1 年 Savings Plan（EC2） | EC2 部分省 30% ≈ $90/月 | 上线 3 个月稳定后 |
| 3 年 RI（EC2） | EC2 部分省 50% ≈ $150/月 | 业务稳定 1 年后 |
| S3 Intelligent-Tiering | 备份成本省 30% | 立即可用 |
| 关闭夜间非必要监控 | $5–10/月 | 任何时候 |
| **预计 1 年稳定后实际月成本** | | **~$320–360** |

### 6.3 与现有方案对比

| 方案 | 月成本 | 灵活性 | 性能 |
|---|---|---|---|
| 当前 MySQL + 定时跑批 | 已沉没 | 差 | 长周期查询分钟级 |
| **ClickHouse 单机 + DMS** ⭐ | **~$435** | 优 | 子秒级 |
| AWS Redshift 最小集群 | ~$1500 | 优 | 子秒级 |
| Snowflake 按 credit | 不可控 | 优 | 子秒级 |

---

## 七、容量规划与扩展路径

### 7.1 3 年容量预测

按当前业务量假设（日均 50w 流水）：

| 时间点 | L0 数据量 | L1 数据量 | 总占用 | 300GB 余量 | 触发扩容? |
|---|---|---|---|---|---|
| 上线 1 年 | ~4 GB | ~2 GB | ~15 GB（含开销） | 95% | 否 |
| 上线 2 年 | ~9 GB | ~4 GB | ~25 GB | 92% | 否 |
| 上线 3 年 | ~14 GB | ~6 GB | ~35 GB | 88% | 否 |
| 上线 3 年 + 业务 3× | ~42 GB | ~18 GB | ~105 GB | 65% | 否 |
| 上线 3 年 + 业务 5× | ~70 GB | ~30 GB | ~175 GB | 42% | 否 |
| 上线 3 年 + 业务 10× | ~140 GB | ~60 GB | ~340 GB | -13% | **是，扩到 500GB** |

**结论**：300 GB 覆盖 3 年内业务 5 倍增长仍有余量。极端情况一行 AWS CLI 在线扩容到 500GB / 1TB，无停机。

### 7.2 扩展触发线

任何一条触发 = 启动扩容评估：

| 信号 | 阈值 | 触发动作 |
|---|---|---|
| 查询 p95 | > 1s 持续 1 周 | 调优 / 加副本 |
| 并发用户 | 单峰 > 15 | 加副本分担读 |
| EBS 使用率 | > 70% | 在线扩容 EBS（一行 CLI 无停机） |
| EBS 使用率 | > 85% | P1 紧急扩容 |
| 内存使用率 | > 75% 持续 | 升级到 m6i.4xlarge |
| CDC 延迟 | > 5 min 持续 | 检查 DMS task 状态 / 升级 dms.t3.medium → dms.r6i.large |
| 业务对延迟要求降到 < 30s | 持续 | 评估迁移到 Debezium + MSK |
| 故障容忍 | 运营投诉 RTO 1h 不可接受 | 重新评估是否启动 HA 升级（见 §7.3 备案） |

### 7.3 演进路径

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1 (M0+，长期): 单机稳态运行 ⭐                          │
│   m6i.2xlarge + 300GB gp3（可在线扩）                        │
│   + DMS → S3 → CH S3Queue 同步                              │
│   + 每日 S3 备份（RTO < 1h，足够内部运营后台）                │
│   月成本: ~$435                                              │
│                                                              │
│   按当前业务边界，3–5 年不计划升级                            │
└─────────────────────────────────────────────────────────────┘
```

**HA / 集群方案不在当前规划范围**。如未来出现以下任一触发条件，再启动升级评估：
- 运营投诉「故障容忍变低」（要求 RTO < 5 min）
- 业务规模 / 并发触发 §7.2 的扩展线
- 业务对 CDC 延迟降到 < 30 秒（届时评估 Debezium + MSK）
- 故障演练验证 RTO 1h 不再可接受

**潜在升级选项（备案，不立即执行）**：
- 加副本：第二台 m6i.2xlarge + Keeper，月成本 +$420，RTO < 1 min
- 垂直升级：m6i.2xlarge → m6i.4xlarge（16c64g），月成本 +$280
- 横向分片：2–4 节点 Distributed 表（当数据量 / 并发触顶时）

---

## 八、风险评估与缓解

| # | 风险 | 概率 | 影响 | 缓解措施 |
|---|---|---|---|---|
| 1 | 单点故障导致看板不可用 | 中 | 中 | 每日 S3 备份 + 自动化恢复脚本，RTO 1h |
| 2 | DMS 任务中断，数据滞后 | 中 | 中 | DMS task 监控 + CloudWatch 告警，重启即从 binlog 续读 |
| 3 | MySQL DDL 变更击穿 CDC | 中 | 中 | DDL 变更前 review DMS task；DMS 自动处理大多数 schema 变化，复杂变化保留手动重建脚本 |
| 4 | 业务量爆发式增长超预期 | 低 | 高 | Phase 2 副本扩容；存储 TTL 调整保留期 |
| 5 | 运营写出灾难性查询打挂 CH | 中 | 中 | 后端 API 做超时 + LIMIT 兜底；CH 设 max_memory_usage |
| 6 | EBS 性能不达预期 | 低 | 中 | gp3 IOPS/吞吐可热配置，无需停机 |
| 7 | ClickHouse 版本 bug | 低 | 中 | 固定 LTS 版本（24.3 LTS 等）；不轻易升级 |
| 8 | AWS us-east-1 区域级故障 | 极低 | 高 | 接受（已确认不做跨区域备份）；S3 本身跨 AZ 复制；如未来要求提高，可启用 S3 Cross-Region Replication（月成本 +$10） |
| 9 | 团队 ClickHouse 经验不足 | 中 | 中 | 内部团队自研（已确认不引入外部咨询）；文档化运维 SOP；后端工程师参与 PoC 阶段深度熟悉 |

---

## 九、实施计划

### 9.1 里程碑

| Phase | 周期 | 目标 | 交付物 |
|---|---|---|---|
| **M1: PoC** | 2 周 | 单机 CH + DMS 跑通商户数据模块一个卡片端到端 | Terraform 脚本 + DMS task + S3Queue + Schema + 一个 demo |
| **M2: MVP** | 4 周 | 商户数据模块所有 9 张卡片接入 CH | 完整 schema + MV + API + 前端联调 |
| **M3: 历史数据回灌** | 2 周 | **3 年全量** MySQL 流水通过 DMS Full Load 模式回灌到 CH，回灌完成后切换 CDC 模式 | DMS Full Load task + 行数 / 金额双口径校验报告 + 切换 CDC 演练记录 |
| **M4: 灰度** | 2 周 | 10% 运营流量切到新系统并行验证 | A/B 对照报告 |
| **M5: 全量切换** | 1 周 | 100% 切流，旧 MySQL 报表下线 | 切流计划 + 回滚方案 |
| **M6: 财务看板接入** | 4 周 | 财务看板模块上线 | 财务相关 MV + API + 前端 |
| **M7: 优化与 HA** | 持续 | 视监控数据决定是否加副本 | 监控报表 + 决策记录 |

**总周期**：约 15 周（3.5 个月）

### 9.2 团队配置

| 角色 | 投入 | 职责 |
|---|---|---|
| 后端工程师（主） | 1 FTE × 3 月 | CH schema、API、DMS task 配置；PoC 阶段深度熟悉 CH 运维 |
| DevOps / SRE | 0.3 FTE × 3 月 | Terraform、监控、备份、灾难恢复脚本 |
| 数据工程师（可选） | 0.5 FTE × 1 月 | 3 年历史数据回灌校验 |
| 前端工程师 | 已有 | 当前项目已就绪，仅需切换 API |

**已确认**：内部团队自研，不引入外部 ClickHouse 咨询。建议给后端工程师预留 1–2 周专项时间阅读 [ClickHouse 官方 Best Practices](https://clickhouse.com/docs/en/operations/tips) 并在 PoC 阶段实操调优。

---

## 十、技术选型对比总表

| 维度 | 选型 | 备选 | 关键理由 |
|---|---|---|---|
| 数据库 | ClickHouse 24.3 LTS | MySQL / Elasticsearch / Redshift | 列存 OLAP，资源效率最优 |
| 部署形态 | 单节点 + S3 备份 | 主备 / 集群 | 并发 5 + 内部系统，单机够用 |
| 云平台 / 区域 | AWS us-east-1 | 其他美国区域 / Tokyo / Singapore | 公司既定 AWS + 美国，不做跨区域备份 |
| 实例类型 | m6i.2xlarge | m7i / m6a / c6i / r6i | CPU:内存 = 1:4 完美匹配 CH |
| 存储 | EBS gp3 300GB | 1TB（浪费）/ 100GB（紧）/ io2 / instance store | 5× 余量 + 在线扩容，按需起步 |
| 数据同步 | **AWS DMS → S3 → S3Queue** | Debezium+MSK / MaterializedMySQL / 双写 | 全托管零运维 + 1–2 min 延迟运营完全可接受 |
| 未来升级路径 | Debezium + MSK | - | 业务对延迟降到秒级要求时再切 |
| 预聚合 | AggregatingMergeTree + MV | 定时跑批 | MV 是项目核心灵活性来源 |
| 维度数据 | Dictionary（直读 MySQL） | 镜像 / JOIN | 5 分钟自动同步，零运维 |
| 缓存 | Redis 5 min TTL | 无缓存 | 性价比最高的优化 |
| API 形态 | 批接口 | RESTful 一卡片一接口 | 减少 CH 连接数 |
| 备份 | S3 + Lifecycle | EBS Snapshot only | 跨 AZ 抗机房故障 + 成本低 |
| 监控 | CloudWatch + Prometheus | 只用一个 | OS + CH 分层监控 |
| IaC | Terraform | CloudFormation | 跨云能力 + 社区生态 |

---

## 十一、附录

### 11.1 关键 ClickHouse 配置

```xml
<!-- /etc/clickhouse-server/config.d/production.xml -->
<yandex>
  <max_concurrent_queries>20</max_concurrent_queries>
  <max_memory_usage>17179869184</max_memory_usage>  <!-- 16 GB -->
  <max_bytes_before_external_group_by>8589934592</max_bytes_before_external_group_by>  <!-- 8 GB 溢盘阈值 -->
  <max_bytes_before_external_sort>8589934592</max_bytes_before_external_sort>

  <mark_cache_size>5368709120</mark_cache_size>  <!-- 5 GB -->
  <uncompressed_cache_size>4294967296</uncompressed_cache_size>  <!-- 4 GB -->

  <merge_tree>
    <parts_to_delay_insert>300</parts_to_delay_insert>
    <parts_to_throw_insert>600</parts_to_throw_insert>
  </merge_tree>

  <backup>
    <s3>
      <endpoint>https://s3.us-east-1.amazonaws.com</endpoint>
      <access_key_id from_env="AWS_ACCESS_KEY_ID" />
      <secret_access_key from_env="AWS_SECRET_ACCESS_KEY" />
    </s3>
  </backup>
</yandex>
```

### 11.2 备份脚本（示例）

```bash
#!/bin/bash
# /opt/clickhouse/backup-daily.sh
# 每日凌晨 cron: 0 3 * * *

BACKUP_ID="ccpayment-$(date +%Y%m%d)"
clickhouse-client --query "
  BACKUP DATABASE ccpayment
  TO S3('s3://ccpayment-ch-backup/$BACKUP_ID/', 'AKIA...', '...');
"
# 上传完成事件 → SNS → 运维告警
aws sns publish --topic-arn arn:aws:sns:... --message "Backup $BACKUP_ID completed"
```

### 11.3 参考文档

- [ClickHouse 官方文档](https://clickhouse.com/docs)
- [ClickHouse Best Practices](https://clickhouse.com/docs/en/operations/tips)
- [ClickHouse S3Queue Engine](https://clickhouse.com/docs/en/engines/table-engines/integrations/s3queue)
- [AWS DMS 文档](https://docs.aws.amazon.com/dms/)
- [AWS DMS → S3 Target](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Target.S3.html)
- [AWS EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [项目 README](../README.md) — 商户数据模块功能需求

### 11.4 待技术负责人决策的开放问题

**已确认决策（不再讨论）**：
- ✅ HA 时机：单机起步，长期不规划主备 / 集群
- ✅ AWS 区域：us-east-1（美国），不做跨区域备份
- ✅ 历史数据：3 年 MySQL 流水**全量**回灌
- ✅ 团队能力：内部团队自研，不引入外部咨询

**仍待决策**：

1. **DMS 单 AZ vs Multi-AZ**：起步单 AZ（$75/月，DMS task 故障 RTO ~15 min）还是直接 Multi-AZ（$150/月，RTO < 1 min）？
2. **预算审批**：推荐方案 ~$435/月（按需）/ ~$345/月（1 年 SP）/ ~$320–360/月（1 年稳定后），是否过审？
3. **MySQL binlog 准入**：生产 MySQL 是否已开启 ROW 模式 binlog（`binlog_format=ROW` + `binlog_row_image=FULL` + 保留 ≥ 24 小时）？需要 DBA 配合检查与调整。
4. **历史数据回灌时间窗**：3 年历史 ~5.5 亿行，DMS Full Load 估时数小时到 1 天，是否能在低峰期跑（如周末）？需要 DBA 评估对源 MySQL 的影响。

---

**文档结束。如有疑问或需要深入某个决策点，欢迎讨论。**
