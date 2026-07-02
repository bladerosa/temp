/** 用户支付归集费排名 + 明细 data.
 *
 *  Semantics:
 *  - `userRate` = 预归集费率 (rate we charge the user upfront for aggregation)
 *  - `platformRate` = 已发生归集费率 (rate the platform actually paid for
 *    this merchant's aggregation operations during the window)
 *  - `rateDiff = userRate - platformRate`
 *      • positive → 顺差 (we profit), render red `+x%`
 *      • negative → 逆差 (we lose),   render green `-x%`
 *  - `profit = userFee - platformCost`, sign matches rateDiff. */

export const PLATFORM_AGGREGATION_FEE = 0.22;

export interface AggregationFeeDetailRow {
  id: string;
  deposit: number;       // USD total deposit during the window
  depositCount: number;  // count of deposit transactions
  aggCount: number;      // 归集次数 — aggregation operations run for this merchant
  platformCost: number;  // USD platform paid for this merchant's aggregation
  platformRate: number;  // platformCost / deposit (percentage)
  userFee: number;       // USD collected from this merchant as upfront fee
  userRate: number;      // userFee / deposit (percentage) — i.e. 预归集费率
  rateDiff: number;      // userRate - platformRate (percentage points)
  profit: number;        // userFee - platformCost (USD)
}

const _DETAIL_INPUTS: Array<{ id: string; deposit: number; depositCount: number; userRate: number; platformRate: number }> = [
  { id: 'CP15641', deposit: 1_245_800, depositCount: 1532, userRate: 0.84, platformRate: 0.31 },
  { id: 'CP15203', deposit:   892_400, depositCount: 1108, userRate: 0.62, platformRate: 0.45 },
  { id: 'CP14982', deposit:   723_100, depositCount:  894, userRate: 0.51, platformRate: 0.28 },
  { id: 'CP14893', deposit:   612_500, depositCount:  781, userRate: 0.45, platformRate: 0.52 },
  { id: 'CP15418', deposit:   548_200, depositCount:  692, userRate: 0.38, platformRate: 0.21 },
  { id: 'CP15524', deposit:   471_900, depositCount:  581, userRate: 0.32, platformRate: 0.38 },
  { id: 'CP15071', deposit:   398_400, depositCount:  502, userRate: 0.27, platformRate: 0.18 },
  { id: 'CP15007', deposit:   256_800, depositCount:  318, userRate: 0.18, platformRate: 0.24 },
  { id: 'CP14761', deposit:   198_300, depositCount:  261, userRate: 0.15, platformRate: 0.22 },
  { id: 'CP15692', deposit:   142_700, depositCount:  184, userRate: 0.09, platformRate: 0.15 },
];

export const AGGREGATION_FEE_DETAIL: AggregationFeeDetailRow[] = _DETAIL_INPUTS.map((r) => {
  const userFee = +(r.deposit * r.userRate / 100).toFixed(2);
  const platformCost = +(r.deposit * r.platformRate / 100).toFixed(2);
  // 归集次数：多笔充值合并归集，一般少于充值笔数。以 depositCount 的 ~30%~45% 确定性估算。
  const aggCount = Math.max(1, Math.round(r.depositCount * (0.3 + ((r.deposit >> 8) % 16) / 100)));
  return {
    id: r.id,
    deposit: r.deposit,
    depositCount: r.depositCount,
    aggCount,
    userFee,
    userRate: r.userRate,
    platformCost,
    platformRate: r.platformRate,
    rateDiff: +(r.userRate - r.platformRate).toFixed(2),
    profit: +(userFee - platformCost).toFixed(2),
  };
});
