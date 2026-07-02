import type { Merchant, PeriodUnit } from './types';
import { windowDays } from './kpi';
import { fmtDot, fmtRange } from '@/utils/dateRange';

/** Hash a short string into a stable numeric seed (for series keys etc.). */
function hashSeed(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) >>> 0;
  return h;
}

/** Canonical perturbation family shared across all data sources. The shape is
 *  base + low-frequency sine + integer noise — deterministic given (seed,
 *  dayIndex), so any caller asking the same (seed, dayIndex) gets the same
 *  number. */
export function perturbedDaily(seed: number, dayIndex: number, base: number, amp: number, noiseMod: number): number {
  const raw = base + Math.sin((seed + dayIndex) / 2.4) * amp + ((seed * (dayIndex + 1)) % noiseMod);
  return Math.max(0, Math.round(raw));
}

/* ────────────────────────────────────────────────────────────────────────
 *  Merchant-scoped series (one series per individual merchant)
 * ────────────────────────────────────────────────────────────────────── */

/** Per-day 交易笔数 for one merchant at a given window-relative day index. */
export function merchantDailyTxnCount(merchant: Merchant, dayIndex: number): number {
  const seedBase = merchant.id.charCodeAt(2) + merchant.id.charCodeAt(3);
  return Math.max(2, perturbedDaily(seedBase, dayIndex, 30, 18, 20));
}

/** Daily counts spanning the window. Single source of truth for the merchant
 *  sparkline + total count + TxnDrawer per-period sums. */
export function merchantSparklineValues(merchant: Merchant, from: string, to: string): number[] {
  const days = Math.min(365, windowDays(from, to));
  return Array.from({ length: days }, (_, k) => merchantDailyTxnCount(merchant, k));
}

/** Fixed trailing daily series for the DetailPage 交易笔数变化趋势 column: always
 *  the most recent `days` days ending at `to`, INDEPENDENT of the global filter
 *  window/unit. Returns oldest-first daily values plus matching `YYYY.MM.DD`
 *  labels (left → right = old → new). Used to cap the sparkline at 90 days. */
export function merchantTrailingDaily(
  merchant: Merchant,
  to: string,
  days = 90,
): { values: number[]; labels: string[] } {
  const [ty, tm, td] = to.split('/').map(Number);
  const end = new Date(ty, tm - 1, td);
  const values: number[] = [];
  const labels: string[] = [];
  // j = 0 → oldest day (days-1 before `to`); j = days-1 → latest (= `to`).
  for (let j = 0; j < days; j++) {
    values.push(merchantDailyTxnCount(merchant, j));
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - j));
    labels.push(fmtDot(d));
  }
  return { values, labels };
}

/* ────────────────────────────────────────────────────────────────────────
 *  Platform-scoped series (aggregate across all merchants)
 * ────────────────────────────────────────────────────────────────────── */

const TREND_PARAMS: Record<'reg' | 'txn' | 'idle', { base: number; amp: number; noise: number }> = {
  reg:  { base: 1.2, amp: 1.0, noise: 3 },
  txn:  { base: 38,  amp: 16,  noise: 14 },
  idle: { base: 9,   amp: 2,   noise: 3 },
};

/** Per-day platform-level series value for trend chart. */
export function platformDailyTrend(seriesKey: 'reg' | 'txn' | 'idle', dayIndex: number): number {
  const seed = hashSeed(seriesKey);
  const p = TREND_PARAMS[seriesKey];
  return perturbedDaily(seed, dayIndex, p.base, p.amp, p.noise);
}

/* ────────────────────────────────────────────────────────────────────────
 *  Bucketing — convert a daily array into per-week/month/quarter buckets
 * ────────────────────────────────────────────────────────────────────── */

export interface Bucket {
  /** Display label, unified `YYYY.MM.DD-YYYY.MM.DD` (single day collapses). */
  label: string;
  start: Date;
  end: Date;
  /** Index into the daily array for the first/last day of this bucket. */
  i0: number;
  i1: number;
}

/** Walk from `to` toward `from` emitting one bucket per unit. Each bucket
 *  knows its [start, end] dates AND its slice indices into the daily array.
 *  Returned order: latest-first (matches table reading order). */
export function bucketRanges(unit: PeriodUnit, from: string, to: string): Bucket[] {
  const [fy, fm, fd] = from.split('/').map(Number);
  const [ty, tm, td] = to.split('/').map(Number);
  const fromDate = new Date(fy, fm - 1, fd);
  const toDate = new Date(ty, tm - 1, td);
  const fromMs = fromDate.getTime();
  const totalDays = Math.min(365, windowDays(from, to));
  const dayIdx = (d: Date) =>
    Math.max(0, Math.min(totalDays - 1, Math.round((d.getTime() - fromMs) / 86_400_000)));

  const out: Bucket[] = [];
  const push = (s: Date, e: Date) => {
    out.push({ label: fmtRange(s, e), start: s, end: e, i0: dayIdx(s), i1: dayIdx(e) });
  };

  if (unit === 'day') {
    const cursor = new Date(toDate);
    while (cursor >= fromDate && out.length < 365) {
      const d = new Date(cursor);
      push(d, d);
      cursor.setDate(cursor.getDate() - 1);
    }
    return out;
  }
  // Week / month / quarter all use ROLLING-FROM-END buckets:
  //   - week    = last 7 days from cursor, then jump 7 days back
  //   - month   = last 30 days from cursor, then jump 30 days back
  //   - quarter = last 90 days from cursor, then jump 90 days back
  // This way every bucket is the same length regardless of calendar months,
  // and the latest bucket always ends exactly at `to`.
  const span = unit === 'week' ? 7 : unit === 'month' ? 30 : 90;
  const cap = unit === 'week' ? 200 : unit === 'month' ? 60 : 30;
  const cursor = new Date(toDate);
  while (cursor >= fromDate && out.length < cap) {
    const end = new Date(cursor);
    const start = new Date(end);
    start.setDate(end.getDate() - (span - 1));
    const clampStart = start < fromDate ? new Date(fromDate) : start;
    push(clampStart, end);
    cursor.setDate(cursor.getDate() - span);
  }
  return out;
}

/** Sum the daily values within each bucket. */
export function bucketSum(daily: number[], buckets: Bucket[]): number[] {
  return buckets.map((b) => {
    let s = 0;
    for (let i = b.i0; i <= b.i1; i++) s += daily[i] ?? 0;
    return s;
  });
}

/** Average the daily values within each bucket (rounded to 2 decimals). */
export function bucketAvg(daily: number[], buckets: Bucket[]): number[] {
  return buckets.map((b) => {
    let s = 0;
    const n = Math.max(1, b.i1 - b.i0 + 1);
    for (let i = b.i0; i <= b.i1; i++) s += daily[i] ?? 0;
    return +(s / n).toFixed(2);
  });
}
