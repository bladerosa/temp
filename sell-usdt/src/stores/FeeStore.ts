import { makeAutoObservable } from 'mobx';
import type { FeeConfig } from '@/data/types';

/**
 * 费率仓库。
 *
 * - 平台服务费率 `platform`：商户级值，仅在「商户详情 → 收费配置 → 法币提现
 *   编辑」弹窗中维护并保存。
 * - 平台服务费 固定补贴 `platformFlat`：**全局固定 10 USDT**，含义是 `供应商
 *   银行转账补贴`：平台从用户的 sellAmt 中预留 10 USDT 一并转给供应商，供
 *   应商用它去覆盖国际银行汇款手续费，从而保证用户拿到与下单时一致的 USD
 *   到账数。本期写死，无前端编辑入口。
 * - 供应商服务费率 `supplier`：**全局固定 0.5%**，本期产品不提供编辑入口，
 *   只在顶部信息条和计算模拟卡片中只读展示。
 * - 法币提现费率 `fiatWithdraw`：商户级值（与上同一弹窗维护）。
 */
export const FIXED_SUPPLIER_FEE_PCT = '0.5';
export const FIXED_PLATFORM_FLAT_USDT = '10';

export class FeeStore {
  platform = '3';
  /** 固定 10 USDT，无编辑入口。 */
  readonly platformFlat = FIXED_PLATFORM_FLAT_USDT;
  /** 固定 0.5%，无编辑入口。 */
  readonly supplier = FIXED_SUPPLIER_FEE_PCT;
  fiatWithdraw = '1';

  constructor() {
    makeAutoObservable(this);
  }

  get config(): FeeConfig {
    return {
      platform: this.platform,
      platformFlat: this.platformFlat,
      supplier: this.supplier,
      fiatWithdraw: this.fiatWithdraw,
    };
  }

  saveFiatWithdraw = (next: string) => {
    this.fiatWithdraw = next;
  };
}
