# CCPayment · BD 推广

CCPayment 推广合作（BD 推广）模块的生产实现，从 Claude Design 原型按生产栈 1:1 重建。

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 / 开发服务器 | Vite 5（`npm run dev` 默认 5173） |
| 框架 | React 18（StrictMode） |
| 语言 | TypeScript ≥ 5.6（strict + noUnused*） |
| 路由 | react-router-dom v6（lazy + Suspense） |
| UI | @mui/material v5 + @mui/icons-material + @mui/x-date-pickers |
| 图标 | lucide-react |
| 样式 | `sx` only（Emotion） |
| 日期 | dayjs + AdapterDayjs |
| 状态 | MobX 6 + mobx-react-lite |

## 模块范围

与原型一致，仅实现原型中已有的功能：

- **认证流** — 登录 / 注册 / 邮箱验证 / 忘记密码 / 重置密码 / 成功，含 Google 账号选择弹窗。
- **推广者后台** — Referral Settlements：余额、提现弹窗（绑定商户场景）、邀请链接、佣金结算表。
- **运营后台** — 推广者列表（绑定/解绑商户、编辑备注、分红比例查看与编辑）、佣金提现审批。
- **商户后台 BD 推广落地页** — 营销落地页 + 内嵌推广者后台关联流程。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
```

## 构建校验

```bash
npm run typecheck  # tsc -b，零错误
npm run build      # tsc -b && vite build
```

## 目录

```
src/
├── api/          # 数据接口 seam
├── components/   # 跨页复用 UI（sx-only）
├── data/         # 类型 + mock fixtures
├── layouts/      # Auth / Dashboard / Console / Merchant 外壳
├── pages/        # auth / promoter / console / merchant
├── routes/       # index.tsx + paths.ts
├── stores/       # MobX：Auth / Ui / Toast / Promoter / Withdrawal
├── theme/        # createTheme + palette / typography / shadows / components / tokens.css
└── utils/
```
