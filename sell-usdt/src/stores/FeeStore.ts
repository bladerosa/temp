import { makeAutoObservable } from 'mobx';
import type { FeeConfig } from '@/data/types';

export class FeeStore {
  platform = '3';
  supplier = '0.5';
  fiatWithdraw = '1';

  constructor() {
    makeAutoObservable(this);
  }

  get config(): FeeConfig {
    return {
      platform: this.platform,
      supplier: this.supplier,
      fiatWithdraw: this.fiatWithdraw,
    };
  }

  saveSellFee = (next: { platform: string; supplier: string }) => {
    this.platform = next.platform;
    this.supplier = next.supplier;
  };

  saveFiatWithdraw = (next: string) => {
    this.fiatWithdraw = next;
  };
}
