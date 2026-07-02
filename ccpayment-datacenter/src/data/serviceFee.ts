/** 充值服务费排名 / 明细 — sibling of aggregation-fee with different cost semantics.
 *
 *  - `serviceRate` = 用户支付充值服务费率 (the rate we charge the merchant on each
 *    deposit; comparable to a "merchant fee" line item).
 *  - `networkRate` = 平台网络 fee 成本率 (the gas / network cost the platform
 *    actually paid out — TRC20 / ERC20 fees etc.).
 *  - `rateDiff = serviceRate - networkRate`
 *      • positive → 顺差 (we profit), render red `+x%`
 *      • negative → 逆差 (we lose),   render green `-x%`
 *  - `profit = serviceFee - networkCost` (USD), sign matches rateDiff. */
export interface ServiceFeeDetailRow {
  id: string;
  deposit: number;          // USD total deposit during the window
  depositCount: number;     // count of deposit transactions
  riskDepositCount: number; // 风险充值笔数 — flagged / risky deposits within depositCount
  networkCost: number;      // USD platform paid for chain network fees
  networkRate: number;      // networkCost / deposit (%)
  serviceFee: number;       // USD collected from this merchant as 充值服务费
  serviceRate: number;      // serviceFee / deposit (%) — i.e. 用户支付充值服务费率
  depositFeeRate: number;   // 当前执行充值费率 (%) — deposit fee rate currently applied
  rateDiff: number;         // serviceRate - networkRate (% points)
  profit: number;           // serviceFee - networkCost (USD)
}

const _INPUTS: Array<{ id: string; deposit: number; depositCount: number; serviceRate: number; networkRate: number; depositFeeRate: number }> = [
  { id: 'CP15641', deposit: 1_245_800, depositCount: 1532, serviceRate: 1.20, networkRate: 0.42, depositFeeRate: 1.20 },
  { id: 'CP15203', deposit:   892_400, depositCount: 1108, serviceRate: 1.05, networkRate: 0.58, depositFeeRate: 1.00 },
  { id: 'CP14982', deposit:   723_100, depositCount:  894, serviceRate: 0.95, networkRate: 0.48, depositFeeRate: 0.90 },
  { id: 'CP14893', deposit:   612_500, depositCount:  781, serviceRate: 0.80, networkRate: 0.65, depositFeeRate: 0.80 },
  { id: 'CP15418', deposit:   548_200, depositCount:  692, serviceRate: 0.75, networkRate: 0.38, depositFeeRate: 0.75 },
  { id: 'CP15524', deposit:   471_900, depositCount:  581, serviceRate: 0.62, networkRate: 0.55, depositFeeRate: 0.60 },
  { id: 'CP15071', deposit:   398_400, depositCount:  502, serviceRate: 0.55, networkRate: 0.42, depositFeeRate: 0.55 },
  { id: 'CP15007', deposit:   256_800, depositCount:  318, serviceRate: 0.45, networkRate: 0.52, depositFeeRate: 0.45 },
  { id: 'CP14761', deposit:   198_300, depositCount:  261, serviceRate: 0.38, networkRate: 0.48, depositFeeRate: 0.40 },
  { id: 'CP15692', deposit:   142_700, depositCount:  184, serviceRate: 0.32, networkRate: 0.45, depositFeeRate: 0.35 },
];

export const SERVICE_FEE_DETAIL: ServiceFeeDetailRow[] = _INPUTS.map((r) => {
  const serviceFee = +(r.deposit * r.serviceRate / 100).toFixed(2);
  const networkCost = +(r.deposit * r.networkRate / 100).toFixed(2);
  // 风险充值笔数：充值笔数中被风控标记的一小部分（确定性估算，约 0.8%~3.5%）。
  const riskDepositCount = Math.max(0, Math.round(r.depositCount * (0.008 + ((r.deposit >> 6) % 28) / 1000)));
  return {
    id: r.id,
    deposit: r.deposit,
    depositCount: r.depositCount,
    riskDepositCount,
    serviceFee,
    serviceRate: r.serviceRate,
    depositFeeRate: r.depositFeeRate,
    networkCost,
    networkRate: r.networkRate,
    rateDiff: +(r.serviceRate - r.networkRate).toFixed(2),
    profit: +(serviceFee - networkCost).toFixed(2),
  };
});
