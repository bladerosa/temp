export const FINANCE_DAYS = Array.from({ length: 11 }, (_, i) => i + 1);

export interface ProfitPoint {
  date: string;
  income: number;
  cost: number;
  expense: number;
  net: number;
}

export const profitTrend: ProfitPoint[] = FINANCE_DAYS.map((d) => ({
  date: `${d}日`,
  income: d === 6 ? 13.09 : d === 5 ? 0.28 : 0,
  cost: d === 6 ? 0.39 : d === 5 ? 0.09 : 0,
  expense: 0,
  net: d === 6 ? 12.77 : d === 5 ? 0.19 : 0,
}));

export interface CostPoint {
  date: string;
  merchant: number;
  sysAdjust: number;
  sysAggreg: number;
  sysSettle: number;
  total: number;
}

export const costTrend: CostPoint[] = FINANCE_DAYS.map((d) => ({
  date: `${d}日`,
  merchant: d === 6 ? 0.12 : 0,
  sysAdjust: d === 6 ? 0.09 : d === 5 ? 0.3 : 0,
  sysAggreg: d === 6 ? 0.39 : 0,
  sysSettle: 0,
  total: d === 6 ? 0.6 : d === 5 ? 0.3 : 0,
}));

export interface ExpensePoint {
  date: string;
  total: number;
}

export const expenseTrend: ExpensePoint[] = FINANCE_DAYS.map((d) => ({ date: `${d}日`, total: 0 }));

export interface IncomePoint {
  date: string;
  deposit: number;
  withdraw: number;
  swap: number;
  total: number;
}

export const incomeTrend: IncomePoint[] = FINANCE_DAYS.map((d) => ({
  date: `${d}日`,
  deposit: d === 6 ? 0.01 : 0,
  withdraw: d === 6 ? 13.09 : 0,
  swap: d === 6 ? 0.28 : 0,
  total: d === 6 ? 13.39 : 0,
}));

export interface LiquidityPoint {
  date: string;
  merchant: number;
  system: number;
  risk: number;
  cwallet: number;
  net: number;
}

export const liquidityTrend: LiquidityPoint[] = FINANCE_DAYS.map((d) => {
  if (d === 6)
    return { date: `${d}日`, merchant: 110.21, system: -10, risk: -0.3, cwallet: -0.81, net: 99.09 };
  if (d === 10) return { date: `${d}日`, merchant: 90, system: -8, risk: -0.2, cwallet: -0.6, net: 80 };
  return { date: `${d}日`, merchant: 0, system: 0, risk: 0, cwallet: 0, net: 0 };
});

/** Stable per-day asset health values — no Math.random in the render path. */
export const healthTrend = FINANCE_DAYS.map((d) => ({
  date: `${d}日`,
  sys: +(0.5 + 0.18 * Math.sin(d * 0.6)).toFixed(2),
  mer: +(0.45 + 0.16 * Math.cos(d * 0.7)).toFixed(2),
}));

export interface AssetToken {
  symbol: string;
  name: string;
  amount: string;
  usd: string;
  color: string;
}

export const PLATFORM_ASSETS: AssetToken[] = [
  { symbol: 'TRX', name: 'TRON', amount: '882.39', usd: '308.10', color: '#EF0027' },
  { symbol: 'USDT', name: 'Tether USD', amount: '204.06', usd: '204.06', color: '#26A17B' },
  { symbol: 'BNB', name: 'Binance', amount: '0.12', usd: '83.56', color: '#F3BA2F' },
  { symbol: 'POL', name: 'POL Token', amount: '337.39', usd: '34.42', color: '#8247E5' },
  { symbol: 'ETH', name: 'Ethereum', amount: '0.00', usd: '15.59', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', amount: '0.13', usd: '12.79', color: '#9945FF' },
  { symbol: 'TON', name: 'Toncoin', amount: '3.73', usd: '9.13', color: '#0098EA' },
  { symbol: 'XLM', name: 'Stellar', amount: '46.60', usd: '7.73', color: '#1A1F2C' },
];
