import type { FeeConfig, FeeDerived, SellOrderRaw } from '@/data/types';

export function deriveRow(
  row: Pick<SellOrderRaw, 'sellAmt' | 'market'>,
  fee: Pick<FeeConfig, 'platform' | 'supplier'>,
): FeeDerived {
  const platformPct = Math.max(0, Math.min(100, Number(fee.platform) || 0)) / 100;
  const supplierPct = Math.max(0, Math.min(100, Number(fee.supplier) || 0)) / 100;
  const platFee = row.sellAmt * platformPct;
  const supAmt = row.sellAmt - platFee;
  const supRate = row.market * (1 - supplierPct);
  const userGot = supAmt * supRate;
  const extFee = row.market > 0 ? row.sellAmt - userGot / row.market : 0;
  return { platFee, supAmt, supRate, userGot, extFee };
}

export function fmtUSDT(n: number): string {
  return (
    n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' USDT'
  );
}

export function fmtFiat(n: number, ccy: string): string {
  return (
    n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' ' + ccy
  );
}

export function fmtMarketRate(rate: number, ccy: string): string {
  return (
    '1 USDT ≈ ' + rate.toLocaleString('en-US', { maximumFractionDigits: 6 }) + ' ' + ccy
  );
}

export function sanitizeFeeInput(raw: string): string {
  let s = raw.replace(/[^\d.]/g, '');
  const i = s.indexOf('.');
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    s = s.slice(0, i + 3);
  }
  return s;
}

export function validateFee(s: string): string {
  if (s === '' || s === '.') return '请输入数值';
  const n = Number(s);
  if (Number.isNaN(n)) return '请输入有效数字';
  if (n < 0 || n > 100) return '范围为 0–100';
  return '';
}
