import { makeAutoObservable, runInAction } from 'mobx';
import { riskTransactionsApi, type HighRiskSettings } from '@/api/riskTransactions';
import {
  BATCH_ADDRESSES,
  BATCH_COINS,
  BATCH_GROUPS,
  type BatchCoin,
  type PaySearchField,
  type ReprocessStatus,
  type RiskPayment,
  type RiskWithdrawal,
  type WithdrawMode,
  type WithdrawSearchField,
} from '@/data/riskTransactions';

export const DEFAULT_PAGE_SIZE = 20;

export type RiskTab = 'pay' | 'withdraw';
export type ReprocessFilter = '全部' | ReprocessStatus;
export type BatchType = 'token' | 'address';

/**
 * 「紀錄 ID」返回两个可匹配值：这笔充值自己的编号，以及处置它的那条退款记录的编号。
 * 后者让商户在付款列表里直接用退款记录编号，一次筛出该次退款覆盖的全部充值 ——
 * 这正是原先「批次 ID」搜索项的作用，现已由记录编号统一承担。
 */
const payFieldValues = (row: RiskPayment, field: PaySearchField): string[] => {
  switch (field) {
    case 'Txid':
      return [row.txid];
    case '从地址':
      return [row.from];
    default:
      return row.refundId ? [row.id, row.refundId] : [row.id];
  }
};

const withdrawFieldValue = (row: RiskWithdrawal, field: WithdrawSearchField): string => {
  switch (field) {
    case 'Txid':
      return row.txid;
    case '至地址':
      return row.to;
    default:
      return row.id;
  }
};

/** 批量退款确认弹窗的默认全选。 */
const allBatchKeys = () =>
  BATCH_GROUPS.reduce<string[]>((acc, g) => acc.concat(g.children.map((c) => c.id)), []);

const selectAllBatch = (): Record<string, boolean> => {
  const next: Record<string, boolean> = {};
  allBatchKeys().forEach((k) => {
    next[k] = true;
  });
  return next;
};

export class RiskTransactionStore {
  payments: RiskPayment[] = [];
  withdrawals: RiskWithdrawal[] = [];
  loading = false;
  loaded = false;

  tab: RiskTab = 'pay';

  // ---- 風險付款 筛选 ----
  paySearchField: PaySearchField = '紀錄 ID';
  payQuery = '';
  payReprocess: ReprocessFilter = '全部';
  payPage = 1;
  payPageSize = DEFAULT_PAGE_SIZE;

  // ---- 風險資金提款 筛选 ----
  withdrawSearchField: WithdrawSearchField = '紀錄 ID';
  withdrawQuery = '';
  withdrawMode: WithdrawMode = '全部';
  withdrawPage = 1;
  withdrawPageSize = DEFAULT_PAGE_SIZE;

  // ---- 高風險支付管理 ----
  settings: HighRiskSettings = { mode: 'auto', path: '原路退回', threshold: '1000' };
  manageOpen = false;

  // ---- 批量退款 ----
  batchOpen = false;
  batchType: BatchType = 'token';
  batchCoin: BatchCoin = BATCH_COINS[0];
  batchAddress = BATCH_ADDRESSES[0];
  batchMin = '';
  batchRefundAddress = '';
  batchMemo = '';

  batchConfirmOpen = false;
  batchSelection: Record<string, boolean> = selectAllBatch();

  // ---- 弹窗目标 ----
  refundTarget: RiskPayment | null = null;
  reprocessDetail: RiskPayment | null = null;
  withdrawDetail: RiskWithdrawal | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadAll = async () => {
    if (this.loaded || this.loading) return;
    this.loading = true;
    const [payments, withdrawals] = await Promise.all([
      riskTransactionsApi.listPayments(),
      riskTransactionsApi.listWithdrawals(),
    ]);
    runInAction(() => {
      this.payments = payments;
      this.withdrawals = withdrawals;
      this.loading = false;
      this.loaded = true;
    });
  };

  setTab = (tab: RiskTab) => {
    this.tab = tab;
  };

  // ---------------------------------------------------------------- 風險付款

  setPaySearchField = (field: PaySearchField) => {
    this.paySearchField = field;
    this.payPage = 1;
  };

  setPayQuery = (query: string) => {
    this.payQuery = query;
    this.payPage = 1;
  };

  setPayReprocess = (value: ReprocessFilter) => {
    this.payReprocess = value;
    this.payPage = 1;
  };

  setPayPage = (page: number) => {
    this.payPage = page;
  };

  setPayPageSize = (size: number) => {
    this.payPageSize = size;
    this.payPage = 1;
  };

  get filteredPayments(): RiskPayment[] {
    const q = this.payQuery.trim().toLowerCase();
    return this.payments.filter((row) => {
      if (this.payReprocess !== '全部' && row.reprocess !== this.payReprocess) return false;
      if (!q) return true;
      return payFieldValues(row, this.paySearchField).some((v) => v.toLowerCase().includes(q));
    });
  }

  get payTotalPages(): number {
    return Math.ceil(this.filteredPayments.length / this.payPageSize);
  }

  get pagedPayments(): RiskPayment[] {
    const start = (this.payPage - 1) * this.payPageSize;
    return this.filteredPayments.slice(start, start + this.payPageSize);
  }

  // -------------------------------------------------------- 風險資金提款

  setWithdrawSearchField = (field: WithdrawSearchField) => {
    this.withdrawSearchField = field;
    this.withdrawPage = 1;
  };

  setWithdrawQuery = (query: string) => {
    this.withdrawQuery = query;
    this.withdrawPage = 1;
  };

  setWithdrawMode = (mode: WithdrawMode) => {
    this.withdrawMode = mode;
    this.withdrawPage = 1;
  };

  setWithdrawPage = (page: number) => {
    this.withdrawPage = page;
  };

  setWithdrawPageSize = (size: number) => {
    this.withdrawPageSize = size;
    this.withdrawPage = 1;
  };

  get filteredWithdrawals(): RiskWithdrawal[] {
    const q = this.withdrawQuery.trim().toLowerCase();
    return this.withdrawals.filter((row) => {
      if (this.withdrawMode === '單筆' && this.isBatchRefund(row.id)) return false;
      if (this.withdrawMode === '批量' && !this.isBatchRefund(row.id)) return false;
      if (!q) return true;
      return withdrawFieldValue(row, this.withdrawSearchField).toLowerCase().includes(q);
    });
  }

  get withdrawTotalPages(): number {
    return Math.ceil(this.filteredWithdrawals.length / this.withdrawPageSize);
  }

  get pagedWithdrawals(): RiskWithdrawal[] {
    const start = (this.withdrawPage - 1) * this.withdrawPageSize;
    return this.filteredWithdrawals.slice(start, start + this.withdrawPageSize);
  }

  /** 某条退款记录覆盖的全部风险充值（按退款记录编号反查）。 */
  coveredBy = (refundId: string): RiskPayment[] =>
    refundId ? this.payments.filter((p) => p.refundId === refundId) : [];

  /** 覆盖两笔及以上充值的退款即为批量退款。 */
  isBatchRefund = (refundId: string): boolean => this.coveredBy(refundId).length >= 2;

  /** 一笔退款覆盖的风险充值；未登记关联时返回空数组，详情弹窗据此不渲染该区块。 */
  coveredPayments = (row: RiskWithdrawal): RiskPayment[] => this.coveredBy(row.id);

  /** 与某笔充值同属一次退款的全部充值（含自身）。 */
  siblingsOfPayment = (row: RiskPayment): RiskPayment[] =>
    row.refundId ? this.coveredBy(row.refundId) : [];

  /**
   * 处置某笔充值的那条风险资金提款记录。
   * 「重新處理詳情」里的记录编号 / To address / Txid 描述的都是这次**退款**，
   * 不是这笔充值本身，因此都要从这条记录上取。
   */
  refundOf = (row: RiskPayment): RiskWithdrawal | undefined =>
    row.refundId ? this.withdrawals.find((w) => w.id === row.refundId) : undefined;

  /**
   * 从详情弹窗查看某笔风险充值：**新开一个浏览器标签页**打开筛选后的列表，
   * 当前页面原样保留，商户看完直接关掉新标签页就回到原处，不需要返回入口。
   */
  jumpToPayment = (id: string) => {
    const url = `${window.location.pathname}?recordId=${encodeURIComponent(id)}`;
    window.open(url, '_blank', 'noopener');
  };

  /**
   * 新标签页打开时，按地址栏参数把列表筛到目标记录。
   * 落点固定为「風險付款」—— 关联记录本身就是一笔风险充值，不存在落到提款列表的场景。
   */
  applyFromQuery = (search: string) => {
    const recordId = new URLSearchParams(search).get('recordId');
    if (!recordId) return;
    this.tab = 'pay';
    this.paySearchField = '紀錄 ID';
    this.payQuery = recordId;
    this.payReprocess = '全部';
    this.payPage = 1;
  };

  // ------------------------------------------------- 高風險支付管理 Drawer

  openManage = () => {
    this.manageOpen = true;
  };

  closeManage = () => {
    this.manageOpen = false;
  };

  /** 原型里模式与退回路径是即时生效的，只有触发值需要「確認」。 */
  setSettingsMode = (mode: HighRiskSettings['mode']) => {
    this.settings = { ...this.settings, mode };
  };

  setSettingsPath = (path: string) => {
    this.settings = { ...this.settings, path };
  };

  /** 「確認」：提交触发值草稿并关闭抽屉。空草稿保留原值。 */
  saveThreshold = async (draft: string) => {
    const threshold = draft.trim() ? draft.trim() : this.settings.threshold;
    const saved = await riskTransactionsApi.saveHighRiskSettings({ ...this.settings, threshold });
    runInAction(() => {
      this.settings = saved;
      this.manageOpen = false;
    });
  };

  // ------------------------------------------------------- 批量退款 Drawer

  openBatch = () => {
    this.batchOpen = true;
  };

  closeBatch = () => {
    this.batchOpen = false;
  };

  setBatchType = (type: BatchType) => {
    this.batchType = type;
  };

  setBatchCoin = (coin: BatchCoin) => {
    this.batchCoin = coin;
  };

  setBatchAddress = (address: string) => {
    this.batchAddress = address;
  };

  setBatchMin = (value: string) => {
    this.batchMin = value;
  };

  setBatchRefundAddress = (value: string) => {
    this.batchRefundAddress = value;
  };

  setBatchMemo = (value: string) => {
    this.batchMemo = value;
  };

  /** 「下一步」：关闭抽屉、打开确认弹窗并重置为全选。 */
  submitBatch = () => {
    this.batchOpen = false;
    this.batchConfirmOpen = true;
    this.batchSelection = selectAllBatch();
  };

  closeBatchConfirm = () => {
    this.batchConfirmOpen = false;
  };

  toggleBatchChild = (id: string) => {
    this.batchSelection = { ...this.batchSelection, [id]: !this.batchSelection[id] };
  };

  toggleBatchGroup = (addr: string) => {
    const group = BATCH_GROUPS.find((g) => g.addr === addr);
    if (!group) return;
    const on = group.children.filter((c) => this.batchSelection[c.id]).length !== group.children.length;
    const next = { ...this.batchSelection };
    group.children.forEach((c) => {
      next[c.id] = on;
    });
    this.batchSelection = next;
  };

  toggleBatchAll = () => {
    const keys = allBatchKeys();
    const on = keys.filter((k) => this.batchSelection[k]).length !== keys.length;
    const next: Record<string, boolean> = {};
    keys.forEach((k) => {
      next[k] = on;
    });
    this.batchSelection = next;
  };

  get batchSelectedCount(): number {
    return allBatchKeys().filter((k) => this.batchSelection[k]).length;
  }

  get batchTotalCount(): number {
    return allBatchKeys().length;
  }

  /** 勾选后的退款总额。 */
  get batchSelectedTotal(): number {
    return BATCH_GROUPS.reduce(
      (sum, g) => sum + g.children.reduce((s, c) => s + (this.batchSelection[c.id] ? c.amount : 0), 0),
      0
    );
  }

  /** 命中的地址数量 —— 预估费用按地址笔数计。 */
  get batchSelectedAddressCount(): number {
    return BATCH_GROUPS.filter((g) => g.children.some((c) => this.batchSelection[c.id])).length;
  }

  // ------------------------------------------------------------ 单笔弹窗

  openRefund = (row: RiskPayment) => {
    this.refundTarget = row;
  };

  closeRefund = () => {
    this.refundTarget = null;
  };

  openReprocessDetail = (row: RiskPayment) => {
    this.reprocessDetail = row;
  };

  closeReprocessDetail = () => {
    this.reprocessDetail = null;
  };

  openWithdrawDetail = (row: RiskWithdrawal) => {
    this.withdrawDetail = row;
  };

  closeWithdrawDetail = () => {
    this.withdrawDetail = null;
  };
}
