/** Unit of the 商户数据 KPI / trend toggle. */
export type PeriodUnit = 'day' | 'week' | 'month' | 'quarter';

/** Metric channel of the 商户地区分布 pie. */
export type RegionMetric = 'reg' | 'ver' | 'txn' | 'gmv' | 'idle';

/** Industry code shared with the 商户行业分布 card. Keep the union in sync
 *  with the `INDUSTRY_META` table in `data/industries.ts`. */
export type IndustryCode = 'EC' | 'EX' | 'IG' | 'GAME' | 'SAAS' | 'CB' | 'OTHER';

export interface Merchant {
  id: string;
  name: string;
  country: string;
  industry: IndustryCode;
}

export interface RankItem extends Merchant {
  deposit: number;
  exchange: number;
}

/** Per-row data shape rendered into a 商户数据 KPI row. */
export interface KpiRowData {
  reg: number;
  ver: number;
  txn: number | null;
  idle: number | null;
  regUsers?: number;
  verUsers?: number;
  txnPct?: number | null;
  idlePct?: number | null;
}

/** Drill-down context fired when a non-zero KPI cell is clicked. */
export interface DrillCtx {
  metric: 'reg' | 'ver' | 'txn' | 'idle';
  label: string;
  unit: PeriodUnit;
  count: number;
}
