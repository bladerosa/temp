# CCPayment 运营后台 · 数据看板

商户数据 / 财务看板的生产实现。本文档完整记录当前项目状态及 **数据看板 → 商户数据** 模块的全部功能需求，作为后续生成 PRD 的源材料。

---

## 一、项目概览

### 1.1 技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| Bundler / Dev server | Vite 5 | `npm run dev` 默认 `5174` |
| 框架 | React 18 | StrictMode |
| 语言 | TypeScript ≥ 5.6 | strict / noUnusedLocals / noUnusedParameters |
| 路由 | react-router-dom v6 | `lazy()` + `<Suspense>`，路由常量集中在 `src/routes/paths.ts` |
| UI 框架 | MUI v5 + Emotion | `sx` prop only，禁用 `styled()` / 原始 CSS module |
| 数据可视化 | `@mui/x-charts` v7 | LineChart / BarChart / PieChart / SparkLineChart，全部带 hover tooltip |
| 日期控件 | `dayjs` + `@mui/x-date-pickers` (`AdapterDayjs`) | |
| 图标 | `lucide-react` | 不使用 `@mui/icons-material` |
| 状态管理 | MobX 6 + mobx-react-lite 4 | class store + `makeAutoObservable` + `observer` |
| API 层 | `src/api/` 薄函数模块（当前为空，未来对接后端） | mock 都在 `src/data/` |

### 1.2 运行命令

```bash
npm install
npm run dev        # http://localhost:5174 ， host: true 绑 0.0.0.0，局域网可访问
npm run build      # tsc -b && vite build
npm run preview    # 预览生产 build
npm run typecheck  # 仅 tsc
```

### 1.3 目录结构

```
src/
├── api/                       # 接 REST/RPC 的薄函数模块（当前空）
├── components/
│   ├── PageHeader / Segmented / EmptyState / ToastHost
│   ├── DonutChart (MUI X PieChart) / LineChart (MUI X compose) / Spark (SparkLineChart)
│   ├── DateRangePicker / KpiNumberCell / RankBars / FinancePie
│   ├── DrillModal / TxnDrawer / AdvancedFilterDialog
├── data/
│   ├── types.ts               # PeriodUnit / RegionMetric / Merchant / IndustryCode 等
│   ├── kpi.ts                 # 周期标签、periodData、restData、totalDataFor、expandRestPeriods
│   ├── merchantSeries.ts      # 「日级数据真理来源」+ 通用 bucket 工具
│   ├── merchants.ts           # 20 个商户 mock + RANK_DATA
│   ├── regions.ts             # 6 大洲 + 各洲国家明细
│   ├── industries.ts          # 7 个行业 + INDUSTRY_META
│   ├── trend.ts               # aggTrendByUnit(unit, from, to)
│   ├── rate.ts                # AGGREGATION_FEE_DETAIL（归集费）
│   ├── serviceFee.ts          # SERVICE_FEE_DETAIL（充值服务费）
│   ├── swapFee.ts             # SWAP_FEE_DETAIL（换币服务费）
│   └── finance.ts             # 财务看板 mock
├── layouts/dashboard/         # DashboardLayout / Sidebar / Header
├── pages/
│   ├── MerchantPage           # 商户数据
│   ├── DetailPage             # 查看交易统计
│   ├── AggregationFeeDetailPage
│   ├── ServiceFeeDetailPage
│   ├── SwapFeeDetailPage
│   ├── FinancePage / SystemPage / NotFoundPage
├── routes/                    # index.tsx + paths.ts + AuthGuard.tsx (stub) + PageLoader.tsx
├── stores/                    # UiStore / ToastStore / MerchantStore / FinanceStore / DetailStore + RootStore
├── theme/                     # palette / typography / shadows / components + tokens.css（含打印样式）
├── utils/                     # csv.ts / format.ts / dateRange.ts（统一日期格式工具）
├── App.tsx
└── main.tsx
```

### 1.4 路由

| URL | 页面 | 面包屑 |
|---|---|---|
| `/` | 重定向 → `/dashboard/merchant` | – |
| `/dashboard/merchant` | 商户数据 | 数据看板 / 商户数据 |
| `/dashboard/merchant/detail` | 查看交易统计 | 数据看板 / 商户数据 / 查看交易统计 |
| `/dashboard/merchant/aggregation-fee-detail` | 用户支付归集费明细 | 数据看板 / 商户数据 / 用户支付归集费明细 |
| `/dashboard/merchant/service-fee-detail` | 用户支付充值服务费明细 | 数据看板 / 商户数据 / 用户支付充值服务费明细 |
| `/dashboard/merchant/swap-fee-detail` | 用户支付换币服务费明细 | 数据看板 / 商户数据 / 用户支付换币服务费明细 |
| `/dashboard/finance` | 财务看板（不在本文档范围） | 财务数据看板 / 财务看板 |
| `/dashboard/system` | 系统数据占位 | 数据看板 / 系统数据 |
| `*` | NotFoundPage（404 + 返回 CTA） | – |

---

## 二、数据看板 → 商户数据 模块

### 2.1 全局约定（适用于本模块所有页面与卡片）

#### 2.1.1 时间段显示格式
- **统一格式**：`YYYY.MM.DD-YYYY.MM.DD`
- **单日折叠**：start === end 时只显示 `YYYY.MM.DD`，不写重复
- **应用范围**：KPI 表行标签、图表 x 轴 / tooltip、DateRangePicker 显示条、所有 banner 提示、抽屉 / 明细页的日期列、CSV 导出列
- **工具函数**：`@/utils/dateRange.ts` 的 `fmtDot` / `fmtRange` / `fmtRangeStr`

#### 2.1.2 周期单位语义（rolling-from-end）
所有周期粒度 tab（日 / 周 / 月 / 季）都用 **以筛选终点为锚的固定长度滚动窗口**，**不**按日历自然周 / 月 / 季：

| 单位 | 跨度 |
|---|---|
| 日 | 1 天 |
| 周 | 7 天滚动 |
| 月 | 30 天滚动 |
| 季 | 90 天滚动 |

举例（终点 `2026.05.12`）：
- 日：`2026.05.12 / 2026.05.11 / 2026.05.10 / ...`
- 周：`2026.05.06-2026.05.12 / 2026.04.29-2026.05.05 / ...`
- 月：`2026.04.13-2026.05.12 / 2026.03.14-2026.04.12 / ...`
- 季：`2026.02.12-2026.05.12 / 2025.11.14-2026.02.11 / ...`

#### 2.1.3 顺差 / 逆差色彩约定（中国股市风格）
凡涉及"我们挣钱 vs 亏钱"的 ± 值：

- **红色 (`error.main`)** = 顺差 = 用户支付费 > 平台成本 = 我们挣钱，渲染为 `+X` / `+x%`
- **绿色 (`success.dark`)** = 逆差 = 我们亏钱，渲染为 `-X` / `-x%`
- **灰色 (`text.secondary`)** = 平（diff = 0）

#### 2.1.4 全局筛选窗口
- **MerchantStore** 持有三个全局字段：`globalFrom` / `globalTo` / `globalPreset`
- 商户数据页顶部 DateRangePicker 是**全模块唯一的时间筛选入口**
- 所有 9 张卡片、所有图表、所有明细页都受这个窗口控制
- DateRangePicker 预设：今日 / 本周 / 本月 / 近30天 / 近90天 / 本季度 / 今年至今 + 下方两个 date input 作为自定义编辑器（无单独的"自定义"按钮）

#### 2.1.5 数据真理来源（单一数据源 + 桶聚合）
为保证「卡片 ↔ 明细页 ↔ 抽屉」之间数字始终对齐：

- 每个商户的「日交易笔数」由 [`merchantDailyTxnCount`](src/data/merchantSeries.ts)（基于 `merchant.id` 的确定性扰动）唯一生成
- 平台级日数据（reg/ver/txn/idle）由 [`platformDailyTrend(seriesKey, dayIndex)`](src/data/merchantSeries.ts) 唯一生成
- 任何按周/月/季展示的数值都通过 [`bucketRanges`](src/data/merchantSeries.ts) + `bucketSum` / `bucketAvg` 对**同一份日级数据**做聚合
- 任何切换周期粒度的操作 = 重新对同一份日级数据切片，不重新生成

#### 2.1.6 累计行口径（B 方案）
KPI 表「累计」行：
- **reg / ver**：严格列求和（最近 N 期 + 其余时间）
- **txn / idle**：窗口内**去重**商户数，与周期粒度解耦，按窗口天数 `1 − exp(−days/30)` 平滑插值，封顶 1820 / 388
- **regUsers / verUsers**：生命周期累计 26418 / 5193（不随窗口变）

实现：[`totalDataFor`](src/data/kpi.ts)

#### 2.1.7 生成 PDF
- 商户数据页头有「生成 PDF」按钮，调 `window.print()`
- 打印态由 [`src/theme/tokens.css`](src/theme/tokens.css) `@media print` 控制：
  - 隐藏：侧栏、顶栏、所有 `[data-no-print="1"]`、所有 `[data-segmented="1"]`、所有 `MuiButton-root` / `MuiSelect-root` / `MuiIconButton-root`
  - 卡片 grid 容器加 `data-print-stack="1"` → 在打印时强制 `display: block`，每张卡占整页宽
  - 卡片去 box-shadow、加 1px border、break-inside 自然
  - 表头 `display: table-header-group`，每行 + SVG `break-inside: avoid`

#### 2.1.8 移动端适配
- 所有表格包 `<Box sx={{ overflowX: 'auto' }}><Table sx={{ minWidth: ... }}>`
- 多列 grid 容器 `gridTemplateColumns: { xs: '1fr', md: '...', lg: '...' }`，在 xs 自动堆叠
- PageHeader action 区域 `flexWrap: 'wrap'`
- DashboardLayout 在 md- 下侧栏改为临时 Drawer（汉堡按钮触发）

---

### 2.2 主页：商户数据 (`/dashboard/merchant`)

#### 2.2.1 页头

| 区块 | 内容 |
|---|---|
| 标题 | `商户数据` |
| 副标题 | `商户注册、验证及活跃度的多维分析与长周期对比` |
| 右侧操作区（打印时隐藏） | 「生成 PDF」按钮 + DateRangePicker |
| 紧跟其下的蓝色 banner | `当前筛选区间：<preset> (YYYY.MM.DD-YYYY.MM.DD) — 全板块数据已按此区间统一过滤` |

#### 2.2.2 卡片 1：商户数据 KPI 表

**目的**：显示最近 N 个周期内每个周期的商户增量与活跃情况。

**头部**：
- 卡片标题：`商户数据`
- 右上：「日 / 周 / 月 / 季」Segmented + 「明细查看」按钮 + 「导出 CSV」按钮

**表格列**（4 列）：
1. 新增注册量
2. 新增验证商户
3. 交易商户
4. 无交易商户

**行**（最多 12 行）：
- **最近 10 个周期**（窗口允许才显示 10，少于 10 个只显示实际可用的）
- **其余时间**（窗口内除最近 10 期之外的总和）—— 仅当 `periodsInWindow(unit, from, to) > 10` 时出现
- **累计**（按 §2.1.6 的 B 口径）

**单元格内容格式**：
- 新增注册量列：`X (注册商户:Y)`，X = 当期新增数，Y = 该周期结束时的累计注册商户数
- 新增验证商户列：`X (验证商户:Y)`
- 交易商户列：`X (P%)`，P = 当期 txn / (txn + idle)
- 无交易商户列：`X (P%)`

**交互**：
- 非 0 数字蓝色可点击 → 打开 DrillModal（§2.2.10）
- 0 显示为黑色不可点击
- 累计行底纹高亮（淡蓝），字重稍重
- 行 hover 高亮（`bg-subtle`）

**移动端**：表格包横向滚动容器，`minWidth: 720`

**导出 CSV**：包含 9 列（周期 / 新增注册量 / 注册商户(累计) / 新增验证商户 / 验证商户(累计) / 交易商户 / 交易商户占比 / 无交易商户 / 无交易商户占比），"其余时间"展开成逐周期明细，文件名含周期单位 + 起止日期，BOM 兼容 Excel 中文。

**明细查看按钮**：navigate 到 `/dashboard/merchant/detail`，并通过 `DetailStore.setCtx({ source: 'kpi-table' })` 告诉详情页是从 KPI 表来的（不带 rank 权重）。

**说明文本**：表格下方一行小字 `累计行口径：新增注册 / 新增验证按窗口列求和；交易 / 无交易按窗口去重，不随单位变化。`

#### 2.2.3 卡片 2：商户数 趋势

**头部**：
- 标题：`商户数 趋势`
- 右上：图例（4 个色点 + 系列名，**点击可切换显隐**）+ 「日 / 周 / 月 / 季」Segmented

**图表**：MUI X LineChart（compose 模式，`<ResponsiveChartContainer>` + `<LinePlot>` + `<MarkPlot>` + `<ChartsTooltip trigger="axis">`）

**系列**：
| 系列 key | 中文名 | 颜色 |
|---|---|---|
| reg | 新增注册 | `#BEE072`（lime） |
| ver | 新增验证商户 | `#E7B22B`（amber） |
| txn | 交易商户 | `#3C6FF5`（primary） |
| idle | 无交易商户 | `#919EAB`（grey） |

**数据来源**：[`aggTrendByUnit(unit, globalFrom, globalTo)`](src/data/trend.ts)，跨越全局筛选窗口，按当前 unit 切桶。每个桶值 = 该桶内 `platformDailyTrend(seriesKey, dayIndex)` 之和。

**Hover**：tooltip 显示「桶日期范围 + 各系列名: 值」。

**x 轴 label decimation**：根据 label 长度自适应（21 字符长 label 自动隔点显示）。

#### 2.2.4 卡片 3：商户地区分布

**头部**：
- 标题：`商户地区分布`
- 右上：5 个 metric Segmented：`注册数 / 验证数 / 交易商户数 / 交易额 / 无交易商户数`

**布局**：3 列网格（`minmax(240px,280px) 1fr 1fr`，xs 堆叠，打印态堆叠）

**列 1 — 环形饼图**（MUI X PieChart）：
- 6 个地区色块（无「其他」桶；6 大洲穷举整个地球）
- Hover 高亮某切片（`highlightScope: { faded: 'global', highlighted: 'item' }`）+ tooltip 显示「地区名: 值」
- 切片可点击 → 切换列 3 焦点地区
- 中心文字：metric ≠ gmv 时 `商户总数 / <total>`，gmv 时 `总交易额 (USDT) / <total>万`

**列 2 — 图例**：
- 6 行：色块 + 地区名 + 数值 + 百分比
- 每行可点击 → 切换列 3 焦点地区（与饼图切片点击效果一致）
- 当前焦点行底纹高亮（淡蓝）+ 字重 600

**列 3 — 焦点地区的国家明细**：
- 标题：`<焦点地区中文名> 国家明细`
- 横条列表：国旗 emoji + 国家名 + 进度条（按最大值归一）+ 数值
- gmv metric 时显示 `X 万`，其他 metric 显示整数
- 默认焦点 = `APAC`，点击地区饼图/图例切换

**6 个地区与各自国家**（按数据降序）：
- **APAC**（亚太）：新加坡 / 香港 / 日本 / 韩国 / 印尼 / 泰国 / 越南 / 菲律宾
- **EU**（欧洲）：德国 / 英国 / 法国 / 意大利 / 西班牙 / 荷兰 / 瑞士 / 波兰
- **NA**（北美）：美国 / 加拿大 / 墨西哥
- **LATAM**（拉美）：巴西 / 阿根廷 / 智利 / 哥伦比亚 / 秘鲁
- **MENA**（中东/北非）：阿联酋 / 沙特 / 土耳其 / 埃及 / 摩洛哥
- **AF**（撒哈拉以南非洲）：尼日利亚 / 南非 / 肯尼亚 / 加纳

#### 2.2.5 卡片 4：商户行业分布

**头部**：
- 标题：`商户行业分布`
- 右上：同上 5 个 metric Segmented（与地区分布 metric 独立，互不联动）

**布局**：2 列网格（`minmax(240px,280px) 1fr`，xs 堆叠）

**列 1 — 环形饼图**：
- 7 个行业色块；hover tooltip；中心文字同地区卡片

**列 2 — 图例**：色块 + 行业名 + 数值 + 百分比（无右侧 drilldown，因为行业是**单级字段**没有子级）

**7 个行业**（单级结构）：
1. 跨境电商
2. 数字资产 / 交易所
3. 在线博彩
4. 游戏 / 直播
5. SaaS 工具
6. 跨境收款 / 外贸
7. 其他

#### 2.2.6 卡片 5 & 6：充值排行 / 换币排行

两张卡片同构，仅指标不同。

**头部**：
- 标题：`充值排行` / `换币排行`
- 右上：Top N 下拉（`Top 10` / `Top 20`，无 Top 50）

**列表**（RankBars 组件）：
- 横向条形列表，每行：序号 + 名字 + Display ID + 进度条（按最大值归一）+ 数值（USDT 单位）
- 按 deposit / exchange 字段降序

**无底部 CTA**（之前的"查看交易统计 →"已移除）。

#### 2.2.7 卡片 7：用户支付充值服务费排名

**位置**：3 卡片 grid 第一列（与服务费 / 换币费 / 归集费同行）

**头部**：
- 标题：`用户支付充值服务费排名`
- 副标题：`顺差 (红色) = 充值服务费 > 平台网络 fee 成本，我们挣钱；逆差 (绿色) = 我们亏钱。`

**表格**（2 列）：
| 列 | 内容 |
|---|---|
| Display ID | 黑色 mono 字体 |
| 用户支付充值服务费用 | `金额` (黑色，加粗，tabular-nums) + `(±X.XX%)`（红/绿，rateDiff） |

**排序**：按 `serviceFee` 降序。

**底部**：「查看全部 →」link → `/dashboard/merchant/service-fee-detail`

#### 2.2.8 卡片 8：用户支付换币服务费排名

与卡片 7 同构，只是数据列名是 `用户支付换币服务费用`，副标题 `顺差 (红色) = 换币服务费 > 平台换币成本 fee...`，「查看全部 →」 → `/dashboard/merchant/swap-fee-detail`

#### 2.2.9 卡片 9：用户支付归集费排名

与卡片 7 / 8 同构：列名 `用户支付归集费用`，副标题挂 `平台归集费率：0.22%`，「查看全部 →」 → `/dashboard/merchant/aggregation-fee-detail`

排序 by `userFee` 降序。

#### 2.2.10 弹窗：DrillModal（KPI 表数字点击）

**触发**：点击 KPI 表任意非 0 数字单元格。

**头部**：
- 标题：`<指标名> · <周期 label>`，例如 `新增注册商户 · 2026.05.12-2026.05.18`
- 副标题：`共 X 家商户` （若 X > 500 追加 `，展示前 500 条`）
- 右上：`导出 CSV` 按钮 + `×` 关闭

**表格**：列因指标而异：
| metric | 列 |
|---|---|
| reg | 商户ID / 注册时间 |
| ver | 商户ID / 验证时间 |
| txn | 商户ID / 交易额 |
| idle | 商户ID / 最后一次交易时间 |

**分页**：20 / 页，顶部 / 底部各一组（共 N 页 + 跳页）。

**底部**：`显示 A – B 共 N 条` + 「← / 页码 1-5 / →」。

---

### 2.3 子页：查看交易统计 (`/dashboard/merchant/detail`)

**进入方式**：
1. 商户数据 KPI 表「明细查看」按钮（DetailStore.ctx = `{ source: 'kpi-table' }`）

**页头**：
- 标题：`← 查看交易统计` （← 是返回按钮）
- 副标题：`商户交易总览，可按金额、笔数等任意维度排序。`
- 右上：「高级筛选」按钮（有激活态指示点）+ 「导出 CSV」

**当前应用 tags**（若有）：一行 chip，每个可 × 删除，最右「清空全部」link。

**工具栏**：
- 左：按 `充值金额 / 换币金额` 排序下拉
- 右：搜索 `商户名 / Display ID`

**表格列**（8 列）：
1. 排名（带金 / 银 / 铜 / top10 配色）
2. 商户（头像 + 名 + Display ID mono）
3. 地区（chip）
4. 行业（中文行业名）
5. 充值金额 (USDT)
6. 换币金额 (USDT)
7. 交易笔数（= 商户 sparkline 数据之和）
8. 交易笔数变化趋势（sparkline）
9. 操作（详情按钮）

**sparkline**：
- 数据来源：[`merchantSparklineValues(m, globalFrom, globalTo)`](src/data/merchantSeries.ts) 再按 `merchant.unit` 切桶
- 显示宽度 `100%`（自适应单元格宽度，最小 120px）
- hover tooltip 显示「日期: YYYY.MM.DD-YYYY.MM.DD」+「交易笔数: X」
- 按 sortBy 切换颜色（充值蓝，换币 lime）

**分页**：20 / 页。

**移动端**：表格 `minWidth: 980` + 横向滚动。

**导出 CSV**：8 列（排名 / 商户名 / Display ID / 地区 / 行业 / sortBy 金额 / 其他金额 / 交易笔数），导出**经过当前筛选 + 排序的全量**。

#### 2.3.1 高级筛选对话框

**字段**：
1. 关键字（商户名 / Display ID 搜索）
2. 地区（多选 chip）—— SG / HK / MY / TH / PH / ID / VN / TW / KR / JP / AE / TR / BR
3. 行业（多选 chip）—— 7 个行业（同卡片 4）
4. 充值金额 (USDT) min / max
5. 交易笔数 min / max

**底部**：「重置全部」link + 取消 / 应用筛选 按钮

**应用后**：
- DetailPage 上方 chip 区域生成对应 applied tags：`关键字：xx` / `地区：SG, HK` / `行业：跨境电商, 数字资产 / 交易所` / `金额：A – B` / `笔数：A – B`
- 每个 chip 都可单独 × 删除（同步清空对应字段）

#### 2.3.2 抽屉：TxnDrawer（按商户查交易明细）

**触发**：DetailPage 表格末列「详情」按钮。

**头部**：
- 商户头像 + 名 + Display ID
- 第二行：📅 `<preset>（YYYY.MM.DD-YYYY.MM.DD，共 N 天）· 合计：充值 X · 换币 Y · N 笔`

**工具栏**：
- 「周期粒度」Segmented（日 / 周 / 月 / 季）—— 抽屉内独立选择，不影响全局
- 「导出 CSV」按钮

**表格**（4 列，全部可点击排序）：
1. 日期（YYYY.MM.DD 或 YYYY.MM.DD-YYYY.MM.DD）
2. 充值金额 (USDT)
3. 换币金额 (USDT)
4. 交易笔数

**数据语义**（保证 chart ↔ drawer parity）：
- 每行 `count` = 该桶内日交易笔数之和（由 `merchantSparklineValues + bucketSum` 计算）
- ∑ count 跨所有行 = DetailPage 该商户表格行的「交易笔数」单元格值
- `deposit` / `exchange` 按 `count / totalCount` **比例**从商户总额拆分到各桶 → 跨行求和 = DetailPage 该商户表格行的 USDT 总额

**分页**：12 / 页。

---

### 2.4 子页：用户支付充值服务费明细 (`/dashboard/merchant/service-fee-detail`)

**进入方式**：商户数据 卡片 7「查看全部 →」link。

**页头**：
- 标题：`← 用户支付充值服务费明细`
- 副标题：`红色 (顺差) = 用户支付充值服务费 > 平台网络 fee 成本，我们挣钱；绿色 (逆差) = 我们亏钱。`
- 右上：「导出 CSV」

**当前筛选区间** banner（与商户数据页同款）。

**工具栏**：
- 搜索框（搜索商户 ID）
- 下拉：`全部 (顺差 + 逆差) / 仅顺差 (挣钱) / 仅逆差 (亏钱)`

**表格列**（6 列，全部可点击排序）：
1. 商户 ID
2. 充值金额 (USD)
3. 充值笔数
4. 平台网络fee成本 → 格式 `X.XX (R%)`（金额 + 占充值金额的率）
5. 用户支付充值服务费用 → 格式 `X.XX (R%)`
6. 充值服务费利润 → 格式 `±X.XX (±R%)`，红 / 绿 / 灰

**分页**：20 / 页。
**移动端**：横向滚动，`minWidth: 920`。
**导出 CSV**：9 列（前 6 列展开成独立数值字段 + 比率字段）。

---

### 2.5 子页：用户支付换币服务费明细 (`/dashboard/merchant/swap-fee-detail`)

与 §2.4 同构，列重命名为：
| # | 列 |
|---|---|
| 1 | 商户 ID |
| 2 | 换币金额 (USD) |
| 3 | 换币笔数 |
| 4 | 平台换币成本fee |
| 5 | 用户支付换币服务费用 |
| 6 | 换币服务费利润 |

---

### 2.6 子页：用户支付归集费明细 (`/dashboard/merchant/aggregation-fee-detail`)

与 §2.4 同构，列重命名为：
| # | 列 |
|---|---|
| 1 | 商户 ID |
| 2 | 充值金额 (USD) |
| 3 | 充值笔数 |
| 4 | 平台支付归集成本 |
| 5 | 用户支付归集费用 |
| 6 | 归集利润 |

副标题挂 `平台归集费率：0.22%` 作为参考阈值。

---

## 三、数据规则汇总（PRD 写作要点）

### 3.1 周期分桶
- 任何窗口内的某 unit 桶数 = `Math.ceil(windowDays / span)`，span = {day:1, week:7, month:30, quarter:90}
- 桶 latest-first 排序（最近一桶在数组下标 0）
- 图表 x 轴需要 oldest-first，由调用方反转

### 3.2 累计行 B 口径
- 见 §2.1.6
- 不要让累计行变成"全平台快照"——必须随筛选窗口变化

### 3.3 Chart ↔ List ↔ Drawer 数字一致性
- 任何展示「交易笔数」的位置都必须能追溯到 `merchantDailyTxnCount` 这个唯一源
- 任何展示「充值金额 / 换币金额」分桶的位置，都必须按 `count / totalCount` 比例从总额拆分，保证 ∑ = 商户总额

### 3.4 红绿色一致性
- 每个涉及「我们挣钱 / 亏钱」的 ± 值都套同一套规则
- 不要用 success.main 或 error.main 以外的色（保持低饱和、不刺眼）

### 3.5 中心文字 / 金额单位
- gmv metric 下：饼图中心 `总交易额 (USDT) / X 万`，明细单元格 `X 万`
- 非 gmv：饼图中心 `商户总数 / Y`，明细单元格 `Y`（千分位）

### 3.6 单一时间筛选源
- 整个商户数据模块**只有一个**时间筛选入口（顶部 DateRangePicker）
- 所有卡片、所有图表、所有明细页都从 `MerchantStore.globalFrom / globalTo / globalPreset` 读
- 抽屉内的「周期粒度」Segmented 是**抽屉本地**状态（不回写全局）

---

## 四、与原型的对应

| 原型文件 | 生产位置 |
|---|---|
| `app.jsx` Sidebar / Appbar | `src/layouts/dashboard/` |
| `pages-merchant.jsx` | `src/pages/MerchantPage.tsx` + `src/data/{kpi,trend,regions,industries,merchants,merchantSeries,rate,serviceFee,swapFee}.ts` |
| `pages-detail.jsx` + `pages-detail-txn.jsx` | `src/pages/DetailPage.tsx` + `src/components/AdvancedFilterDialog.tsx` + `src/components/TxnDrawer.tsx` |
| `pages-finance.jsx` | `src/pages/FinancePage.tsx` + `src/data/finance.ts` + `src/components/FinancePie.tsx`（不在本文档范围） |
| `charts.jsx` 自研 SVG LineChart / Donut / Spark | 重写为 MUI X：`src/components/{LineChart,DonutChart,Spark}.tsx` 全部带 hover tooltip |
| `colors_and_type.css` | `src/theme/tokens.css` + `palette.ts` + `typography.ts` |
| `styles.css` | 已散到 `theme/components.ts` 各 MUI 组件 override 中 |
| `tweaks-panel.jsx` | 未移植（演示用）|

---

## 五、后续接入指引

1. **API 层**：`src/api/` 当前为空。按 skill 规范每个资源一个 `.ts`，导出一个对象，方法返回 `Promise`。
2. **数据替换**：把 `src/data/` 里的 mock 替换为 `api/` 调用 + MobX store 异步 action（`runInAction` 中赋值给 observable）。
3. **认证**：`src/routes/AuthGuard.tsx` 是透传 stub；接入认证时只替换这个文件。
4. **打印模板自定义**：进一步美化 PDF 可在 `tokens.css` 的 `@media print` 中追加规则（例如加封面页、卡片标题样式等）。
