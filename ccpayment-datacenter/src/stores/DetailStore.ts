import { makeAutoObservable } from 'mobx';

export interface DetailCtx {
  /** When the user enters detail from a ranking card. */
  rank?: 'deposit' | 'exchange';
  /** Caller's preset label — Chinese is fine ("近90天") or one of '7d'|'30d'|'90d'. */
  range?: string;
  /** Top N pre-applied from the ranking card. */
  topN?: number;
  /** When the user enters detail from a KPI cell drill-down. */
  source?: 'kpi-table';
  period?: string;
}

export class DetailStore {
  ctx: DetailCtx | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCtx = (ctx: DetailCtx | null) => {
    this.ctx = ctx;
  };

  clear = () => {
    this.ctx = null;
  };
}
