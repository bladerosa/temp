import type { FeeConfig, FeeDerived, SellOrderRaw } from '@/data/types';

/**
 * 单一公式来源 — Sell USDT 申请的费用与到手计算（v1.7.1：含固定补贴 f）。
 *
 * 业务模型（自上而下走资金）：
 *   1) 用户 sell `S` USDT；
 *   2) 平台拿走 `S × p`（平台服务费率 p）；
 *   3) 平台把 `S × (1 − p)` USDT 通过 Cwallet 运营账户转给供应商 Cwallet
 *      账户（其中包含给供应商的固定 `f` USDT 银行转账补贴）；
 *   4) 供应商收到这笔 `S × (1 − p)` 后，**先扣掉**银行转账补贴 `f`（10 USDT，
 *      固定）—— 用来覆盖供应商发起国际汇款时银行收取的手续费，确保用户最终
 *      收到的法币数额与下单显示一致；
 *      然后再对 **剩余**部分 `S × (1 − p) − f` 按 `q` 抽取供应商服务费：
 *        supplierSelfFee = (S × (1 − p) − f) × q（q = 0.5%，固定）。
 *   5) 剩下的 `(S × (1 − p) − f) × (1 − q)` USDT 由供应商按 USDT:USD = 1:1
 *      承兑为法币 USD 支付给用户（**汇率强制 1:1**，本期仅支持 USD）。
 *
 * 用户外显（实际感知）：
 *   - 用户到手 USD       = (S × (1 − p) − f) × (1 − q)
 *   - 用户可见外显服务费 = S − 用户到手
 *                       = S × (1 − (1 − p)(1 − q)) + f × (1 − q)
 *   - 用户可见服务费率   = 1 − (1 − p)(1 − q) + f × (1 − q) / S
 *                       = p + q − p·q + f × (1 − q) / S
 *                       = p × (1 − q) + q + f × (1 − q) / S
 *
 * 例（验算用，与 PRD §6 一致）：
 *   S = 50,000、p = 10%、q = 0.5%、f = 10
 *     → 平台服务费 = 5,000；Cwallet 转账 = 45,000；
 *     → 供应商银行转账补贴 = 10；先扣后基数 = 44,990；
 *     → 供应商服务费 = 44,990 × 0.5% = 224.95；
 *     → 供应商承兑量 = 44,990 × 99.5% = 44,765.05；
 *     → 资金恒等：5,000 + 224.95 + 10 + 44,765.05 = 50,000 ✓
 *     → 用户到手 = 44,765.05 USD；用户外显服务费 = 5,234.95 USD；
 *     → 用户可见服务费率 = 5,234.95 / 50,000 = 10.4699%。
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
  // 供应商按 0.5% 自留的服务费（USDT）— 先扣掉银行转账补贴 f 之后再按 q 抽取
  const supplierSelfFee = Math.max(0, cwalletAmt - supplierSubsidy) * supplierPct;
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
