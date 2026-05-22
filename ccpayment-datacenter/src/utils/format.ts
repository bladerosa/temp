export const fmtInt = (n: number) => n.toLocaleString();

export const fmtMoney = (n: number, frac = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: frac, maximumFractionDigits: frac });

export const fmtTenThousand = (n: number) =>
  `${(n / 10_000).toLocaleString(undefined, { maximumFractionDigits: 1 })} 万`;

export const fmtPct = (n: number | null | undefined, frac = 2) =>
  n == null ? '--' : `${typeof n === 'number' ? n.toFixed(frac) : n}%`;
