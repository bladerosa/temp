# CCPayment 商户后台 · 風險交易列表

「風險交易列表」页面的生产实现，严格对齐原型 `Risk Transactions.dc.html`
（Claude Design 项目 `d0d2b94d-d800-46d7-8d87-89116ea5d0ef`）。

**功能范围与原型一致**：原型中未实现的能力（选择日期、匯出、風險地址、發送 Webhook、
查看報告、侧边栏其余入口）只保留入口，不实现行为。

---

## 一、技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| Bundler / Dev server | Vite 5 | `npm run dev` 默认 `5180` |
| 框架 | React 18 | StrictMode |
| 语言 | TypeScript ≥ 5.6 | strict / noUnusedLocals / noUnusedParameters |
| 路由 | react-router-dom v6 | `lazy()` + `<Suspense>`，常量集中在 `src/routes/paths.ts` |
| UI 框架 | MUI v5 + Emotion | `sx` prop only，不用 `styled()` |
| 图标 | `lucide-react` | 不使用 `@mui/icons-material` |
| 状态管理 | MobX 6 + mobx-react-lite 4 | class store + `makeAutoObservable` + `observer` |
| 取数 | `src/api/riskTransactions.ts` | 目前返回 fixtures，接后端只改这一层 |

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # tsc -b && vite build
npm run typecheck  # 仅 tsc
```

## 二、路由

| URL | 页面 |
|---|---|
| `/` | 重定向 → `/dashboard/transactions/risk` |
| `/dashboard/transactions/risk` | 風險交易列表 |
| `*` | 404 |

## 三、目录

```
src/
├── api/riskTransactions.ts          取数 seam
├── components/                      跨页复用（PageHeader / TableCard / TablePager / CryptoBadge / CopyButton / EmptyState / ToastHost）
├── data/riskTransactions.ts         类型 + 原型 fixtures（PAY / WD / BATCH_*）
├── layouts/dashboard/               DashboardLayout / Sidebar / Header
├── pages/
│   ├── RiskTransactionsPage.tsx     页面骨架 + 挂载全部弹窗
│   └── risk-transactions/           两个表格、五个弹窗/抽屉、状态映射
├── routes/                          paths.ts + Routes 树 + AuthGuard 桩
├── stores/                          UiStore / ToastStore / RiskTransactionStore
├── theme/                           palette / typography / shadows / components / tokens.css
└── utils/format.ts                  金额解析与格式化
```

## 四、已实现的功能

### 页头
- 标题 + 面包屑「交易 › 風險交易列表」+ 「風險地址」软按钮（入口，无行为）
- 提示行「風險付款將不會入帳，可退款或提款。」
- 「高風險支付管理」卡片，文案里的阈值随抽屉保存实时更新

### 風險付款 Tab
- 重新處理狀態筛选：全部 / 等待中 / 已退款 / 已拒絕 / 失敗
- 字段化搜索：紀錄 ID / Txid / 从地址 / 批次 ID
- 11 列表格；金额带币种图标，重新處理狀態为描边 chip，批量记录附「批量」标记
- 「退款」：已退款的记录置灰不可点
- 行内 ⋮ 菜单：重新處理詳情（仅已退款/已拒絕/失敗可用）、發送 Webhook、查看報告

### 風險資金提款 Tab
- 退款方式筛选：全部 / 單筆 / 批量
- 字段化搜索：紀錄 ID / Txid / 至地址 / 批次 ID
- 10 列表格；金额红色，费用列带 USDT 图标，未上链的时间列显示 `--` 且置灰
- 行内 ⋮ 菜单：退款詳情、發送 Webhook、查看報告

### 弹窗 / 抽屉
| 组件 | 行为要点 |
|---|---|
| `RefundDialog` | 至地址二选一；「退款至付款地址」显示完整付款地址，「提款至指定地址」切成输入框；memo 币种（HBAR）在选定方式后追加 Memo 字段；费用按 `未选/已选/已填地址` 三档变化（0.04067 / 0.04099 / 0.04199） |
| `BatchRefundDrawer` | 退款類型（指定代幣 / 指定地址）；指定地址时追加地址下拉；指定代幣时追加最小退款金額；memo 币种追加 Memo；填了退款地址才能「下一步」 |
| `BatchConfirmDialog` | 按地址分组的三态勾选（全选 / 半选 / 单选）；总额、预估费用随勾选实时重算（费用按命中地址数计） |
| `ReprocessDetailDialog` | 已退款时金额符号翻转并展示手续费与 Txid；批量记录额外展示批次 ID、合併退款金額、本批次紀錄列表，「本筆」高亮，点其他记录跳回列表并按紀錄 ID 精筛 |
| `WithdrawDetailDialog` | 展示状态、批次信息、手续费口径（本筆轉帳 / 本批次）；批量记录可展开本次覆盖的风险付款并跳转 |
| `HighRiskManageDrawer` | 模式与退回路径即时生效，自動退款觸發值为草稿、「確認」后才写回（与原型一致） |

## 五、与原型的差异（有意为之）

1. **分页器**按原型形态实现（`ListPagination`）：「每頁數量 20 ⌄ / 起 ~ 迄 / 總數 / ←→」，右对齐。
   两点补齐：每页条数下拉接了 10 / 20 / 50（原型是静态的 20），范围与总数按真实筛选结果算
   （原型未筛选时写死 `1 ~ 20 / 72`）。**这一处覆盖了 ccpayment-release 里「禁用 rows-per-page 选择器」
   的通用规定——原型优先，已获确认。**
2. **复制图标**：原型里的复制图标没有行为，这里接上了剪贴板 + toast——它只有这一种语义，留空等于坏掉的控件。
3. **侧边栏收合**：顶栏的收合按钮在原型里是死的，这里实现为 88px 图标栏（含 Tooltip + logo-mark），
   以对齐设计系统的响应式契约。
4. **表头底色**取原型的 `grey.200`，而非 skill 通用配方里的 `grey.100`——原型的筛选区在白底上，
   灰阶层次是「白 → grey.200 → 白」。

## 六、未实现（原型同样未实现）

選擇日期、匯出、風險地址、發送 Webhook、查看報告，以及侧边栏中除「交易」外的全部入口——
均只保留视觉入口。
