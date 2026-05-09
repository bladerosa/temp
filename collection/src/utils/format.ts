// Display formatters shared across pages and components.
// Ported from the original Primitives.tsx — semantics must match 1:1
// so existing copy/screenshots still apply.

import dayjs from 'dayjs';

/** USD with thousand separators, always 2 decimals. */
export const usd = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** USD with thousand separators, no decimals — used in compact stat cards. */
export const usdShort = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/**
 * Format a token quantity. Up to 8 decimals, trailing zeros trimmed,
 * with thousand separators on the integer part.
 *   "8500.00"      → "8,500"
 *   "1.50000000"   → "1.5"
 *   "0.123456789"  → "0.12345679"   (rounded at 8 dp)
 */
export const fmtTokenAmount = (n: number | string): string => {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString('en-US', { maximumFractionDigits: 8, minimumFractionDigits: 0 });
};

/** Step value for token-amount <input> elements — supports up to 8 decimals. */
export const TOKEN_AMOUNT_STEP = '0.00000001';

/** ISO datetime → "YYYY-MM-DD HH:mm:ss". */
export const fmtDateTime = (iso: string) => dayjs(iso).format('YYYY-MM-DD HH:mm:ss');

/** ISO date → "YYYY-MM-DD". */
export const fmtDate = (iso: string) => dayjs(iso).format('YYYY-MM-DD');

/** Plain number with thousand separators. */
export const numFmt = (n: number, dp = 2) =>
  n.toLocaleString('en-US', { maximumFractionDigits: dp, minimumFractionDigits: dp === 0 ? 0 : 0 });

/** Chinese unit name for time-unit enums. */
export function unitName(u: 'minute' | 'hour' | 'day' | 'week' | 'month'): string {
  return ({ minute: '分钟', hour: '小时', day: '天', week: '周', month: '月' } as const)[u];
}
