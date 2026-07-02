import { makeAutoObservable } from 'mobx';
import type { PeriodUnit, RegionMetric } from '@/data/types';

/** Default window = 近90天 anchored on the prototype's "today" (2026/05/12). */
const DEFAULT_FROM = '2026/02/12';
const DEFAULT_TO = '2026/05/12';

export class MerchantStore {
  // Global filter (商户数据板块顶部时间筛选)
  globalFrom = DEFAULT_FROM;
  globalTo = DEFAULT_TO;
  globalPreset: string = '近90天';

  // KPI table + trend share the unit toggle (日/周/月/季).
  unit: PeriodUnit = 'day';

  // Trend legend toggles.
  hiddenSeries: Partial<Record<'reg' | 'txn' | 'idle', boolean>> = {};

  // Region pie metric.
  regionMetric: RegionMetric = 'reg';

  // Industry pie metric (independent of region tab).
  industryMetric: RegionMetric = 'reg';

  // 收币费率 unit toggle.
  rateUnit: PeriodUnit = 'week';

  // 充值 / 提现 / 换币 排行 TopN.
  depositTopN = 10;
  withdrawTopN = 10;
  exchangeTopN = 10;

  constructor() {
    makeAutoObservable(this);
  }

  applyPreset = (preset: string) => {
    const map: Record<string, [string, string]> = {
      今日: ['2026/05/12', '2026/05/12'],
      本周: ['2026/05/04', '2026/05/12'],
      本月: ['2026/05/01', '2026/05/12'],
      近30天: ['2026/04/13', '2026/05/12'],
      近90天: ['2026/02/12', '2026/05/12'],
      本季度: ['2026/04/01', '2026/05/12'],
      今年至今: ['2026/01/01', '2026/05/12'],
    };
    this.globalPreset = preset;
    if (map[preset]) {
      this.globalFrom = map[preset][0];
      this.globalTo = map[preset][1];
    }
  };

  setUnit = (u: PeriodUnit) => {
    this.unit = u;
  };

  toggleSeries = (k: 'reg' | 'txn' | 'idle') => {
    this.hiddenSeries = { ...this.hiddenSeries, [k]: !this.hiddenSeries[k] };
  };

  setRegionMetric = (m: RegionMetric) => {
    this.regionMetric = m;
  };

  setIndustryMetric = (m: RegionMetric) => {
    this.industryMetric = m;
  };

  setRateUnit = (u: PeriodUnit) => {
    this.rateUnit = u;
  };

  setDepositTopN = (n: number) => {
    this.depositTopN = n;
  };

  setWithdrawTopN = (n: number) => {
    this.withdrawTopN = n;
  };

  setExchangeTopN = (n: number) => {
    this.exchangeTopN = n;
  };
}
