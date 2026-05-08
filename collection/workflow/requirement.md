# 归集系统 — 需求说明（PRD 输入）

> 本文件来自项目所有者与 Claude 在多轮对话中共同沉淀的需求集合。
> 已经全部沉淀为可运行的交互原型，路径 `/Users/yuu/Documents/claude workspace/ccpayment-collection/`，dev server `http://127.0.0.1:5173`。

---

## 0. 项目背景

CCPayment 是面向商户的加密货币支付网关。其后台运营人员每日需要将散落在各个用户 / 公共充值地址中的加密资产「归集」到系统热钱包，以便后续做提现 / 结算 / 风控管理。

当前运营后台缺少专门的「归集」管理模块，运营人员只能依赖底层批量归集接口被动操作。本次需求是在现有运营后台中**新增一个完整的「归集系统」一级菜单**，提供自动化（按规则定时 / 事件触发）和手动两种归集方式，并提供任务级的可观测性。

> **重要技术前提**：底层归集接口接收的参数始终是 **token 数量（amount）**；UI 上以 USD 设定阈值只是为了方便运营人员使用，运行时由后端按预言机价格转换为 token 数量。

## 1. 模块架构

在左侧主菜单新增一级菜单「**归集系统**」，下属 3 个二级菜单：

| 二级菜单 | 路径 | 主要职责 |
|---|---|---|
| 自动归集 | `/collection/auto` | 列表 + 创建 / 编辑 / 删除 / 启停规则任务 |
| 手动归集 | `/collection/manual` | 一次性手动触发；先查询后归集；含异常资产分流 |
| 归集任务 | `/collection/jobs` | 自动 + 手动产出的所有归集事件统一记录 |

**默认进入**：`/collection/auto`。

> 「归集系统」以外的菜单项（数据看板、财务数据看板、活动中心、代币 / 网络管理、商户管理、TRX 能量租赁、交易查询、风控交易管理、投放、推广合作、对账、Sell USDT 申请、通知系统、运营系统日志、封禁 IP、邮件验证码列表）只在侧栏展示项目位置即可，**不在本期实现**。

---

## 2. 域模型 / 公共概念

### 2.1 chain 与 token

7 条 chain × 21 个 token，覆盖大部分主流链：

| chain | 名称 | 是否 TRX 系（额外能量/带宽统计） |
|---|---|---|
| TRX | TRON | ✅ |
| ETH | Ethereum | |
| BSC | BNB Chain | |
| POLYGON | Polygon | |
| BTC | Bitcoin | |
| SOL | Solana | |
| ARB | Arbitrum | |

每个 token 用 `chain:symbol` 复合 ID 标识（如 `TRX:USDT`、`ETH:USDC`）。

### 2.2 token 是否可折算 USD（关键属性）

部分 token（如游戏代币、memecoin、测试代币）没有可靠的 USD 预言机。本期模拟以下 3 个 token 为「**不可折算**」：

| tokenId | 说明 |
|---|---|
| `BSC:GAME` | 项目代币，无 USD 折算 |
| `SOL:MEME` | memecoin，无 USD 折算 |
| `ARB:TST` | 测试代币，无 USD 折算 |

**对 UX 的影响**：当用户在阈值设置中包含任一不可折算 token 时，UI 必须能让用户**直接以 token 原生数量**（amount，最多 8 位小数）作为归集阈值，而不是 USD。

### 2.3 收款地址类型

- **公共充值地址**（system pool）— 所有用户共享的入金地址
- **用户永久收款地址** — 平台为某个用户分配的固定地址

两种类型在归集逻辑上等同看待，只在地址明细中标识。

### 2.4 归集目标

所有归集都汇入「**系统热钱包**」。

### 2.5 「正常资产」与「异常资产」

风控系统会冻结部分地址中的资产（黑名单关联、可疑大额转入、异常出金频率、来源被标记、链上分析疑似洗钱关联等）。

- **正常金额** = 未被风控冻结的资产，归集时默认全部纳入
- **异常金额** = 已被风控冻结的资产，**默认不参与归集**，需要运营人员在表格中显式勾选才会一并发起

---

## 3. 自动归集（`/collection/auto`）

### 3.1 主页

- 顶部：4 张统计卡（总任务数 / 运行中 / 已停用 / 任务类型数）
- 中部：任务列表（表格）
  - 列：任务名 + ID、类型 chip、目标 chain·token（chip 形式 + "+N" 折叠）、关键参数、下次执行时间（事件驱动型显示「事件驱动」，定时型显示具体时刻）、状态（switch + chip）、操作（编辑 / 删除）
- 右上角：刷新按钮 + 「新建任务」按钮（primary）
- 工具条上方：类型筛选下拉（全部 / 4 种）

### 3.2 创建任务流程

两步走，全部在同一个 dialog 内：

**Step A：选类型** — 4 张 type-card（2×2），任选一张点击直接进入 Step B：
- 大额充值检测（large_deposit）
- 地址未活跃（inactive）
- 地址余额检测（balance_check）
- 提现不足触发（withdraw_short）

**Step B：填配置** — 统一字段 + 类型专属字段：

| 字段 | 是否所有类型共用 | 说明 |
|---|---|---|
| 任务名称 | ✅ | 必填 |
| 任务类型 | ✅（只读） | 自动填入 Step A 选择 |
| 目标 chain · token（多选） | ✅ | MultiTokenPicker；支持「全选所有」/「全选某 chain」/ chain 模糊搜索 / token 跨 chain 模糊搜索 |
| 阈值（统一为 AmountInput） | ✅ | 见 §3.4 |
| 重复触发最短间隔（cooldown） | 仅 large_deposit / withdraw_short | 数字 + 单位（分钟 / 小时 / 天） |
| 检测周期（schedule） | 仅 inactive / balance_check | 每 N + 单位（分钟 / 小时 / 天）+ 执行时刻（HH:mm） |
| 未活跃时长（inactiveWindow） | 仅 inactive | 数字 + 单位（天 / 周 / 月）— 注意单位与 schedule 不同 |

**底部**：返回上一步 / 取消 / **保存任务**（primary）。

**校验**（错误以 inline form-error 显示在 dialog 内底部，红色 + IconAlert）：
- 任务名不能为空
- 至少选 1 个目标 token
- 阈值合法（见 §3.4）
- cooldown.value > 0
- **同类型不允许目标 token 重复**：跨已存在任务，同 type 不能 target 同一个 tokenId。冲突时给出「{chain}·{symbol}（已被「{name}」占用）」错误描述。

新建任务**默认 enabled=false**，列表中以「已停用」chip 呈现，由用户主动 toggle 后才生效。

### 3.3 4 种任务类型逻辑

#### 3.3.1 大额充值检测（large_deposit）— 事件驱动

**触发**：当系统检测到任一充值地址（公共 + 用户永久）的目标 chain · token 收到 ≥ 触发金额（USD 或 amount）的入金时，**立即**对该地址该 token 单笔归集。

**重复触发最短间隔（cooldown）**：上一笔归集任务完成后，下一笔大额充值距离上次完成时长须 > cooldown 才会触发；处理中状态期间永远跳过。

**配置参数**：targets + triggerAmount + cooldown。

#### 3.3.2 地址未活跃（inactive）— 定时

**触发**：到达检测周期的执行时刻时，扫描所有充值地址的目标 chain · token，对在 `inactiveWindow`（天 / 周 / 月）时间范围内既无入金也无出金的地址，且当前余额 ≥ 最小归集金额者，发起归集。

**配置参数**：targets + inactiveWindow + minCollectAmount + schedule。

#### 3.3.3 地址余额检测（balance_check）— 定时

**触发**：到达检测周期的执行时刻时，扫描所有充值地址的目标 chain · token，对余额 ≥ 最小归集金额的地址发起归集。

**配置参数**：targets + minCollectAmount + schedule。

#### 3.3.4 提现不足触发（withdraw_short）— 事件驱动

**触发条件**（重要）：当系统执行某笔提现操作发现热钱包余额不足，**且**检测到该 chain · token 全量充值地址的「未归集金额」≥ 本次提现金额时，**异步**发起一次该 chain · token 的全地址归集请求（仅对 ≥ 最小归集金额的地址）。

**间隔规则**（必须强调）：
- 上一次归集任务**处理中**时，对同 chain · token 的新提现**永远跳过**本任务，不会再次触发；
- 上一次归集任务完成后，需经过 cooldown（分钟 / 小时 / 天）才会再次触发；冷却期内对同 chain · token 的提现直接跳过本任务的检测与执行。

**配置参数**：targets + minCollectAmount + cooldown。

### 3.4 阈值统一组件 AmountInput

支持 3 种状态，自动根据所选 targets 切换：

1. **全部可折算** → 单个 USD 输入（`step=0.01`，最多 2 位小数，`min=0.01`）
2. **全部不可折算** → 每个 target 独立的 token 数量输入（`step=0.00000001`，最多 8 位小数）
3. **混合** → 同时显示：
   - 一个 USD 输入（应用到所有可折算 token）
   - 一个 per-token 数量表（仅列出不可折算 token，每行单独填）

数据模型（AmountSpec）：

```ts
type AmountSpec = {
  usd: number;                       // 应用于可折算组
  amounts: Record<string, number>;   // 仅含不可折算 tokenId
};
```

校验：
- 含可折算 → usd > 0
- 每个不可折算 target 的 amount > 0

显示（任务列表关键参数列）：`≥ $50.00 · 200 GAME` 形式，多个 token 用 `·` 拼接。

### 3.5 任务列表行为

| 操作 | 触发 | 反馈 |
|---|---|---|
| 切换 switch | 立即生效 | 顶部 toast：「任务「{name}」已启用 / 已停用」（success/info, 3s） |
| 编辑 | 打开 Step B（跳过 Step A，类型只读） | — |
| 删除 | 打开二次确认 dialog | dialog **不可点击 mask 关闭、不响应 ESC**，强制点取消 / 删除按钮；删除后任务从列表移除 |

---

## 4. 手动归集（`/collection/manual`）

### 4.1 业务流程

两步：

**Step 1：选 chain·token + 设阈值 + 查询**
- chain·token 单选 picker（与自动归集复用同套搜索能力，但单选）
- 最小归集金额：可折算 token → USD（2 位小数）；不可折算 token → token 数量（8 位小数）
- 「预览」卡片：实时回显当前选择 + 阈值 + 是否标注「无 USD 折算」
- 「**查询未归集情况**」primary 按钮 → 600ms 模拟 → 查询完成后**平滑滚动**视口到 Step 2

**Step 2：未归集情况 + 异常地址表 + 提交**
- 顶部 3 张统计卡（数量为主、USD 为辅）：
  - 总未归集：`12,345.67 USDT` 大字 + `{$X · N 个地址}` hint
  - 正常数量：`...` + `{$X · N 个 · 占比 Y%}`
  - 异常数量：`...` + `{$X · N 个 · 占比 Y%}`
  - 不可折算 token 时 USD 部分自动省略
- 「异常金额地址表」：列 = 全选 checkbox / chain / token / 地址（mono, break-all）/ 金额（USD，不可折算时显示 `-`）/ 数量（8 位小数）
- 阈值变更**实时**重新过滤异常表（隐藏不达标行 + 给出「已根据当前阈值过滤掉 N 条不达标记录」提示）
- 提交说明 tip：「提交后将归集该 chain·token 中：· N 个正常地址（自动）· 你勾选的 M 个异常地址（其中 K 个因不满足阈值被忽略）」
- **空结果**：当满足阈值的正常 + 已勾选的异常合计 = 0 时，把 tip 替换为 **warn-tip**：「当前阈值下没有可归集的地址。请调低最小归集金额 / 数量，或在上方异常地址表中勾选要包含的地址。」
- 「**开始归集**」primary lg 按钮：合法时打开二次确认 dialog（**dismissable=false**）→ 确认 → 1.4s 模拟 → 顶部 success toast：「该次手动归集任务已提交 · 请在「归集任务」模块跟踪查询执行结果」→ 仅清空查询结果与勾选，**保留** chain / token / 阈值（让用户能立刻 query 同 token 或换 token 继续操作）

### 4.2 关键 UX

- 异常地址默认不归集，**只有勾选**的才会一并提交
- 阈值改动后：
  - 异常表行随之过滤
  - 已勾选但因阈值变高而失效的行，在 tip 中以「{N} 个因不满足最小归集金额已自动忽略」提示，但选中状态保留（用户调回阈值即可再次生效）

---

## 5. 归集任务（`/collection/jobs`）— 原「归集记录」改名

### 5.1 数据模型

每个底层批量归集接口的调用都对应**一条记录**。原子粒度：1 条记录 = 1 个 `{chain, tokenId}` 一次性的批量归集。

- 自动 / 手动任务涉及多 token 时，会被拆为多条记录（每个 token 一条），occurredAt 按队列实际执行时刻填写。
- 单条记录里可以包含 1..N 个地址。

字段：

| 字段 | 说明 |
|---|---|
| occurredAt | 触发 / 执行开始时间 |
| trigger | 触发方式（5 种）：自动·大额充值检测 / 自动·地址未活跃 / 自动·地址余额检测 / 自动·提现不足触发 / 手动归集 |
| triggerName | 关联的 auto-task 名称（手动时为「手动归集」） |
| chainId / tokenId | 目标 token |
| addresses | 该次归集涉及的地址明细（地址、金额 USD、数量）|
| totalAmount | token-native 数量合计（最多 8 位小数）|
| totalUsd | USD 合计；不可折算 token 时为空 |
| feeUsd | fee 消耗（USD）|
| trxConsumed / energy / bandwidth | TRX 链专属；非 TRX 链显示 `-` |
| status | 4 种：待执行 / 执行中 / 已完成 / 已终止 |
| abortedAt / abortedReason | 终止时填写 |

### 5.2 任务状态

| 状态 | 颜色 | 操作可用性 |
|---|---|---|
| 待执行（pending） | neutral chip | ✅ 可终止 |
| 执行中（running） | info chip + pulse 动画 | ✅ 可终止 |
| 已完成（completed） | success chip | — |
| 已终止（aborted） | error chip | — |

### 5.3 主页

- 顶部统计：第 1 行 4 张（任务数 / 归集总额 / 覆盖地址数 / fee 消耗），第 2 行 3 张（能量消耗 / 带宽消耗 / trx 消耗）
- 工具条：搜索（按任务名）+ 4 个筛选器（状态 / chain / token / 触发方式）
- 表格 13 列：归集发生时间 / 触发方式 / chain / token / 归集地址数 / 归集总数量 / 归集总金额（USD）/ fee 消耗（USD）/ trx 消耗（TRX）/ 能量消耗 / 带宽消耗 / 任务状态 / 操作
- 默认按 `归集发生时间 DESC` 排序

### 5.4 列排序（M1）

8 列可排序（点击表头切换 desc → asc → 关闭 三态）：归集发生时间 / 归集地址数 / 归集总数量 / 归集总金额 / fee 消耗 / trx 消耗 / 能量消耗 / 带宽消耗。

### 5.5 「归集地址数」单元格

- 点击数字打开「归集地址明细」弹窗
- 数字后缀加 `IconChevronRight` 12px + hover 浅蓝底，明确点击可达
- pending 任务地址数为 0，显示 `dim 0`，不可点

### 5.6 操作列

- pending / running 显示「× 终止任务」按钮（ghost sm，颜色 error-dark）
- 完成 / 终止 显示 `—`
- 点击触发二次确认 dialog（**dismissable=false**），文案区分 pending（「尚未开始执行，终止后不会发生归集」）与 running（「可能已对部分地址完成归集，这部分统计信息会保留」）

### 5.7 归集地址明细弹窗

- size = `lg`（720）
- 顶部 chip 行：触发方式 + 任务状态
- 终止状态额外显示 error-tip 含 abortedReason + abortedAt
- 4 张统计卡：覆盖地址数 / 归集总数量（数字，**不显示币种单位**）/ 归集总额（USD）/ fee 消耗（USD）
- 地址清单：每行 `地址 mono / 金额 USD（小字） / 数量 + token 单位（大字）/ 复制按钮`，**不展示**地址类型、tx hash 等冗余信息
- 复制按钮点击后弹 success toast「地址已复制到剪贴板」（3s）
- 当地址 > 10 时显示 compact pagination

### 5.8 列表分页

底部嵌入 pagination footer（高度 64px，`--grey-100` 背景，border-top）：
- 左侧：「第 N–M 条 / 共 X 条」+ 每页条数选择器（10 / 20 / 50）
- 右侧：上一页 / 数字按钮 / 下一页（32×32 透明，激活态 primary 实色）

---

## 6. 设计系统合规

完全遵循 CCPayment Design System v2（Claude design bundle）：

- **字体**：Poppins 本地引入（300/400/500/600/700/900）
- **颜色**：primary `#3C6FF5`、secondary `#BEE072`、grey 100–900、success/info/warning/error 四态
- **圆角**：8 / 12 / 16 三阶（按钮 / 输入 / 卡片）
- **阴影**：shadow-card / shadow-dialog / shadow-dropdown + 4 色 colored shadow（primary/success/warning/error）
- **间距**：4-pt 网格
- **按钮**：M=`9 20`/22 lh，sm=`4 12`/22 lh 12px，lg=`11 24`/26 lh 16px，6 种变体（primary/success/warning/info/danger/outlined/soft/ghost）
- **chip**：`rgba(token, 0.16)` 软背景 + `--*-darker` 文字，3px 10px 内距，nowrap
- **table**：toolbar 72h `--grey-100`、thead 56h 白底、行 14/16 内距，pagination footer 64h `--grey-100`
- **dialog**：480 默认 / 720 lg / 880 xl，无默认分割线，header 24/12/24/24 min-h 72，footer 24 min-h 88
- **switch**：36×20 radius 10、thumb 14
- **checkbox**：18×18 radius 4 2px 边、`currentColor` 填 + ::after 白对勾
- **crypto badge**：32×32 圆，品牌色填 + 白色 extrabold 单字母 + `inset 0 -2px 4px rgba(0,0,0,0.12)` 内阴影；无品牌色 fallback 走 bg-subtle 占位
- **侧栏**：280px 宽，nav-item 48h，**active = `rgba(60,111,245,0.08)` bg + primary 文字 + medium 字重**（关键），父级有 active 子级时仅 primary 文字色无背景
- **appbar**：72h，36×36 icon-btn（hover `rgba(145,158,171,0.08)`），右侧 44h account chip（avatar + 用户名 + 角色，1px subtle border, radius 30）
- **toast / snackbar**：右上角堆栈，4 tone，5s 自动消失，200ms enter 动画

> 颜色 / 字体 / 圆角 / 间距 / 阴影等 token 全部用 CSS variables（`tokens.css`），不允许在组件 CSS 中硬编码。

---

## 7. 交互 / a11y 要求

- **侧栏**：≤1280px 视口自动折叠为 72px icon-only；用户可手动展开
- **Modal**：
  - 默认支持 mask click + ESC + close-x 关闭
  - **destructive confirm**（删除任务、终止任务）必须用 `dismissable={false}`，禁止 mask click / ESC / close-x，强制点底部按钮
  - 焦点陷阱：Tab / Shift+Tab 在 modal 内循环；ESC 关闭后焦点还原到触发元素；body 滚动锁定
- **Toast / Snackbar**：右上角，最多并行多条堆叠，含 success/info/warning/error 4 种 tone
- **空状态**：圆 icon + 标题 + 一句式解释（无感叹号），文案符合 spec voice
- **错误**：表单内 inline form-error（红色 + IconAlert），不用浏览器原生 `alert()`
- **可点击单元格**：必须有视觉提示（链色 / chevron / hover 高亮）
- **平滑滚动**：手动归集查询完成后自动 `scrollIntoView({ behavior: 'smooth' })` 到 Step 2

---

## 8. 数字格式化要求

- USD：`$1,234.56`（千位分隔 + 2 位小数）
- token 数量：最多 8 位小数 + 千位分隔 + **去尾零**：
  - `8500.00` → `8,500`
  - `1.50000000` → `1.5`
  - `0.123456789` → `0.12345679`
- TRX 消耗：保留 2 位
- 能量 / 带宽：整数千位分隔

---

## 9. 范围外（明确不做）

- 真正接入后端归集接口（本期是原型）
- 新增除「归集系统」外的菜单项的实际功能
- 用户管理 / 权限控制
- i18n（仅中文）
- 暗色模式（虽然 token 体系支持）
- 移动端适配（>1280 / ≤1280 已做侧栏自适应，更小尺寸不做）
- 真实的 tx hash / 区块链查询
- 数据导出 / CSV 下载

---

## 10. 已经实现的关键 UX 细节（参考用，PRD 应正式定义）

- 自动归集任务编辑回填（chain·token、阈值、cooldown / schedule 等所有字段）
- 全选所有 chain · token / 全选某 chain · token / chain 模糊搜索 / token 跨 chain 模糊搜索
- AmountInput 当 targets 改变时自动同步 amounts 字典（添加 / 移除 token）
- 列表 chip 内字号 12 / lh 18 / nowrap
- Modal 中长地址 / tx hash 用 `word-break: break-all` 自然换行
- 表格分页：当筛选改变时回到第 1 页
- 任务详情弹窗内地址列表的分页独立于外层任务列表分页
- 终止任务时根据当前 status 给出不同确认文案

---

## 11. 准出标准（高层）

- 自动归集 4 种类型分别可创建、可编辑、可启停、可删除
- 同类型重复目标 token 校验生效，错误信息精确指向冲突任务名
- 手动归集查询能给出正常 / 异常分布；阈值改动实时联动；提交后可在「归集任务」看到对应 5 条记录
- 归集任务列表能筛选、排序、分页、查看明细
- pending / running 任务可被终止，且终止过程符合规则
- 全部交互合规 CCPayment Design System v2
