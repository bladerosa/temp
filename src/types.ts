export type TimeUnit = 'day' | 'week' | 'month' | 'year';
export type Operator = 'lt' | 'gt' | 'eq' | 'between';
export type BoundOp = 'lt' | 'lte' | 'gt' | 'gte';

export interface RegTimeRelative {
  mode: 'relative';
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

export interface DepositValue {
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

export interface ConditionGroupValue {
  regEnabled: boolean;
  regValue: RegTimeValue | null;
  depositEnabled: boolean;
  depositValue: DepositValue | null;
}

export interface TargetSelectorValue {
  method: 'option' | 'condition';
  optionValue: string;
  conditionValue: ConditionGroupValue | null;
  queryResult: QueryResult | null;
}

export interface QueryResult {
  count: number;
  sampleIds: string[];
  queriedAt: string;
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
