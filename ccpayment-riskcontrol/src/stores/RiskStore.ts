import { makeAutoObservable } from 'mobx';
import {
  ADDRESS,
  DEPOSIT,
  WITHDRAW,
  levelForScore,
  type AddressRow,
  type DepositRow,
  type DrawerTarget,
  type LevelKey,
  type NetworkKey,
  type WithdrawRow,
} from '@/data/riskcontrol';

export type RiskTab = 'deposit' | 'withdraw' | 'address';
export type NetFilter = 'all' | NetworkKey;
export type CoinFilter = 'all' | 'USDT' | 'POL';
export type LevelFilter = 'all' | LevelKey;

export class RiskStore {
  tab: RiskTab = 'deposit';
  netFilter: NetFilter = 'all';
  coinFilter: CoinFilter = 'all';
  levelFilter: LevelFilter = 'all';
  search = '';

  /** 风险充值：按 To Address 筛选 */
  toAddressFilter = 'all';
  /** 风险提现：按 From Address 筛选 */
  fromAddressFilter = 'all';

  sel: DrawerTarget | null = null;
  expandedHop: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ---------- computed rows ----------
  get depositRows(): DepositRow[] {
    const q = this.search.trim().toLowerCase();
    return DEPOSIT.filter((r) => {
      if (this.netFilter !== 'all' && r.network !== this.netFilter) return false;
      if (this.coinFilter !== 'all' && !r.amount.toUpperCase().includes(this.coinFilter)) return false;
      if (this.levelFilter !== 'all' && levelForScore(r.score).key !== this.levelFilter) return false;
      if (this.toAddressFilter !== 'all' && r.to !== this.toAddressFilter) return false;
      if (this.tab === 'deposit' && q && !r.displayId.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  get withdrawRows(): WithdrawRow[] {
    const q = this.search.trim().toLowerCase();
    return WITHDRAW.filter((r) => {
      if (this.netFilter !== 'all' && r.network !== this.netFilter) return false;
      if (this.coinFilter !== 'all' && !r.amount.toUpperCase().includes(this.coinFilter)) return false;
      if (this.levelFilter !== 'all' && levelForScore(r.score).key !== this.levelFilter) return false;
      if (this.fromAddressFilter !== 'all' && r.from !== this.fromAddressFilter) return false;
      if (this.tab === 'withdraw' && q && !r.displayId.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  get addressRows(): AddressRow[] {
    const q = this.search.trim().toLowerCase();
    return ADDRESS.filter((r) => {
      if (this.netFilter !== 'all' && r.network !== this.netFilter) return false;
      if (this.levelFilter !== 'all' && levelForScore(r.score).key !== this.levelFilter) return false;
      if (this.tab === 'address' && q && !r.merchantId.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  // ---------- actions ----------
  setTab = (tab: RiskTab) => {
    this.tab = tab;
    this.search = '';
    this.netFilter = 'all';
    this.levelFilter = 'all';
    this.toAddressFilter = 'all';
    this.fromAddressFilter = 'all';
    this.sel = null;
    this.expandedHop = null;
  };

  setNet = (v: NetFilter) => {
    this.netFilter = v;
  };
  setCoin = (v: CoinFilter) => {
    this.coinFilter = v;
  };
  setLevel = (v: LevelFilter) => {
    this.levelFilter = v;
  };
  setSearch = (v: string) => {
    this.search = v;
  };
  setToAddress = (v: string) => {
    this.toAddressFilter = v;
  };
  setFromAddress = (v: string) => {
    this.fromAddressFilter = v;
  };

  reset = () => {
    this.netFilter = 'all';
    this.coinFilter = 'all';
    this.levelFilter = 'all';
    this.search = '';
    this.toAddressFilter = 'all';
    this.fromAddressFilter = 'all';
  };

  /** 风险地址 →「查询充值交易」：跳到风险充值标签，按 To Address 筛该地址 */
  queryDepositByAddress = (address: string) => {
    this.setTab('deposit');
    this.coinFilter = 'all';
    this.toAddressFilter = address;
  };

  /** 风险地址 →「查询提现交易」：跳到风险提现标签，按 From Address 筛该地址 */
  queryWithdrawByAddress = (address: string) => {
    this.setTab('withdraw');
    this.coinFilter = 'all';
    this.fromAddressFilter = address;
  };

  openDetail = (sel: DrawerTarget) => {
    this.sel = sel;
    this.expandedHop = null;
  };
  closeDrawer = () => {
    this.sel = null;
    this.expandedHop = null;
  };
  toggleHop = (i: number) => {
    this.expandedHop = this.expandedHop === i ? null : i;
  };
}
