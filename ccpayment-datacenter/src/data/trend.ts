import type { PeriodUnit } from './types';
import { bucketRanges, bucketSum, platformDailyTrend } from './merchantSeries';
import { windowDays } from './kpi';

export interface TrendPoint {
  date: string;
  reg: number;
  txn: number;
  idle: number;
}

/** Trend series for the 商户数 趋势 chart. Spans the FULL global filter
 *  window, bucketed by the requested unit. Every value is summed from a
 *  per-day perturbation series so:
 *    - changing the window changes the chart automatically
 *    - changing the unit re-buckets the SAME underlying daily data
 *    - the per-day `txn` series here is the same family the per-merchant
 *      sparkline uses, only with a platform-level seed instead of a
 *      merchant.id seed. */
export function aggTrendByUnit(unit: PeriodUnit, from: string, to: string): TrendPoint[] {
  const days = Math.min(365, windowDays(from, to));
  const buckets = bucketRanges(unit, from, to);

  const dailyReg = Array.from({ length: days }, (_, k) => platformDailyTrend('reg', k));
  const dailyTxn = Array.from({ length: days }, (_, k) => platformDailyTrend('txn', k));
  const dailyIdle = Array.from({ length: days }, (_, k) => platformDailyTrend('idle', k));

  const regBuckets = bucketSum(dailyReg, buckets);
  const txnBuckets = bucketSum(dailyTxn, buckets);
  const idleBuckets = bucketSum(dailyIdle, buckets);

  // bucketRanges returns latest-first; chart wants oldest-first.
  const n = buckets.length;
  const points: TrendPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    points.push({
      date: buckets[i].label,
      reg: regBuckets[i],
      txn: txnBuckets[i],
      idle: idleBuckets[i],
    });
  }
  return points;
}
