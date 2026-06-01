import { makeAutoObservable } from 'mobx';
import { makeWithdrawals, type Withdrawal, type WithdrawalStatus } from '@/data/withdrawals';

export type WdFilterKey = 'email' | 'merchant' | 'address';
export type WdSortKey = 'time-desc' | 'time-asc' | 'amount-desc' | 'amount-asc';

export class WithdrawalStore {
  withdrawals: Withdrawal[] = makeWithdrawals();
  filterKey: WdFilterKey = 'email';
  filterQuery = '';
  sortKey: WdSortKey = 'time-desc';
  statusFilter: WithdrawalStatus | 'all' = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  setFilterKey = (k: WdFilterKey) => {
    this.filterKey = k;
  };
  setFilterQuery = (q: string) => {
    this.filterQuery = q;
  };
  setSortKey = (k: WdSortKey) => {
    this.sortKey = k;
  };
  setStatusFilter = (s: WithdrawalStatus | 'all') => {
    this.statusFilter = s;
  };
}
