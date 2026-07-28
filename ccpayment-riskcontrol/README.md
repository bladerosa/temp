# CCPayment 运营后台 · 风控交易管理

风控交易管理模块的生产实现，严格对齐原型 `风控交易管理.dc.html`（Claude Design 项目 `e2709a32…447849`）。功能范围与原型一致，原型中未实现的能力（如「风险资产处置」）不纳入实现。

---

## 一、技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| Bundler / Dev server | Vite 5 | `npm run dev` 默认 `5178` |
| 框架 | React 18 | StrictMode |
| 语言 | TypeScript ≥ 5.6 | strict / noUnusedLocals / noUnusedParameters |
| 路由 | react-router-dom v6 | `lazy()` + `<Suspense>`，常量集中在 `src/routes/paths.ts` |
| UI 框架 | MUI v5 + Emotion | `sx` prop only |
| 图标 | `lucide-react` | 不使用 `@mui/icons-material` |
| 状态管理 | MobX 6 + mobx-react-lite 4 | class store + `makeAutoObservable` + `observer` |

```bash
npm install
npm run dev        # http://localhost:5178
npm run build      # tsc -b && vite build
npm run typecheck  # 仅 tsc
```

## 二、路由

| URL | 页面 | 面包屑 |
|---|---|---|
| `/` | 重定向 → `/dashboard/risk-control` | – |
| `/dashboard/risk-control` | 风控交易管理 | 风控交易管理 / 风控交易管理 |
| `*` | NotFoundPage（404 + 返回 CTA） | – |

## 三、功能范围（对齐原型）

### 3.1 页面结构
标题区（`风控交易管理` + 「MistTrack规则配置」按钮）→ Tab（风险充值 / 风险地址）→ 筛选区 → 表格（横向滚动）→ 静态分页脚 → 风险评估详情抽屉。

### 3.2 Tab A · 风险充值
- **筛选**：网络（All/POLYGON/TRX/BSC）、代币（All/USDT/POL）、风险等级（全部/低/中/高/严重）、Display ID 搜索、查询、重置。筛选实时生效，「查询」给出提示 toast，「重置」清空筛选。
- **列（13）**：Time / Display ID / Network / Amount / Value / From / To / Txid / Record ID / 风险描述（查看详情）/ 风险评分（分值 + 等级标签）/ 状态 / 操作。
- **状态**：提现中 / 未处理 / 已提现 / 审核拒绝。
- **操作**：补充网络费（非拒绝且非已提现时）、详情（非拒绝时）、`--`（拒绝时）。

### 3.3 Tab B · 风险地址
- **筛选**：网络、风险等级、Merchant ID 搜索、查询、重置、导出。
- **列（9）**：Merchant ID / Risk at / Network / Address / 风险评分 / 通知结果（Success/Pending）/ 停用后收款 / 风险描述（查看详情）/ 操作（查询交易、查看通知记录）。

### 3.4 风险评估详情抽屉（两个 Tab 复用）
MistTrack AML 结果视图：币种 + 目标地址（可复制）、地址标签、环形评分表盘 + 等级 + 建议操作、关联安全事件（严重）、风险指标 `detail_list`、风险敞口溯源 `risk_detail`（类型徽标 / 敞口 / 跳数 / 占比 / 金额 + 可展开 `hop_dic` 溯源路径，地址片可点击复制）、任务信息（Txid / Record ID 等可复制）、页脚「下载 AML 风险报告」「MistTrack」（打开 MistTrack 报告 URL）。

### 3.5 风险等级色阶（评分 → 等级）
`0–30 低风险` / `31–70 中风险` / `71–90 高风险` / `91–100 严重风险`。等级色阶与 AML 结果构造对齐原型 `buildResult`，为占位/演示数据。

## 四、目录结构

```
src/
├── components/     PageHeader / EmptyState / ToastHost / RiskDrawer
├── data/           riskcontrol.ts（类型 + DEPOSIT/ADDRESS fixtures + level/status/riskType meta + buildResult）
├── layouts/dashboard/  DashboardLayout / Sidebar / Header
├── pages/          RiskControlPage / NotFoundPage
├── routes/         index.tsx + paths.ts + AuthGuard(stub) + PageLoader
├── stores/         UiStore / ToastStore / RiskStore + RootStore
├── theme/          palette / typography / shadows / components + tokens.css
├── App.tsx
└── main.tsx
```

## 五、后续接入

`src/data/riskcontrol.ts` 为 mock + 判定逻辑；接入后端时替换为 `src/api/` 调用 + `RiskStore` 异步 action。`src/routes/AuthGuard.tsx` 为透传 stub，接入认证时只替换该文件。
