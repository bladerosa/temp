import type { IndustryCode, RegionMetric } from './types';

/** Mirror of `regions.ts` for the 商户行业分布 card. Industries are a flat
 *  (single-level) field on each merchant account, so there's no calendar-style
 *  hierarchy — the right-side drilldown shows individual merchant counts
 *  inside the leading industry. */

export interface IndustryRow {
  code: string;
  label: string;
  color: string;
  value: number;
}

export interface IndustryMerchantRow {
  /** Mock merchant Display ID. */
  code: string;
  label: string;
  value: number;
}

export const INDUSTRY_META: ReadonlyArray<{ code: IndustryCode; label: string; color: string }> = [
  { code: 'EC',    label: '跨境电商',           color: '#3C6FF5' },
  { code: 'EX',    label: '数字资产 / 交易所',  color: '#65AEE8' },
  { code: 'IG',    label: '在线博彩',           color: '#BEE072' },
  { code: 'GAME',  label: '游戏 / 直播',        color: '#E7B22B' },
  { code: 'SAAS',  label: 'SaaS 工具',          color: '#7AA139' },
  { code: 'CB',    label: '跨境收款 / 外贸',    color: '#EC684C' },
  { code: 'OTHER', label: '其他',              color: '#A3A8B1' },
];

export function industryLabel(code: IndustryCode): string {
  return INDUSTRY_META.find((m) => m.code === code)?.label ?? code;
}

/** Per-metric counts per industry. Order matches INDUSTRY_META. */
const INDUSTRY_DATA_BY_METRIC: Record<RegionMetric, number[]> = {
  reg:  [712,       458,       320,       285,     198,     162,     108],
  ver:  [310,       196,       138,       122,     84,      64,      92],
  txn:  [240,       168,       122,       96,      68,      48,      78],
  gmv:  [3_650_000, 2_280_000, 1_840_000, 920_000, 580_000, 320_000, 686_000],
  idle: [490,       312,       218,       198,     132,     108,     178],
};

export function industryData(metric: RegionMetric): IndustryRow[] {
  const series = INDUSTRY_DATA_BY_METRIC[metric];
  return INDUSTRY_META.map((m, i) => ({ ...m, value: series[i] }));
}

/* ────────────────────────────────────────────────────────────────────────
 *  Leading-industry drilldown — top merchants inside the leading industry,
 *  scaled per metric. Mirrors `countryBreakdownAPAC` in regions.ts.
 * ────────────────────────────────────────────────────────────────────── */

const LEADING_INDUSTRY_MERCHANTS = [
  { code: 'CP15641', label: 'Nimbus Pay' },
  { code: 'CP14982', label: 'Orchid Exchange' },
  { code: 'CP15203', label: 'Helio Wallet' },
  { code: 'CP14761', label: 'Tideway Capital' },
  { code: 'CP15007', label: 'Stratus Markets' },
  { code: 'CP14550', label: 'Pelago Pay' },
  { code: 'CP15418', label: 'Verdant Coin' },
  { code: 'CP14129', label: 'Quanta Trade' },
] as const;

/** Per-metric values for the 8 leading-industry merchants. */
const LEADING_INDUSTRY_BY_METRIC: Record<RegionMetric, number[]> = {
  reg:  [184, 142, 108,  86,  72,  58,  44,  32],
  ver:  [ 78,  60,  48,  38,  32,  25,  20,  14],
  txn:  [ 62,  48,  38,  30,  25,  20,  15,  11],
  gmv:  [820_000, 720_000, 560_000, 430_000, 320_000, 250_000, 180_000, 120_000],
  idle: [132,  98,  84,  68,  55,  46,  36,  28],
};

export function topMerchantsInLeadingIndustry(metric: RegionMetric): IndustryMerchantRow[] {
  const series = LEADING_INDUSTRY_BY_METRIC[metric];
  return LEADING_INDUSTRY_MERCHANTS.map((m, i) => ({ ...m, value: series[i] }));
}

export function leadingIndustryLabel(): string {
  return INDUSTRY_META[0].label;
}
