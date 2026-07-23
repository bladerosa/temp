export type TimeUnit = 'day' | 'week' | 'month' | 'year';
export type Operator = 'lt' | 'gt' | 'eq' | 'between';
export type BoundOp = 'lt' | 'lte' | 'gt' | 'gte';
export type CmpOp = 'lt' | 'lte' | 'gt' | 'gte' | 'eq';

export interface RegTimeRelative {
  mode?: 'relative';
  op: Operator;
  n1: string;
  u1: TimeUnit;
  n2: string;
  u2: TimeUnit;
  leftOp?: BoundOp;
  rightOp?: BoundOp;
}

export interface RegTimeAbsolute {
  mode: 'absolute';
  startDate: string;
  endDate: string;
}

export type RegTimeValue = RegTimeRelative | RegTimeAbsolute;

// ── 入金条件（三种类型，同一任务内三选一） ─────────────────────────────────────
export type DepositKind = 'amount' | 'compare' | 'first';

export interface DepositAmountValue {
  startDate: string;
  endDate: string;
  recentN: string;
  recentU: TimeUnit;
  op: Operator;
  a1: string;
  a2: string;
  leftOp?: BoundOp;
  rightOp?: BoundOp;
}

export type ComparePreset = 'recentN' | 'calMonth';

export interface DepositCompareValue {
  // 绝对日期模式（常规通知）：窗口A为数据源，窗口B为对比基准
  aStart: string;
  aEnd: string;
  bStart: string;
  bEnd: string;
  // 相对时间模式（自动通知）
  preset: ComparePreset;
  recentN: string;
  // 命中条件：A [op] B × pct%
  op: CmpOp;
  pct: string;
}

export interface DepositFirstValue {
  // 相对时间模式（自动通知）：首次入金距执行日
  op: CmpOp;
  days: string;
  // 绝对日期模式（常规通知）：首次入金落在某个日期区间内
  startDate: string;
  endDate: string;
}

export interface DepositValue {
  kind: DepositKind;
  amount: DepositAmountValue;
  compare: DepositCompareValue;
  first: DepositFirstValue;
}

// ── 交易状态条件 ─────────────────────────────────────────────────────────────
export interface TxStatusValue {
  deposit: boolean;
  swap: boolean;
  withdraw: boolean;
}

// ── 当前费率条件 ─────────────────────────────────────────────────────────────
export interface FeeRateValue {
  op: Operator;
  v1: string;
  v2: string;
  leftOp?: BoundOp;
  rightOp?: BoundOp;
}

// ── 屏蔽商户（排除项） ────────────────────────────────────────────────────────
export interface BlacklistValue {
  ids: string;
}

export interface ConditionGroupValue {
  regEnabled: boolean;
  regValue: RegTimeValue | null;
  depositEnabled: boolean;
  depositValue: DepositValue | null;
  txEnabled: boolean;
  txValue: TxStatusValue | null;
  feeEnabled: boolean;
  feeValue: FeeRateValue | null;
  blockEnabled: boolean;
  blockValue: BlacklistValue | null;
}

export interface QueryResult {
  count: number;
  sampleIds: string[];
  queriedAt: string;
}

export interface TargetSelectorValue {
  method: 'option' | 'condition';
  optionValue: string;
  conditionValue: ConditionGroupValue | null;
  queryResult: QueryResult | null;
}

export interface AutoNoticeItem {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  schedule: string;
  triggerSummary: string;
  totalMatched: number;
  lastRunAt: string;
  createdAt: string;
  repeat?: 'off' | 'on';
}

export type HistoryStatus = 'sending' | 'sent' | 'failed';

export interface HistoryRow {
  id: string;
  sentAt: string;
  merchantId: string;
  regTime: string;
  regDaysSort: number;
  depositAmount: string;
  depositSort: number;
  channel: string;
  status: HistoryStatus;
  failReason: string | null;
}

export type NavKey = 'notice.normal' | 'notice.auto';
