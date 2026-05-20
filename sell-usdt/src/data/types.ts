export type CwalletTransferStatus = '转账中' | '转账失败' | '已完成';

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
  /** Cwallet 运营账户转账状态. */
  transferStatus?: CwalletTransferStatus;
  /** Cwallet 转账时间 (空当 transferStatus !== '已完成'). */
  transferAt?: string;
  /** 已通过审核段 — 过审时间 / 操作人 (paying / completed rows). */
  approvedAt?: string;
  approvedBy?: string;
  /** 凭证上传时间 / 上传人 — supplier Cwallet 转账凭证 (paying rows). */
  proofUploadedAt?: string;
  proofUploadedBy?: string;
  /** 供应商 Cwallet 转账记录ID (operator entered at 确认转账). */
  supplierTransferId?: string;
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
  transferAt: string;
  approvedAt: string;
  approvedBy: string;
  transferStatus: CwalletTransferStatus;
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
