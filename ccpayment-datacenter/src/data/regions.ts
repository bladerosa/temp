import type { RegionMetric } from './types';

export type RegionCode = 'APAC' | 'EU' | 'NA' | 'LATAM' | 'MENA' | 'AF';

export interface RegionRow {
  code: RegionCode;
  label: string;
  color: string;
  value: number;
}

export interface CountryRow {
  code: string;
  label: string;
  value: number;
}

const REGION_META: ReadonlyArray<{ code: RegionCode; label: string; color: string }> = [
  { code: 'APAC',  label: '亚太 (APAC)',       color: '#3C6FF5' },
  { code: 'EU',    label: '欧洲 (Europe)',     color: '#65AEE8' },
  { code: 'NA',    label: '北美 (N. America)', color: '#BEE072' },
  { code: 'LATAM', label: '拉美 (LatAm)',      color: '#E7B22B' },
  { code: 'MENA',  label: '中东/北非 (MENA)',  color: '#7AA139' },
  { code: 'AF',    label: '撒哈拉以南非洲',    color: '#EC684C' },
];

// 6 大洲已经把整个地球覆盖完了，没有「其他」这一桶。原 OTHER 的小尾巴合到 APAC。
const REGION_DATA_BY_METRIC: Record<RegionMetric, number[]> = {
  reg:  [1012,      524,       318,       186,     142,     61],
  ver:  [432,       248,       162,       78,      64,      22],
  txn:  [326,       196,       142,       62,      48,      14],
  gmv:  [4_858_000, 2_140_000, 1_950_000, 480_000, 392_000, 96_000],
  idle: [686,       328,       176,       124,     94,      47],
};

export function regionData(metric: RegionMetric): RegionRow[] {
  const series = REGION_DATA_BY_METRIC[metric];
  return REGION_META.map((m, i) => ({ ...m, value: series[i] }));
}

export function regionLabel(code: RegionCode): string {
  return REGION_META.find((m) => m.code === code)?.label ?? code;
}

/* ────────────────────────────────────────────────────────────────────────
 *  Per-region country breakdowns. Click a slice in the donut → drilldown
 *  shows that region's country list. Each region has its own meta + per-
 *  metric numbers; "其他" (OTHER) intentionally has no breakdown.
 * ────────────────────────────────────────────────────────────────────── */

interface CountryMeta {
  code: string;
  label: string;
}

const COUNTRY_META: Record<RegionCode, ReadonlyArray<CountryMeta>> = {
  APAC: [
    { code: '🇸🇬', label: '新加坡' },
    { code: '🇭🇰', label: '香港' },
    { code: '🇯🇵', label: '日本' },
    { code: '🇰🇷', label: '韩国' },
    { code: '🇮🇩', label: '印尼' },
    { code: '🇹🇭', label: '泰国' },
    { code: '🇻🇳', label: '越南' },
    { code: '🇵🇭', label: '菲律宾' },
  ],
  EU: [
    { code: '🇩🇪', label: '德国' },
    { code: '🇬🇧', label: '英国' },
    { code: '🇫🇷', label: '法国' },
    { code: '🇮🇹', label: '意大利' },
    { code: '🇪🇸', label: '西班牙' },
    { code: '🇳🇱', label: '荷兰' },
    { code: '🇨🇭', label: '瑞士' },
    { code: '🇵🇱', label: '波兰' },
  ],
  NA: [
    { code: '🇺🇸', label: '美国' },
    { code: '🇨🇦', label: '加拿大' },
    { code: '🇲🇽', label: '墨西哥' },
  ],
  LATAM: [
    { code: '🇧🇷', label: '巴西' },
    { code: '🇦🇷', label: '阿根廷' },
    { code: '🇨🇱', label: '智利' },
    { code: '🇨🇴', label: '哥伦比亚' },
    { code: '🇵🇪', label: '秘鲁' },
  ],
  MENA: [
    { code: '🇦🇪', label: '阿联酋' },
    { code: '🇸🇦', label: '沙特' },
    { code: '🇹🇷', label: '土耳其' },
    { code: '🇪🇬', label: '埃及' },
    { code: '🇲🇦', label: '摩洛哥' },
  ],
  AF: [
    { code: '🇳🇬', label: '尼日利亚' },
    { code: '🇿🇦', label: '南非' },
    { code: '🇰🇪', label: '肯尼亚' },
    { code: '🇬🇭', label: '加纳' },
  ],
};

const COUNTRY_DATA_BY_METRIC: Record<RegionCode, Record<RegionMetric, number[]>> = {
  APAC: {
    reg:  [247, 198, 156, 124, 87, 74, 51, 45],
    ver:  [108, 84,  64,  52,  36, 31, 22, 19],
    txn:  [86,  62,  44,  38,  26, 22, 16, 14],
    gmv:  [1_240_000, 980_000, 760_000, 560_000, 320_000, 280_000, 180_000, 140_000],
    idle: [161, 136, 112, 86,  61, 52, 35, 31],
  },
  EU: {
    reg:  [124, 96, 82, 68, 54, 42, 32, 26],
    ver:  [58,  44, 38, 32, 24, 20, 16, 12],
    txn:  [44,  34, 28, 24, 18, 14, 12, 8],
    gmv:  [520_000, 380_000, 320_000, 280_000, 220_000, 160_000, 130_000, 90_000],
    idle: [82,  64, 56, 48, 36, 28, 22, 16],
  },
  NA: {
    reg:  [186, 88, 44],
    ver:  [98,  42, 22],
    txn:  [78,  36, 18],
    gmv:  [1_120_000, 540_000, 290_000],
    idle: [108, 48, 24],
  },
  LATAM: {
    reg:  [68, 42, 30, 26, 20],
    ver:  [28, 18, 14, 10, 8],
    txn:  [24, 14, 10, 8,  6],
    gmv:  [180_000, 120_000, 80_000, 60_000, 40_000],
    idle: [46, 30, 22, 16, 10],
  },
  MENA: {
    reg:  [48, 36, 26, 18, 14],
    ver:  [22, 16, 12, 8,  6],
    txn:  [18, 12, 8,  6,  4],
    gmv:  [140_000, 100_000, 72_000, 50_000, 30_000],
    idle: [32, 24, 18, 12, 8],
  },
  AF: {
    reg:  [22, 16, 14, 9],
    ver:  [8,  6,  5,  3],
    txn:  [6,  4,  3,  1],
    gmv:  [38_000, 28_000, 18_000, 12_000],
    idle: [18, 12, 10, 7],
  },
};

export function countryBreakdown(regionCode: RegionCode, metric: RegionMetric): CountryRow[] {
  const meta = COUNTRY_META[regionCode];
  const values = COUNTRY_DATA_BY_METRIC[regionCode][metric];
  return meta.map((c, i) => ({ ...c, value: values[i] ?? 0 }));
}

/** Back-compat alias for the original APAC-only entry point. */
export function countryBreakdownAPAC(metric: RegionMetric): CountryRow[] {
  return countryBreakdown('APAC', metric);
}
