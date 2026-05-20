# CCPayment 运营后台 · Sell USDT 申请

CCPayment 运营后台 — Sell USDT 申请 模块前端实现。

## 技术栈

- **Vite 5** + **React 18** + **TypeScript 5**
- **MUI v5** (`@mui/material` + `@mui/x-date-pickers`) + **Emotion**
- **React Router v6**
- **MobX 6** + `mobx-react-lite`
- **lucide-react** (图标系统)
- **Day.js**

## 启动

```bash
npm install
npm run dev    # http://localhost:5173
```

## 构建

```bash
npm run build   # tsc -b && vite build
```

## 模块范围

- **Sell USDT 申请** 主页：4 个 tab（待审核 / 付款中 / 已拒绝 / 已完成），表格、搜索、分页
- **服务费设置** 弹窗：平台服务费率 + 供应商汇率加点，含计算模拟
- **付款单信息** 详情弹窗：Order Info + Recipient Info
- **商户管理 → 商户列表 → 商户详情** 收费配置 tab + 法币提现平台服务费 编辑弹窗（含谷歌验证码 + 计算模拟）

## 目录结构

```
src/
├── components/      # 共享 UI 组件（弹窗、字段、模拟器、分页等）
├── data/            # 类型 + mock 数据 + 导航树
├── layouts/dashboard/   # DashboardLayout / Sidebar / Header
├── pages/           # SellUsdt / MerchantDetail / Stub
├── routes/          # 路由树 + paths 常量
├── stores/          # MobX：UiStore + FeeStore + RootStore
├── theme/           # CCPayment DS → MUI 主题映射 + tokens.css
└── utils/           # pricing 公式 + 字段校验
```
