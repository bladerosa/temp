# temp

CCPayment 内部原型仓库。

## 子项目

| 目录 | 项目 | 技术栈 |
|---|---|---|
| [`notifaction/`](./notifaction)                   | 通知系统 | React + Vite + TypeScript |
| [`collection/`](./collection)                     | 归集系统  | React + Vite + TypeScript |
| [`sell-usdt/`](./sell-usdt)                       | Sell USDT 申请 | React + Vite + TypeScript + MUI + MobX |
| [`ccpayment-datacenter/`](./ccpayment-datacenter) | 运营后台 · 数据看板（商户数据 / 财务看板） | React + Vite + TypeScript + MUI + MobX + MUI X Charts |

## 启动

```bash
# 通知系统
cd notifaction && npm install && npm run dev

# 归集系统
cd collection && npm install && npm run dev

# Sell USDT 申请
cd sell-usdt && npm install && npm run dev

# 运营后台 · 数据看板（端口固定 5174）
cd ccpayment-datacenter && npm install && npm run dev
```
