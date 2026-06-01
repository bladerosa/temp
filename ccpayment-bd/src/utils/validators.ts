export const validEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const fmtNumber = (n: number): string => {
  if (n === 0 || n == null) return '0';
  return String(n);
};

export const fmtUsdt = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) return '0';
  return (Math.floor(n * 1e6) / 1e6).toString();
};
