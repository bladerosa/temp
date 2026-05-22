/** 用户支付换币服务费排名 + 明细 data.
 *
 *  Semantics:
 *  - `swapRate` = 用户支付换币服务费率 (rate we charge the merchant per swap)
 *  - `costRate` = 平台换币成本 fee 率 (gas + slippage cost the platform paid)
 *  - `rateDiff = swapRate - costRate`
 *      • positive → 顺差 (we profit), render red `+x%`
 *      • negative → 逆差 (we lose),   render green `-x%`
 *  - `profit = swapFee - swapCost`, sign matches rateDiff. */
export interface SwapFeeDetailRow {
  id: string;
  swap: number;        // 换币金额 (USD) during the window
  swapCount: number;   // 换币笔数
  swapCost: number;    // 平台换币成本 fee (USD)
  costRate: number;    // swapCost / swap (%)
  swapFee: number;     // 用户支付换币服务费用 (USD)
  swapRate: number;    // swapFee / swap (%)
  rateDiff: number;    // swapRate - costRate (% points)
  profit: number;      // swapFee - swapCost (USD)
}

const _INPUTS: Array<{ id: string; swap: number; swapCount: number; swapRate: number; costRate: number }> = [
  { id: 'CP15641', swap: 624_000, swapCount: 832, swapRate: 1.50, costRate: 0.65 },
  { id: 'CP15203', swap: 446_000, swapCount: 590, swapRate: 1.35, costRate: 0.78 },
  { id: 'CP14982', swap: 362_000, swapCount: 478, swapRate: 1.20, costRate: 0.62 },
  { id: 'CP14893', swap: 306_000, swapCount: 405, swapRate: 1.05, costRate: 0.95 },
  { id: 'CP15418', swap: 274_000, swapCount: 358, swapRate: 0.90, costRate: 0.55 },
  { id: 'CP15524', swap: 236_000, swapCount: 308, swapRate: 0.78, costRate: 0.72 },
  { id: 'CP15071', swap: 199_000, swapCount: 262, swapRate: 0.68, costRate: 0.55 },
  { id: 'CP15007', swap: 128_000, swapCount: 168, swapRate: 0.55, costRate: 0.68 },
  { id: 'CP14761', swap:  99_000, swapCount: 138, swapRate: 0.48, costRate: 0.62 },
  { id: 'CP15692', swap:  71_000, swapCount:  96, swapRate: 0.42, costRate: 0.58 },
];

export const SWAP_FEE_DETAIL: SwapFeeDetailRow[] = _INPUTS.map((r) => {
  const swapFee = +(r.swap * r.swapRate / 100).toFixed(2);
  const swapCost = +(r.swap * r.costRate / 100).toFixed(2);
  return {
    id: r.id,
    swap: r.swap,
    swapCount: r.swapCount,
    swapFee,
    swapRate: r.swapRate,
    swapCost,
    costRate: r.costRate,
    rateDiff: +(r.swapRate - r.costRate).toFixed(2),
    profit: +(swapFee - swapCost).toFixed(2),
  };
});
