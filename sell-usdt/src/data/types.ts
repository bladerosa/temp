export type SellOrderRaw = {
  /** Tab-dependent timestamp:
   *  - pending: 提交时间
   *  - transfer-pending: 过审时间
   *  - paying: 标记时间
   *  - completed: 订单创建时间 (modal Create At)
   */
  time: string;
  recordId: string;
  mid: string;
  sellAmt: number;
  market: number;
  ccy: 'USD' | 'EUR' | string;
  bank: string;
  /** Operator who took the last relevant action — set for transfer-pending / paying rows. */
  operator?: string;
  /** Cwallet 运营账户转账金额 (e.g. "100,000 USDT"). */
  cwalletAmt?: string;
  /** Cwallet 转账ID. */
  cwalletId?: string;
};

export type RejectedRow = {
  time: string;
  recordId: string;
  mid: string;
  refund: string;
  reason: string;
  operator: string;
};

export type CompletedRow = SellOrderRaw & {
  /** SellOrderRaw.time = createAt for completed rows. */
  cwalletAmt: string;
  cwalletId: string;
  /** Cwallet 转账时间. */
  transferAt: string;
  /** 已通过审核段. */
  approvedAt: string;
  approvedBy: string;
  /** 已付款段. */
  proofId: string;
  completedAt: string;
  /** List column 法币付款 / 付款银行 pre-formatted. */
  fiatPaid: string;
  payBank: string;
};

export type FeeConfig = {
  platform: string;
  supplier: string;
  fiatWithdraw: string;
};

export type FeeDerived = {
  platFee: number;
  supAmt: number;
  supRate: number;
  userGot: number;
  extFee: number;
};
