import type { AddressEntry, AutoTask, CollectionRecord } from './types';
import { findToken, isConvertible, isTrxChain } from './tokens';

// ============ Auto tasks ============
export const initialTasks: AutoTask[] = [
  {
    id: 'tk_001',
    name: 'TRX-USDT 大额充值即时归集',
    type: 'large_deposit',
    targets: ['TRX:USDT'],
    triggerAmount: { usd: 5000, amounts: {} },
    cooldown: { value: 1, unit: 'hour' },
    enabled: true,
    createdAt: '2026-04-12T08:00:00Z',
    lastRunAt: '2026-04-28T03:14:11Z',
  },
  {
    id: 'tk_002',
    name: '稳定币每日余额扫描',
    type: 'balance_check',
    targets: ['TRX:USDT', 'ETH:USDT', 'POLYGON:USDC'],
    minCollectAmount: { usd: 50, amounts: {} },
    schedule: { every: 1, unit: 'day', anchorTime: '03:00' },
    enabled: true,
    createdAt: '2026-04-08T11:23:00Z',
    lastRunAt: '2026-04-28T03:00:00Z',
    nextRunAt: '2026-04-29T03:00:00Z',
  },
  {
    id: 'tk_003',
    name: 'TRON 长期沉睡地址回收',
    type: 'inactive',
    targets: ['TRX:USDT', 'TRX:TRX'],
    inactiveWindow: { value: 30, unit: 'day' },
    minCollectAmount: { usd: 100, amounts: {} },
    schedule: { every: 7, unit: 'day', anchorTime: '04:30' },
    enabled: false,
    createdAt: '2026-03-22T07:15:00Z',
    lastRunAt: '2026-04-21T04:30:00Z',
    nextRunAt: '2026-05-04T04:30:00Z',
  },
  {
    id: 'tk_004',
    name: 'BSC 提现兜底归集',
    type: 'withdraw_short',
    targets: ['BSC:USDT', 'BSC:BUSD'],
    minCollectAmount: { usd: 30, amounts: {} },
    cooldown: { value: 6, unit: 'hour' },
    enabled: true,
    createdAt: '2026-04-19T15:42:00Z',
  },
  {
    id: 'tk_005',
    name: 'BSC GAME 项目代币每日扫描',
    type: 'balance_check',
    // mixed: GAME is non-convertible, USDT is convertible -> per-token amount mode
    targets: ['BSC:GAME', 'BSC:USDT'],
    // Mixed: USD 50 applies to BSC:USDT (convertible);
    // BSC:GAME (non-convertible) requires explicit token amount.
    minCollectAmount: {
      usd: 50,
      amounts: { 'BSC:GAME': 200 },
    },
    schedule: { every: 6, unit: 'hour', anchorTime: '00:00' },
    enabled: false,
    createdAt: '2026-05-01T09:30:00Z',
  },
];

// ============ Records / Jobs ============
const iso = (s: string) => new Date(s).toISOString();

// Deterministic generator for plausible full-length addresses.
function pickFrom(alphabet: string, len: number, seed: number): string {
  let out = '';
  let s = seed | 0;
  for (let i = 0; i < len; i++) {
    s = (s * 1103515245 + 12345 + i * 31) | 0;
    out += alphabet[Math.abs(s) % alphabet.length];
  }
  return out;
}
const HEX = '0123456789abcdef';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export function genAddr(chainId: string, seed: number): string {
  switch (chainId) {
    case 'TRX':     return 'T' + pickFrom(BASE58, 33, seed);
    case 'ETH':
    case 'BSC':
    case 'POLYGON':
    case 'ARB':     return '0x' + pickFrom(HEX, 40, seed);
    case 'BTC':     return 'bc1q' + pickFrom(BECH32, 38, seed);
    case 'SOL':     return pickFrom(BASE58, 44, seed);
    default:        return pickFrom(BASE58, 40, seed);
  }
}
export function genTxHash(chainId: string, seed: number): string {
  return (chainId === 'TRX' || chainId === 'BTC' ? '' : '0x') + pickFrom(HEX, 64, seed);
}

function makeAddrEntries(
  chainId: string, tokenId: string, count: number, seed: number,
  minUsd = 30, maxUsd = 1500,
): AddressEntry[] {
  const conv = isConvertible(tokenId);
  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 137;
    const usdAmt = +(minUsd + ((Math.abs(s * 9301 + 49297) % 1000) / 1000) * (maxUsd - minUsd)).toFixed(2);
    const tokenAmount = chainId === 'BTC'
      ? (usdAmt / 65000).toFixed(8)
      : usdAmt.toFixed(2);
    return {
      address: genAddr(chainId, s),
      amount: tokenAmount,
      amountUsd: conv ? usdAmt : undefined,
      isUserPermanent: i % 3 !== 0,
      txHash: genTxHash(chainId, s + 7),
    };
  });
}

const sumAmount = (entries: AddressEntry[]): string =>
  entries.reduce((s, e) => s + Number(e.amount || 0), 0).toFixed(2);

const sumUsd = (entries: AddressEntry[]): number | undefined =>
  entries.every((e) => e.amountUsd != null)
    ? +entries.reduce((s, e) => s + (e.amountUsd ?? 0), 0).toFixed(2)
    : undefined;

export const initialRecords: CollectionRecord[] = [
  // ===== completed (large_deposit) =====
  {
    id: 'job_240',
    occurredAt: iso('2026-05-06T09:14:33'),
    trigger: 'auto_large_deposit',
    triggerName: 'TRX-USDT 大额充值即时归集',
    chainId: 'TRX', tokenId: 'TRX:USDT',
    addresses: [
      { address: genAddr('TRX', 9001), amount: '8500.00', amountUsd: 8500.0,
        isUserPermanent: true, txHash: genTxHash('TRX', 9001) },
    ],
    totalAmount: '8500.00', totalUsd: 8500.0,
    feeUsd: 1.42, energy: 65000, bandwidth: 345, trxConsumed: 5.42,
    status: 'completed',
  },

  // ===== running =====
  {
    id: 'job_241',
    occurredAt: iso('2026-05-06T09:55:02'),
    trigger: 'auto_balance_check',
    triggerName: '稳定币每日余额扫描',
    chainId: 'TRX', tokenId: 'TRX:USDT',
    addresses: makeAddrEntries('TRX', 'TRX:USDT', 12, 84120, 50, 700),
    // Stats reflect "so far" — task still running
    ...(() => {
      const entries = makeAddrEntries('TRX', 'TRX:USDT', 12, 84120, 50, 700);
      return {
        totalAmount: sumAmount(entries),
        totalUsd: sumUsd(entries),
      };
    })(),
    feeUsd: 8.21, energy: 620000, bandwidth: 3940, trxConsumed: 51.32,
    status: 'running',
  },

  // ===== pending =====
  {
    id: 'job_242',
    occurredAt: iso('2026-05-06T10:00:00'),
    trigger: 'auto_balance_check',
    triggerName: '稳定币每日余额扫描',
    chainId: 'ETH', tokenId: 'ETH:USDT',
    addresses: [],
    totalAmount: '0.00',
    totalUsd: 0,
    feeUsd: 0,
    status: 'pending',
  },

  // ===== completed (balance_check, multi-token queue) =====
  {
    id: 'job_239',
    occurredAt: iso('2026-05-05T03:00:18'),
    trigger: 'auto_balance_check',
    triggerName: '稳定币每日余额扫描',
    chainId: 'TRX', tokenId: 'TRX:USDT',
    addresses: makeAddrEntries('TRX', 'TRX:USDT', 17, 8400, 50, 800),
    totalAmount: '6243.18', totalUsd: 6243.18,
    feeUsd: 12.46, energy: 940000, bandwidth: 5870, trxConsumed: 78.56,
    status: 'completed',
  },
  {
    id: 'job_238',
    occurredAt: iso('2026-05-05T03:00:42'),
    trigger: 'auto_balance_check',
    triggerName: '稳定币每日余额扫描',
    chainId: 'POLYGON', tokenId: 'POLYGON:USDC',
    addresses: makeAddrEntries('POLYGON', 'POLYGON:USDC', 3, 6100, 60, 600),
    totalAmount: '980.25', totalUsd: 980.25,
    feeUsd: 0.83,
    status: 'completed',
  },

  // ===== aborted (partial collection — terminated mid-execution) =====
  {
    id: 'job_237',
    occurredAt: iso('2026-05-04T16:08:31'),
    trigger: 'manual',
    triggerName: '手动归集',
    chainId: 'BSC', tokenId: 'BSC:USDT',
    addresses: makeAddrEntries('BSC', 'BSC:USDT', 4, 5500, 40, 400),
    totalAmount: '824.10', totalUsd: 824.10,
    feeUsd: 1.55,
    status: 'aborted',
    abortedAt: iso('2026-05-04T16:09:48'),
    abortedReason: '运营人员手动终止；任务执行至第 4 / 11 个地址时中断',
  },

  // ===== completed (manual) =====
  {
    id: 'job_236',
    occurredAt: iso('2026-05-04T18:42:11'),
    trigger: 'manual',
    triggerName: '手动归集',
    chainId: 'BSC', tokenId: 'BSC:USDT',
    addresses: makeAddrEntries('BSC', 'BSC:USDT', 8, 5500, 40, 400),
    totalAmount: '2148.60', totalUsd: 2148.60,
    feeUsd: 3.15,
    status: 'completed',
  },

  // ===== completed (withdraw_short) =====
  {
    id: 'job_235',
    occurredAt: iso('2026-05-04T11:08:55'),
    trigger: 'auto_withdraw_short',
    triggerName: 'BSC 提现兜底归集',
    chainId: 'BSC', tokenId: 'BSC:USDT',
    addresses: makeAddrEntries('BSC', 'BSC:USDT', 12, 4400, 30, 700),
    totalAmount: '4980.43', totalUsd: 4980.43,
    feeUsd: 4.21,
    status: 'completed',
  },

  // ===== completed (inactive — multi-token queue) =====
  {
    id: 'job_234',
    occurredAt: iso('2026-05-04T04:30:08'),
    trigger: 'auto_inactive',
    triggerName: 'TRON 长期沉睡地址回收',
    chainId: 'TRX', tokenId: 'TRX:USDT',
    addresses: makeAddrEntries('TRX', 'TRX:USDT', 4, 3300, 100, 1200),
    totalAmount: '2380.18', totalUsd: 2380.18,
    feeUsd: 1.85, energy: 88500, bandwidth: 1342, trxConsumed: 16.88,
    status: 'completed',
  },
  {
    id: 'job_233',
    occurredAt: iso('2026-05-04T04:30:24'),
    trigger: 'auto_inactive',
    triggerName: 'TRON 长期沉睡地址回收',
    chainId: 'TRX', tokenId: 'TRX:TRX',
    addresses: [
      { address: genAddr('TRX', 2200), amount: '15800', amountUsd: 1880.4,
        txHash: genTxHash('TRX', 2200) },
    ],
    totalAmount: '15800', totalUsd: 1880.4,
    feeUsd: 0.32, energy: 12000, bandwidth: 245, trxConsumed: 2.21,
    status: 'completed',
  },

  // ===== completed (large_deposit) =====
  {
    id: 'job_232',
    occurredAt: iso('2026-05-03T22:11:02'),
    trigger: 'auto_large_deposit',
    triggerName: 'TRX-USDT 大额充值即时归集',
    chainId: 'TRX', tokenId: 'TRX:USDT',
    addresses: [
      { address: genAddr('TRX', 1100), amount: '12000.00', amountUsd: 12000.0,
        isUserPermanent: true, txHash: genTxHash('TRX', 1100) },
    ],
    totalAmount: '12000.00', totalUsd: 12000.0,
    feeUsd: 1.51, energy: 65000, bandwidth: 345, trxConsumed: 5.51,
    status: 'completed',
  },

  // ===== 8-decimal-amount examples =====
  // BTC native — every address holds a sub-1 BTC quantity, totalAmount has 8 dp.
  {
    id: 'job_231',
    occurredAt: iso('2026-05-03T11:04:18'),
    trigger: 'auto_balance_check',
    triggerName: 'BTC 主网每日扫描',
    chainId: 'BTC', tokenId: 'BTC:BTC',
    addresses: [
      { address: genAddr('BTC', 5500), amount: '0.04217831', amountUsd: 2741.59, txHash: genTxHash('BTC', 5500) },
      { address: genAddr('BTC', 5601), amount: '0.01882047', amountUsd: 1223.33, txHash: genTxHash('BTC', 5601) },
      { address: genAddr('BTC', 5702), amount: '0.06329812', amountUsd: 4114.38, txHash: genTxHash('BTC', 5702) },
      { address: genAddr('BTC', 5803), amount: '0.00698809', amountUsd: 454.23,  txHash: genTxHash('BTC', 5803) },
    ],
    totalAmount: '0.13128499', totalUsd: 8533.53,
    feeUsd: 18.42,
    status: 'completed',
  },

  // Ethereum native — totalAmount across many addresses with high precision.
  {
    id: 'job_230',
    occurredAt: iso('2026-05-02T22:31:55'),
    trigger: 'manual',
    triggerName: '手动归集',
    chainId: 'ETH', tokenId: 'ETH:ETH',
    addresses: [
      { address: genAddr('ETH', 7711), amount: '0.78912345', amountUsd: 2367.37 },
      { address: genAddr('ETH', 7822), amount: '1.20104678', amountUsd: 3603.14 },
      { address: genAddr('ETH', 7933), amount: '0.46661887', amountUsd: 1399.86 },
    ],
    totalAmount: '2.45678910', totalUsd: 7370.37,
    feeUsd: 24.18,
    status: 'completed',
  },

  // Solana native — mix of decimals.
  {
    id: 'job_229',
    occurredAt: iso('2026-05-02T08:12:04'),
    trigger: 'auto_balance_check',
    triggerName: 'Solana 每小时扫描',
    chainId: 'SOL', tokenId: 'SOL:SOL',
    addresses: [
      { address: genAddr('SOL', 8801), amount: '5.12345678', amountUsd: 758.27 },
      { address: genAddr('SOL', 8912), amount: '4.21678910', amountUsd: 624.08 },
      { address: genAddr('SOL', 9023), amount: '3.00543302', amountUsd: 444.80 },
    ],
    totalAmount: '12.34567890', totalUsd: 1827.15,
    feeUsd: 0.12,
    status: 'completed',
  },
];

// ===========================================================================
// Manual collection: queryUncollected — mock the "查询" endpoint.
// Returns a flat list of addresses with their balances + abnormal flag.
// Aggregates and threshold-filtering are computed client-side.
// ===========================================================================

export type UncollectedAddress = {
  address: string;
  amount: string;        // token-native
  amountUsd?: number;
  isAbnormal: boolean;
  reason?: string;       // present iff isAbnormal
};

export type UncollectedQueryResult = {
  chainId: string;
  tokenId: string;
  convertible: boolean;
  addresses: UncollectedAddress[];
};

const ABNORMAL_REASONS = [
  '风控冻结：可疑大额转入',
  '风控冻结：黑名单关联',
  '风控冻结：异常出金频率',
  '风控冻结：来源地址被标记',
  '风控冻结：链上分析疑似洗钱关联',
];

function stringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function queryUncollected(chainId: string, tokenId: string): UncollectedQueryResult {
  const seed = stringHash(`${chainId}:${tokenId}`);
  const conv = isConvertible(tokenId);

  const totalCount = 30 + (seed % 40);                 // 30..70
  const abnormalCount = 4 + (seed % 8);                // 4..12

  const addresses: UncollectedAddress[] = [];
  for (let i = 0; i < totalCount; i++) {
    const s = seed + i * 137 + 1;
    const usdLike = 20 + ((Math.abs(s * 9301 + 49297) % 1000) / 1000) * 2180;
    const v = +(usdLike).toFixed(2);
    const isAbn = i < abnormalCount;
    addresses.push({
      address: genAddr(chainId, s),
      amount: chainId === 'BTC' ? (v / 65000).toFixed(8) : v.toFixed(2),
      amountUsd: conv ? v : undefined,
      isAbnormal: isAbn,
      reason: isAbn ? ABNORMAL_REASONS[i % ABNORMAL_REASONS.length] : undefined,
    });
  }
  return { chainId, tokenId, convertible: conv, addresses };
}

// Re-export for convenience
export { findToken, isTrxChain };
