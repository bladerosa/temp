/** Canonical platform-wide format for any displayed time period.
 *  Always renders as `YYYY.MM.DD-YYYY.MM.DD` per the agreed standard.
 *  Single-day periods collapse start==end into one date for readability. */

const pad = (n: number) => String(n).padStart(2, '0');

export const fmtDot = (dt: Date): string =>
  `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())}`;

/** Format a [start, end] inclusive date range. Single-day ranges (start===end)
 *  collapse to one date instead of repeating it. */
export function fmtRange(start: Date, end: Date): string {
  const a = fmtDot(start);
  const b = fmtDot(end);
  return a === b ? a : `${a}-${b}`;
}

/** Convert a slash-separated date string like "2026/05/12" to the dot form
 *  "2026.05.12". Used when we already have the YYYY/MM/DD source from store
 *  state and just need to swap separators. */
export const slashToDot = (s: string): string => s.replaceAll('/', '.');

/** Convert two YYYY/MM/DD strings into the canonical range string. */
export function fmtRangeStr(from: string, to: string): string {
  const dotFrom = slashToDot(from);
  const dotTo = slashToDot(to);
  return dotFrom === dotTo ? dotFrom : `${dotFrom}-${dotTo}`;
}
