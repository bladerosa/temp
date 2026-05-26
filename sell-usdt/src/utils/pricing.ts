import type { FeeConfig, FeeDerived, SellOrderRaw } from '@/data/types';

/**
 * 单一公式来源 — Sell USDT 申请的费用与到手计算（v1.7：含固定补贴 f）。
 *
 * 业务模型（自上而下走资金）：
 *   1) 用户 sell `S` USDT；
 *   2) 平台拿走 `S × p`（平台服务费率 p）；
 *   3) 平台把 `S × (1 − p)` USDT 通过 Cwallet 运营账户转给供应商 Cwallet
 *      账户（其中包含给供应商的固定 `f` USDT 银行转账补贴）；
 *   4) 供应商从这笔 `S × (1 − p)` 中自留两部分：
 *        a) 按比例的供应商服务费 = `S × (1 − p) × q`（q = 0.5%，固定）；
 *        b) 银行转账补贴 `f`（10 USDT，固定）—— 用来覆盖供应商发起国际汇款
 *           时银行收取的手续费，确保用户最终收到的法币数额与下单显示一致。
 *   5) 剩下的 `S × (1 − p) × (1 − q) − f` USDT 由供应商按 USDT:USD = 1:1
 *      承兑为法币 USD 支付给用户（**汇率强制 1:1**，本期仅支持 USD）。
 *
 * 用户外显（实际感知）：
 *   - 用户到手 USD       = S × (1 − p) × (1 − q) − f
 *   - 用户可见外显服务费 = S − 用户到手 = S × (1 − (1 − p)(1 − q)) + f
 *   - 用户可见服务费率   = 1 − (1 − p)(1 − q) + f / S
 *                       = p + q − p·q + f / S
 *                       = p × (1 − q) + q + f / S    —— 在 q、f 固定时直观写法
 *
 * 例（验算用，与 PRD §6 一致）：
 *   S = 50,000、p = 10%、q = 0.5%、f = 10
 *     → 平台服务费 = 5,000；Cwallet 转账 = 45,000；
 *     → 供应商自留比例费 = 225；供应商银行转账补贴 = 10；供应商承兑量 = 44,765；
 *     → 用户到手 = 44,765 USD；用户外显服务费 = 5,235 USD；
 *     → 用户可见服务费率 = 1 − 0.9 × 0.995 + 10/50,000 = 10.47%。
 */
export function deriveRow(
  row: Pick<SellOrderRaw, 'sellAmt' | 'market'>,
  fee: Pick<FeeConfig, 'platform' | 'platformFlat' | 'supplier'>,
): FeeDerived {
  const platformPct = Math.max(0, Math.min(100, Number(fee.platform) || 0)) / 100;
  const supplierPct = Math.max(0, Math.min(100, Number(fee.supplier) || 0)) / 100;
  const supplierSubsidy = Math.max(0, Number(fee.platformFlat) || 0);
  // 平台服务费（USDT）
  const platFee = row.sellAmt * platformPct;
  // 平台→供应商 Cwallet 的 USDT；亦即「供应商承兑量（Cwallet 转账侧）」
  const cwalletAmt = row.sellAmt - platFee;
  // 供应商按 0.5% 自留的服务费（USDT）
  const supplierSelfFee = cwalletAmt * supplierPct;
  // 供应商最终承兑给用户的 USDT 数量；本期 USDT:USD = 1:1，所以也等于 USD 到手数量
  const supAmt = cwalletAmt - supplierSelfFee - supplierSubsidy;
  // 供应商承兑汇率（USDT → 法币）— 本期强制 1:1
  const supRate = 1;
  // 用户实际到手（法币 USD）
  const userGot = supAmt * supRate;
  // 用户外显服务费（USD，等价 USDT）= sell 减去到手
  const extFee = row.sellAmt - userGot;
  return {
    platFee,
    supplierSubsidy,
    supplierSelfFee,
    cwalletAmt,
    supAmt,
    supRate,
    userGot,
    extFee,
  };
}

export function fmtUSDT(n: number): string {
  return (
    n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' USDT'
  );
}

export function fmtFiat(n: number, ccy: string): string {
  return (
    n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' ' + ccy
  );
}

export function fmtMarketRate(rate: number, ccy: string): string {
  return (
    '1 USDT ≈ ' + rate.toLocaleString('en-US', { maximumFractionDigits: 6 }) + ' ' + ccy
  );
}

export function sanitizeFeeInput(raw: string): string {
  let s = raw.replace(/[^\d.]/g, '');
  const i = s.indexOf('.');
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    s = s.slice(0, i + 3);
  }
  return s;
}

export function validateFee(s: string): string {
  if (s === '' || s === '.') return '请输入数值';
  const n = Number(s);
  if (Number.isNaN(n)) return '请输入有效数字';
  if (n < 0 || n > 100) return '范围为 0–100';
  return '';
}
