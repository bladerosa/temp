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

const payFieldValue = (row: RiskPayment, field: PaySearchField): string => {
  switch (field) {
    case 'Txid':
      return row.txid;
    case '从地址':
      return row.from;
    case '批次 ID':
      return row.bill ?? '';
    default:
      return row.id;
  }
};

const withdrawFieldValue = (row: RiskWithdrawal, field: WithdrawSearchField): string => {
  switch (field) {
    case 'Txid':
      return row.txid;
    case '至地址':
      return row.to;
    case '批次 ID':
      return row.bill ?? '';
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
      return payFieldValue(row, this.paySearchField).toLowerCase().includes(q);
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
      if (this.withdrawMode === '單筆' && row.bill) return false;
      if (this.withdrawMode === '批量' && !row.bill) return false;
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

  /** 同一批次 ID 下的所有风险付款。 */
  membersOfBill = (bill: string): RiskPayment[] =>
    bill ? this.payments.filter((p) => p.bill === bill) : [];

  /**
   * 一笔退款覆盖的风险付款。批量取整个批次，非批量取它对应的那一笔充值。
   * 非批量记录未登记来源充值时返回空数组，此时详情弹窗不渲染该区块。
   */
  coveredPayments = (row: RiskWithdrawal): RiskPayment[] => {
    if (row.bill) return this.membersOfBill(row.bill);
    if (!row.source) return [];
    return this.payments.filter((p) => p.id === row.source);
  };

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
