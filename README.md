# temp

CCPayment 内部原型仓库。

## 子项目

| 目录 | 项目 | 技术栈 |
|---|---|---|
| [`notifaction/`](./notifaction)                   | 通知系统 | React + Vite + TypeScript |
| [`collection/`](./collection)                     | 归集系统  | React + Vite + TypeScript |
| [`sell-usdt/`](./sell-usdt)                       | Sell USDT 申请 | React + Vite + TypeScript + MUI + MobX |
| [`ccpayment-datacenter/`](./ccpayment-datacenter) | 运营后台 · 数据看板（商户数据 / 财务看板） | React + Vite + TypeScript + MUI + MobX + MUI X Charts |
| [`ccpayment-bd/`](./ccpayment-bd)                 | BD 推广 | React + Vite + TypeScript + MUI + MobX |
| [`ccpayment-bd-1.5/`](./ccpayment-bd-1.5)         | BD 推广 1.5 | React + Vite + TypeScript + MUI + MobX |
| [`ccpayment-merchant/`](./ccpayment-merchant)     | 商户后台（Dashboard 接入引导 / Developer · Webhook · Integrations / Settings） | React + Vite + TypeScript + MUI + MobX |

## 启动

```bash
# 通知系统
cd notifaction && npm install && npm run dev

# 归集系统
cd collection && npm install && npm run dev

# Sell USDT 申请（端口固定 5175）
cd sell-usdt && npm install && npm run dev

# 运营后台 · 数据看板（端口固定 5174）
cd ccpayment-datacenter && npm install && npm run dev

# BD 推广
cd ccpayment-bd && npm install && npm run dev

# BD 推广 1.5
cd ccpayment-bd-1.5 && npm install && npm run dev

# 商户后台（端口固定 5177）
cd ccpayment-merchant && npm install && npm run dev
```
