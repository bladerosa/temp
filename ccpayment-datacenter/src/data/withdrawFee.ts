/** 用户支付提现网络费排名 + 明细 data — sibling of 归集费 (rate.ts) with
 *  withdrawal-network-fee semantics.
 *
 *  - `userRate`     = 用户支付提现网络费率 (rate we charge the user per withdrawal)
 *  - `platformRate` = 平台支付网络 fee 成本率 (chain gas the platform actually paid)
 *  - `rateDiff = userRate - platformRate`
 *      • positive → 顺差 (we profit), render red `+x%`
 *      • negative → 逆差 (we lose),   render green `-x%`
 *  - `profit = userFee - platformCost` (USD), 提现利润，sign matches rateDiff. */
export interface WithdrawFeeDetailRow {
  id: string;
  withdraw: number;      // 提现金额 (USD) during the window
  withdrawCount: number; // 提现笔数
  platformCost: number;  // 平台支付 fee 成本 (USD)
  platformRate: number;  // platformCost / withdraw (%)
  userFee: number;       // 用户支付 fee (USD)
  userRate: number;      // userFee / withdraw (%)
  rateDiff: number;      // userRate - platformRate (% points)
  profit: number;        // userFee - platformCost (USD) — 提现利润
}

const _INPUTS: Array<{ id: string; withdraw: number; withdrawCount: number; userRate: number; platformRate: number }> = [
  { id: 'CP15641', withdraw: 908_000, withdrawCount: 1124, userRate: 0.62, platformRate: 0.28 },
  { id: 'CP15203', withdraw: 654_000, withdrawCount:  812, userRate: 0.55, platformRate: 0.34 },
  { id: 'CP14982', withdraw: 531_000, withdrawCount:  668, userRate: 0.48, platformRate: 0.22 },
  { id: 'CP14893', withdraw: 449_000, withdrawCount:  572, userRate: 0.40, platformRate: 0.46 },
  { id: 'CP15418', withdraw: 402_000, withdrawCount:  508, userRate: 0.36, platformRate: 0.19 },
  { id: 'CP15524', withdraw: 346_000, withdrawCount:  426, userRate: 0.30, platformRate: 0.35 },
  { id: 'CP15071', withdraw: 292_000, withdrawCount:  368, userRate: 0.26, platformRate: 0.17 },
  { id: 'CP15007', withdraw: 188_000, withdrawCount:  233, userRate: 0.17, platformRate: 0.23 },
  { id: 'CP14761', withdraw: 145_000, withdrawCount:  191, userRate: 0.14, platformRate: 0.20 },
  { id: 'CP15692', withdraw: 104_000, withdrawCount:  138, userRate: 0.10, platformRate: 0.16 },
];

export const WITHDRAW_FEE_DETAIL: WithdrawFeeDetailRow[] = _INPUTS.map((r) => {
  const userFee = +(r.withdraw * r.userRate / 100).toFixed(2);
  const platformCost = +(r.withdraw * r.platformRate / 100).toFixed(2);
  return {
    id: r.id,
    withdraw: r.withdraw,
    withdrawCount: r.withdrawCount,
    userFee,
    userRate: r.userRate,
    platformCost,
    platformRate: r.platformRate,
    rateDiff: +(r.userRate - r.platformRate).toFixed(2),
    profit: +(userFee - platformCost).toFixed(2),
  };
});
