# ccpayment-merchant — 商户后台

CCPayment 商户后台（merchant console）production 实现，源自 Claude Design 原型「商户后台优化」。

## 技术栈

Vite 5 · React 18 · TypeScript · React Router v6 · MUI v5（sx-only）· MobX 6 · lucide-react · Poppins（自托管）

## 页面与功能

- **Dashboard**（`/dashboard/overview`）
  - 合并引导卡片：双 Tab（API接入帮助 / Quick Guide），关闭收起为「获取API接入帮助」按钮（高度折叠动画，Esc 可关闭）
  - 接入步骤条：初始态（Create App Secret 链接 → Developer）与已创建态（完成对勾 + API 接入激活节点：方式一打开 API 文档、SKILL.md 复制芯片）
  - URL 被 detect 后：卡片仅剩 Beginner's guide（Quick Start + FAQ 手风琴），常驻 View API Documentation 按钮，关闭收起为 Quick Guide 按钮
  - Estimated Balance 面板（面积图 + 十字虚线 + tooltip）、Coins 列表（11 币种，零余额置灰）
- **Developer**（`/dashboard/developer`)
  - 空状态 → Create App Secret → 已创建状态（APP ID / APP Secret / IP Whitelist）
  - Webhook URL：Add/Edit 弹窗（Deposit 与 Withdrawal 文案不同，URL 需通过格式校验）→ 琥珀色 URL + Not Detected 标签 → Detect 弹窗（View API Doc 模拟探测通过）→ 黑色 URL + 绿色 Detected（不可再点）+ Add More (N)；Detected 后修改为不同 URL 会回到 Not Detected 重新探测（白名单保留，首页引导阶段不回退）
  - notifyUrl Whitelist 弹窗：根域名归一化（含 co.uk 等二级后缀）、首条锁定同步外部 URL、增删改、去重提示、上限 10
  - Integrations 五卡片：AI Agent（🦞 复制 SKILL.md + 右上角 toast）/ API Integration / SDK / WooCommerce Plugin / Use Cases
- **Merchant Settings › Settings**（`/dashboard/merchant-settings/settings`）
  - Tokens For Your Business（TETH 锁定，其余可移除）、自动添加复选框
  - ETH Test Network（开关联动 Get the Free Test-Sepolia ETH 按钮与水龙头弹窗，localStorage 持久化）
  - Auto-Swap of Deposit、Auto Withdraw / Rate Lock（Set up）

演示状态语义与原型一致：created / detected 状态存于内存 store，页面间导航保留，**刷新即重置**（ETH 测试网开关除外，按原型走 localStorage）。

## 运行

```bash
npm install
npm run dev    # http://localhost:5177
npm run build  # tsc -b && vite build
```
