import { makeAutoObservable } from 'mobx';
import { INITIAL_PROMOTERS, KNOWN_MERCHANTS, type Promoter, type Merchant } from '@/data/promoters';

export type PromoterFilterKey = 'email' | 'merchant-id' | 'remark';
export type PromoterSortKey =
  | 'time-desc'
  | 'time-asc'
  | 'commission-desc'
  | 'commission-asc';

export class PromoterStore {
  promoters: Promoter[] = INITIAL_PROMOTERS.map((p) => ({
    ...p,
    commissionMerchantIds: p.commissionMerchantIds ? [...p.commissionMerchantIds] : [],
  }));
  filterKey: PromoterFilterKey = 'email';
  filterQuery = '';
  sortKey: PromoterSortKey = 'time-desc';

  constructor() {
    makeAutoObservable(this);
  }

  setFilterKey = (k: PromoterFilterKey) => {
    this.filterKey = k;
  };
  setFilterQuery = (q: string) => {
    this.filterQuery = q;
  };
  setSortKey = (k: PromoterSortKey) => {
    this.sortKey = k;
  };

  bindMerchant = (email: string, id: string) => {
    const target = this.promoters.find((p) => p.email === email);
    if (!target) return;
    target.merchant = {
      name: KNOWN_MERCHANTS[id] ?? `Merchant ${id.replace('CP', '')}`,
      id,
    };
  };

  unbindMerchant = (email: string) => {
    const target = this.promoters.find((p) => p.email === email);
    if (target) target.merchant = null;
  };

  /** 分佣关系：该推广者是否已绑定指定商户号 */
  hasCommissionMerchant = (email: string, id: string): boolean => {
    const target = this.promoters.find((p) => p.email === email);
    return !!target?.commissionMerchantIds?.includes(id);
  };

  /** 分佣关系：将商户加入推广者的绑定关系（享受分佣） */
  addCommissionMerchant = (email: string, id: string) => {
    const target = this.promoters.find((p) => p.email === email);
    if (!target) return;
    if (!target.commissionMerchantIds) target.commissionMerchantIds = [];
    if (!target.commissionMerchantIds.includes(id)) target.commissionMerchantIds.push(id);
  };

  /** 分佣关系：将商户移出推广者的绑定关系（不再享受分佣） */
  removeCommissionMerchant = (email: string, id: string) => {
    const target = this.promoters.find((p) => p.email === email);
    if (!target?.commissionMerchantIds) return;
    target.commissionMerchantIds = target.commissionMerchantIds.filter((x) => x !== id);
  };

  updateRemark = (email: string, remark: string) => {
    const target = this.promoters.find((p) => p.email === email);
    if (target) target.remark = remark;
  };

  conflictForId = (id: string, excludeEmail: string): Promoter | undefined => {
    return this.promoters.find(
      (p) => p.email !== excludeEmail && p.merchant && p.merchant.id === id,
    );
  };

  lookupMerchant = (email: string): Merchant | null => {
    if (!email || email === '--') return null;
    const p = this.promoters.find((pp) => pp.email === email);
    return p && p.merchant ? p.merchant : null;
  };

  get filtered(): Promoter[] {
    const q = this.filterQuery.trim().toLowerCase();
    let out = this.promoters.slice();
    if (q) {
      out = out.filter((p) => {
        if (this.filterKey === 'email') return (p.email || '').toLowerCase().includes(q);
        if (this.filterKey === 'remark') return (p.remark || '').toLowerCase().includes(q);
        if (this.filterKey === 'merchant-id')
          return ((p.merchant && p.merchant.id) || '').toLowerCase().includes(q);
        return false;
      });
    }
    out.sort((a, b) => {
      switch (this.sortKey) {
        case 'time-asc':
          return a.joined.localeCompare(b.joined);
        case 'time-desc':
          return b.joined.localeCompare(a.joined);
        case 'commission-asc':
          return a.totalCom - b.totalCom;
        case 'commission-desc':
          return b.totalCom - a.totalCom;
      }
    });
    return out;
  }
}
