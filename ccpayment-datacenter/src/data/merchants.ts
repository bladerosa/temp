import type { Merchant, RankItem } from './types';

export const MERCHANTS: Merchant[] = [
  { id: 'CP15641', name: 'Nimbus Pay',        country: 'SG', industry: 'EC' },
  { id: 'CP14982', name: 'Orchid Exchange',   country: 'HK', industry: 'EX' },
  { id: 'CP15203', name: 'Helio Wallet',      country: 'US', industry: 'EC' },
  { id: 'CP14761', name: 'Tideway Capital',   country: 'JP', industry: 'EX' },
  { id: 'CP15007', name: 'Stratus Markets',   country: 'AE', industry: 'IG' },
  { id: 'CP14550', name: 'Pelago Pay',        country: 'TR', industry: 'CB' },
  { id: 'CP15418', name: 'Verdant Coin',      country: 'KR', industry: 'EX' },
  { id: 'CP14129', name: 'Quanta Trade',      country: 'CN', industry: 'EX' },
  { id: 'CP15692', name: 'Auric Settlements', country: 'GB', industry: 'SAAS' },
  { id: 'CP14893', name: 'Lumen Finance',     country: 'AU', industry: 'CB' },
  { id: 'CP15524', name: 'Bryne Capital',     country: 'CA', industry: 'CB' },
  { id: 'CP15071', name: 'Selene Exchange',   country: 'DE', industry: 'EX' },
  { id: 'CP14618', name: 'Polaris Pay',       country: 'NG', industry: 'EC' },
  { id: 'CP15348', name: 'Astra Crypto',      country: 'VN', industry: 'IG' },
  { id: 'CP15155', name: 'Cobalt Network',    country: 'TH', industry: 'GAME' },
  { id: 'CP14478', name: 'Marrow Finance',    country: 'BR', industry: 'CB' },
  { id: 'CP15602', name: 'Tessera Pay',       country: 'MX', industry: 'EC' },
  { id: 'CP14299', name: 'Halcyon Coin',      country: 'IN', industry: 'EX' },
  { id: 'CP15487', name: 'Kestrel Wallet',    country: 'PH', industry: 'EC' },
  { id: 'CP14802', name: 'Solstice Markets',  country: 'ID', industry: 'GAME' },
];

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function genRanks(seedBase: number): RankItem[] {
  const r = seedRand(seedBase);
  return MERCHANTS.map((m, i) => ({
    ...m,
    deposit: Math.round((1 - i / 25) * 850_000 * (0.6 + r() * 0.8)),
    withdraw: Math.round((1 - i / 25) * 610_000 * (0.6 + r() * 0.8)),
    exchange: Math.round((1 - i / 25) * 420_000 * (0.6 + r() * 0.8)),
  })).sort((a, b) => b.deposit - a.deposit);
}

export type RankRangeKey = '7d' | '30d' | '90d';

export const RANK_DATA: Record<RankRangeKey, RankItem[]> = {
  '7d': genRanks(7),
  '30d': genRanks(30),
  '90d': genRanks(90),
};

/** Translate a Chinese preset label OR a raw range key into a {@link RankRangeKey}.
 *  Unknown labels fall back to '30d'. */
export function resolveRangeKey(label: string | undefined): RankRangeKey {
  const map: Record<string, RankRangeKey> = {
    '7d': '7d',
    '30d': '30d',
    '90d': '90d',
    今日: '7d',
    本周: '7d',
    本月: '30d',
    近30天: '30d',
    本季度: '30d',
    近90天: '90d',
    今年至今: '90d',
    自定义: '30d',
  };
  return (label && map[label]) || '30d';
}
