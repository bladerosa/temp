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

/** 合体搜索框：左侧下拉选字段，右侧输入值（对齐现有系统的筛选组件） */
export type SearchField = 'merchantId' | 'displayId' | 'fromAddress' | 'toAddress' | 'txid' | 'address';

/** 风险充值 / 风险提现的可选字段 */
export const TXN_SEARCH_FIELDS: { value: SearchField; label: string }[] = [
  { value: 'merchantId', label: '商户 ID' },
  { value: 'displayId', label: 'display ID' },
  { value: 'fromAddress', label: 'from address' },
  { value: 'toAddress', label: 'to address' },
  { value: 'txid', label: 'txid' },
];

/** 风险地址的可选字段 */
export const ADDRESS_SEARCH_FIELDS: { value: SearchField; label: string }[] = [
  { value: 'merchantId', label: 'Merchant Id' },
  { value: 'address', label: 'Address' },
];

export class RiskStore {
  tab: RiskTab = 'deposit';
  netFilter: NetFilter = 'all';
  coinFilter: CoinFilter = 'all';
  levelFilter: LevelFilter = 'all';
  search = '';
  /** 合体搜索框左侧选中的字段（各标签默认字段不同） */
  searchField: SearchField = 'displayId';

  sel: DrawerTarget | null = null;
  expandedHop: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 该标签下「字段下拉」可选的字段 */
  get searchFieldOptions() {
    return this.tab === 'address' ? ADDRESS_SEARCH_FIELDS : TXN_SEARCH_FIELDS;
  }

  /** 按「字段 + 关键词」匹配一行交易记录 */
  private matchTxn(r: DepositRow | WithdrawRow, q: string): boolean {
    if (!q) return true;
    const pick: Partial<Record<SearchField, string>> = {
      merchantId: r.displayId,
      displayId: r.displayId,
      fromAddress: r.from,
      toAddress: r.to,
      txid: r.txid,
    };
    return (pick[this.searchField] ?? '').toLowerCase().includes(q);
  }

  // ---------- computed rows ----------
  get depositRows(): DepositRow[] {
    const q = this.search.trim().toLowerCase();
    return DEPOSIT.filter((r) => {
      if (this.netFilter !== 'all' && r.network !== this.netFilter) return false;
      if (this.coinFilter !== 'all' && !r.amount.toUpperCase().includes(this.coinFilter)) return false;
      if (this.levelFilter !== 'all' && levelForScore(r.score).key !== this.levelFilter) return false;
      if (this.tab === 'deposit' && !this.matchTxn(r, q)) return false;
      return true;
    });
  }

  get withdrawRows(): WithdrawRow[] {
    const q = this.search.trim().toLowerCase();
    return WITHDRAW.filter((r) => {
      if (this.netFilter !== 'all' && r.network !== this.netFilter) return false;
      if (this.coinFilter !== 'all' && !r.amount.toUpperCase().includes(this.coinFilter)) return false;
      if (this.levelFilter !== 'all' && levelForScore(r.score).key !== this.levelFilter) return false;
      if (this.tab === 'withdraw' && !this.matchTxn(r, q)) return false;
      return true;
    });
  }

  get addressRows(): AddressRow[] {
    const q = this.search.trim().toLowerCase();
    return ADDRESS.filter((r) => {
      if (this.netFilter !== 'all' && r.network !== this.netFilter) return false;
      if (this.levelFilter !== 'all' && levelForScore(r.score).key !== this.levelFilter) return false;
      if (this.tab === 'address' && q) {
        const v = this.searchField === 'address' ? r.address : r.merchantId;
        if (!v.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  // ---------- actions ----------
  setTab = (tab: RiskTab) => {
    this.tab = tab;
    this.search = '';
    this.searchField = tab === 'address' ? 'merchantId' : 'displayId';
    this.netFilter = 'all';
    this.levelFilter = 'all';
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
  /** 切换搜索字段时清空已输入的关键词，避免字段与值不匹配 */
  setSearchField = (v: SearchField) => {
    this.searchField = v;
    this.search = '';
  };

  reset = () => {
    this.netFilter = 'all';
    this.coinFilter = 'all';
    this.levelFilter = 'all';
    this.search = '';
    this.searchField = this.tab === 'address' ? 'merchantId' : 'displayId';
  };

  /** 风险地址 →「查询充值交易」：跳到风险充值标签，按 to address 搜该地址 */
  queryDepositByAddress = (address: string) => {
    this.setTab('deposit');
    this.coinFilter = 'all';
    this.searchField = 'toAddress';
    this.search = address;
  };

  /** 风险地址 →「查询提现交易」：跳到风险提现标签，按 from address 搜该地址 */
  queryWithdrawByAddress = (address: string) => {
    this.setTab('withdraw');
    this.coinFilter = 'all';
    this.searchField = 'fromAddress';
    this.search = address;
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
