// Auto-collection task & collection record types

export type TaskType =
  | 'large_deposit'   // 大额充值检测
  | 'inactive'        // 地址未活跃
  | 'balance_check'   // 地址余额检测
  | 'withdraw_short'; // 提现不足触发

export type TimeUnit = 'minute' | 'hour' | 'day';

// Cron-ish schedule. Always anchored to a wall-clock moment so
// the loop can compute next-run.
export type Schedule = {
  every: number;
  unit: TimeUnit;
  anchorTime: string;       // e.g. "03:00"
};

export type InactiveWindow = {
  value: number;
  unit: 'day' | 'week' | 'month';
};

export type Targets = string[]; // tokenId list, e.g. ['TRX:USDT', 'ETH:USDT']

// Amount spec — single shape combining a shared USD value (used for all
// convertible-to-USD targets) and per-token-id amounts (used for non-convertible
// targets). Both fields may coexist when the selected targets are mixed:
//   - all convertible      → usd > 0, amounts is empty
//   - all non-convertible  → usd is unused, amounts has every selected target
//   - mixed                → usd > 0 AND amounts has every non-convertible target
export type AmountSpec = {
  usd: number;
  amounts: Record<string, number>; // tokenId → token-native quantity
};

export type Cooldown = { value: number; unit: 'minute' | 'hour' | 'day' };

export type BaseTask = {
  id: string;
  name: string;
  type: TaskType;
  targets: Targets;
  enabled: boolean;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
};

export type LargeDepositTask = BaseTask & {
  type: 'large_deposit';
  triggerAmount: AmountSpec;
  cooldown: Cooldown;
};

export type InactiveTask = BaseTask & {
  type: 'inactive';
  inactiveWindow: InactiveWindow;
  minCollectAmount: AmountSpec;
  schedule: Schedule;
};

export type BalanceCheckTask = BaseTask & {
  type: 'balance_check';
  minCollectAmount: AmountSpec;
  schedule: Schedule;
};

export type WithdrawShortTask = BaseTask & {
  type: 'withdraw_short';
  minCollectAmount: AmountSpec;
  cooldown: Cooldown;
};

export type AutoTask =
  | LargeDepositTask
  | InactiveTask
  | BalanceCheckTask
  | WithdrawShortTask;

// ===== Records (jobs) =====

export type RecordTrigger =
  | 'auto_large_deposit'
  | 'auto_inactive'
  | 'auto_balance_check'
  | 'auto_withdraw_short'
  | 'manual';

export type JobStatus = 'pending' | 'running' | 'completed' | 'aborted';

export type CollectionRecord = {
  id: string;
  occurredAt: string;
  trigger: RecordTrigger;
  triggerName?: string;
  chainId: string;
  tokenId: string;
  addresses: AddressEntry[];
  totalUsd?: number;          // undefined for non-convertible token
  totalAmount: string;        // token-native total (sum of addresses[].amount)
  feeUsd: number;
  energy?: number;            // TRX-only
  bandwidth?: number;         // TRX-only
  trxConsumed?: number;       // TRX-only
  status: JobStatus;
  txHashes?: string[];
  abortedAt?: string;
  abortedReason?: string;
};

export type AddressEntry = {
  address: string;
  amount: string;
  amountUsd?: number;         // undefined for non-convertible token
  isUserPermanent?: boolean;
  isAbnormal?: boolean;       // flagged by risk control
  txHash?: string;
};

export const TASK_TYPE_META: Record<TaskType, { name: string; desc: string; cls: string }> = {
  large_deposit: {
    name: '大额充值检测',
    desc: '检测到目标 chain 上目标 token 收到 ≥ 触发金额（USD）的充值时，立刻归集该笔资产到系统热钱包。',
    cls: 'primary',
  },
  inactive: {
    name: '地址未活跃',
    desc: '在设定的检测周期到达时，对未活跃时长内无出入金的目标地址进行余额扫描，达到最小归集金额则归集。',
    cls: 'info',
  },
  balance_check: {
    name: '地址余额检测',
    desc: '在设定的检测周期到达时，扫描所有目标地址的目标 token 余额，余额 ≥ 最小归集金额则归集。',
    cls: 'success',
  },
  withdraw_short: {
    name: '提现不足触发',
    desc: '当系统提现时检测到余额不足，自动异步发起一次该 chain 上该 token 的全地址归集请求。',
    cls: 'warning',
  },
};

export const JOB_STATUS_META: Record<JobStatus, { name: string; cls: string }> = {
  pending:   { name: '待执行', cls: 'neutral' },
  running:   { name: '执行中', cls: 'info' },
  completed: { name: '已完成', cls: 'success' },
  aborted:   { name: '已终止', cls: 'error' },
};
