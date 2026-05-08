# CCPayment 归集系统 — 交互原型

React + Vite + TypeScript 实现的「归集系统」模块原型，遵循 CCPayment Design System（Poppins · 蓝 `#3C6FF5` · 24/16/8 圆角阶梯）。

## 启动

```bash
npm install
npm run dev
```

打开 http://localhost:5173 — 默认进入「归集系统 → 自动归集」。

## 功能模块

- **自动归集** `/collection/auto` — 任务列表、4 种类型创建（大额充值检测 / 地址未活跃 / 地址余额检测 / 提现不足触发）、开关、编辑、删除，并对同类型重复目标 token 做校验。
- **手动归集** `/collection/manual` — 单选 chain · token，设置最小归集金额，立即触发全地址检测归集。
- **归集记录** `/collection/records` — 统一展示自动 + 手动归集事件，按 token 级原子记录拆分；点击地址数查看明细；TRX 类自动展示能量 / 带宽消耗。

## 技术栈

- React 18 + Vite + TypeScript
- React Router 6
- 自研轻量组件 + 设计 token CSS 变量（`src/styles/tokens.css`）
- Poppins 字体本地引入（`public/fonts/`）
