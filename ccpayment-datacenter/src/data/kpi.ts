import type { KpiRowData, PeriodUnit } from './types';
import { fmtRange } from '@/utils/dateRange';

/** Lifetime累计 (suffix on 新增注册 column). */
const LIFETIME_USERS = { regUsers: 26418 };

/** Number of explicit period rows above the 「其余时间」 + 「累计」 rows. */
export const MAX_PERIOD_ROWS = 10;

/** Per-period 新增注册 base counts. 10 entries per unit, index 0 = latest. */
const BASE_REG: Record<PeriodUnit, number[]> = {
  day:     [0,   0,   2,   1,   0,   3,   1,   0,   2,   0],
  week:    [12,  18,  9,   15,  11,  14,  8,   17,  13,  16],
  month:   [128, 210, 156, 188, 142, 175, 165, 198, 152, 182],
  quarter: [392, 488, 271, 425, 510, 348, 442, 389, 405, 471],
};

/** Per-period txn/idle scaling factors (10 entries, idx 0 = latest). */
const TXN_FACTORS = [1.00, 0.94, 0.88, 0.92, 0.85, 0.90, 0.87, 0.91, 0.86, 0.89];
const IDLE_FACTORS = [1.00, 1.10, 1.20, 1.05, 1.18, 1.12, 1.22, 1.08, 1.25, 1.15];

/** Returns up to MAX_PERIOD_ROWS labels of the latest 周期 ending at `anchor`.
 *  All units use ROLLING-FROM-END windows:
 *    day=1, week=7, month=30, quarter=90 days back from the anchor.
 *  Unified `YYYY.MM.DD-YYYY.MM.DD` format (single days collapse). */
export function buildPeriodLabels(unit: PeriodUnit, anchor: string, count: number = MAX_PERIOD_ROWS): string[] {
  const [y, m, d] = anchor.split('/').map(Number);
  const base = new Date(y, m - 1, d);
  const span = unit === 'day' ? 1 : unit === 'week' ? 7 : unit === 'month' ? 30 : 90;
  return Array.from({ length: count }, (_, n) => {
    const end = new Date(base);
    end.setDate(base.getDate() - n * span);
    if (span === 1) return fmtRange(end, end);
    const start = new Date(end);
    start.setDate(end.getDate() - (span - 1));
    return fmtRange(start, end);
  });
}

/** Synthetic per-period row. `idx` 0 = latest. Deterministic. */
export function periodData(unit: PeriodUnit, idx: number): KpiRowData {
  const regV = BASE_REG[unit][idx] ?? 0;

  // txn/idle = distinct-merchant count active/idle during this period (NOT cumulative).
  const txnBase = { day: 71, week: 198, month: 624, quarter: 1820 }[unit];
  const idleBase = { day: 7, week: 36, month: 142, quarter: 388 }[unit];
  const txnV = Math.round(txnBase * (TXN_FACTORS[idx] ?? 0.88));
  const idleV = Math.round(idleBase * (IDLE_FACTORS[idx] ?? 1.2));
  const totalActive = txnV + idleV;

  // Cumulative registered users at end of this period.
  const userRatio = { day: 12, week: 11, month: 9, quarter: 8 }[unit];
  let regUsersCum = LIFETIME_USERS.regUsers;
  for (let i = 0; i < idx; i++) {
    const r = BASE_REG[unit][i] ?? 0;
    regUsersCum -= r * userRatio;
  }

  return {
    reg: regV,
    txn: txnV,
    idle: idleV,
    regUsers: regUsersCum,
    txnPct: totalActive ? +((txnV / totalActive) * 100).toFixed(2) : 0,
    idlePct: totalActive ? +((idleV / totalActive) * 100).toFixed(2) : 0,
  };
}

/** "其余时间" row — earlier than the latest MAX_PERIOD_ROWS periods, within
 *  the selected window. */
export function restData(unit: PeriodUnit): KpiRowData {
  const recent = BASE_REG[unit].slice(0, MAX_PERIOD_ROWS);
  const regSum = recent.reduce((a, b) => a + b, 0);
  const userRatio = { day: 12, week: 11, month: 9, quarter: 8 }[unit];

  const txn = { day: 64, week: 68, month: 70, quarter: 71 }[unit];
  const idle = { day: 148, week: 152, month: 155, quarter: 158 }[unit];
  const total = txn + idle;

  return {
    reg: 2243 - regSum,
    regUsers: LIFETIME_USERS.regUsers - regSum * userRatio,
    txn,
    idle,
    txnPct: total ? +((txn / total) * 100).toFixed(2) : 0,
    idlePct: total ? +((idle / total) * 100).toFixed(2) : 0,
  };
}

export function windowDays(from: string, to: string): number {
  const [fy, fm, fd] = from.split('/').map(Number);
  const [ty, tm, td] = to.split('/').map(Number);
  return Math.max(
    1,
    Math.round((new Date(ty, tm - 1, td).getTime() - new Date(fy, fm - 1, fd).getTime()) / 86_400_000) + 1
  );
}

export function periodsInWindow(unit: PeriodUnit, from: string, to: string): number {
  const days = windowDays(from, to);
  if (unit === 'day') return days;
  if (unit === 'week') return Math.ceil(days / 7);
  if (unit === 'month') return Math.ceil(days / 30);
  return Math.ceil(days / 90);
}

/** "累计" row — B口径:
 *   reg/ver  = strict column sum (latest N periods shown + 其余时间 when present).
 *   txn/idle = distinct merchants across the window; decoupled from unit;
 *             smoothed against window length, capped at the quarter ceiling. */
export function totalDataFor(
  unit: PeriodUnit,
  hasRest: boolean,
  from: string,
  to: string,
  shownCount: number = MAX_PERIOD_ROWS
): KpiRowData {
  const recent = Array.from({ length: shownCount }, (_, i) => periodData(unit, i));
  let reg = recent.reduce((s, p) => s + p.reg, 0);
  if (hasRest) {
    const rest = restData(unit);
    reg += rest.reg;
  }
  const days = windowDays(from, to);
  const ratio = 1 - Math.exp(-days / 30);
  const txn = Math.round(71 + (1820 - 71) * ratio);
  const idle = Math.round(158 + (388 - 158) * ratio);
  const total = txn + idle;

  return {
    reg,
    regUsers: LIFETIME_USERS.regUsers,
    txn,
    idle,
    txnPct: total ? +((txn / total) * 100).toFixed(2) : 0,
    idlePct: total ? +((idle / total) * 100).toFixed(2) : 0,
  };
}

/** Expand 其余时间 into per-period rows for CSV export.
 *  Returns [] when the window has ≤ 3 periods of the current unit. */
export function expandRestPeriods(
  unit: PeriodUnit,
  from: string,
  to: string,
  shownCount: number = MAX_PERIOD_ROWS
): (KpiRowData & { label: string })[] {
  const totalPeriods = periodsInWindow(unit, from, to);
  const restN = Math.max(0, totalPeriods - shownCount);
  if (restN === 0) return [];
  const [ty, tm, td] = to.split('/').map(Number);
  const toDate = new Date(ty, tm - 1, td);
  const rest = restData(unit);
  // All units use rolling-from-`toDate` windows: day=1d, week=7d, month=30d,
  // quarter=90d. The first `shownCount` periods are already rendered above
  // the "其余时间" row.
  const span = unit === 'day' ? 1 : unit === 'week' ? 7 : unit === 'month' ? 30 : 90;
  const periodsBack = (n: number): string => {
    const offsetUnits = n + shownCount;
    const end = new Date(toDate);
    end.setDate(toDate.getDate() - offsetUnits * span);
    if (span === 1) return fmtRange(end, end);
    const start = new Date(end);
    start.setDate(end.getDate() - (span - 1));
    return fmtRange(start, end);
  };

  const weights = Array.from({ length: restN }, (_, i) => 1 - (i * 0.4) / Math.max(1, restN - 1));
  const wSum = weights.reduce((a, b) => a + b, 0);
  let regAcc = 0;
  const rows: (KpiRowData & { label: string })[] = [];

  const restTxn = rest.txn ?? 0;
  const restIdle = rest.idle ?? 0;
  const restReg = rest.reg;
  const baseRegUsers = rest.regUsers ?? LIFETIME_USERS.regUsers;

  for (let i = 0; i < restN; i++) {
    const w = weights[i] / wSum;
    const reg = i === restN - 1 ? restReg - regAcc : Math.round(restReg * w);
    regAcc += reg;
    const txn = Math.round(restTxn * w * 0.95 + (restTxn / restN) * 0.05);
    const idle = Math.round(restIdle * w * 0.95 + (restIdle / restN) * 0.05);
    const sum = txn + idle;
    const regUsers = Math.round(baseRegUsers - (regAcc - reg) * 12);
    rows.push({
      label: periodsBack(i),
      reg,
      regUsers,
      txn,
      idle,
      txnPct: sum ? +((txn / sum) * 100).toFixed(2) : 0,
      idlePct: sum ? +((idle / sum) * 100).toFixed(2) : 0,
    });
  }
  return rows;
}
