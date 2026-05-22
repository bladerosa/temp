import { makeAutoObservable } from 'mobx';

export type FinancePreset =
  | '今日'
  | '本周'
  | '本月上旬'
  | '本月中旬'
  | '本月'
  | '上月'
  | '本季度'
  | '今年至今'
  | '自定义';

const PRESET_RANGES: Partial<Record<FinancePreset, [string, string]>> = {
  今日: ['2026/05/12', '2026/05/12'],
  本周: ['2026/05/11', '2026/05/12'],
  本月上旬: ['2026/05/01', '2026/05/10'],
  本月中旬: ['2026/05/11', '2026/05/20'],
  本月: ['2026/05/01', '2026/05/12'],
  上月: ['2026/04/01', '2026/04/30'],
  本季度: ['2026/04/01', '2026/05/12'],
  今年至今: ['2026/01/01', '2026/05/12'],
};

export class FinanceStore {
  from = '2026/05/01';
  to = '2026/05/12';
  preset: FinancePreset = '本月';

  constructor() {
    makeAutoObservable(this);
  }

  applyPreset = (p: FinancePreset) => {
    this.preset = p;
    const r = PRESET_RANGES[p];
    if (r) {
      this.from = r[0];
      this.to = r[1];
    }
  };

  applyCustom = (from: string, to: string) => {
    this.from = from;
    this.to = to;
    this.preset = '自定义';
  };
}
