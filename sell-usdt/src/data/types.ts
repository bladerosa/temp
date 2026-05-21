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

export type RejectedRow = SellOrderRaw & {
  /** SellOrderRaw.time = order createAt (used for Order Info Create At in detail modal). */
  /** 已返还代币 list cell, e.g. "120,000 USDT". */
  refund: string;
  /** 拒绝原因 (long-form, modal displays full text). */
  reason: string;
  /** 拒绝时间 (list column + 已拒绝 card). */
  rejectedAt: string;
  /** 拒绝人 (list column + 已拒绝 card). */
  rejectedBy: string;
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

/** Hot-wallet 账目分类 (交易类型). Empty means 「点击标记」 (operator hasn't categorized yet). */
export type HotWalletCategory = '借入' | '供应商退款' | '其他' | '';

export type HotWalletRecord = {
  id: number;            // 主键ID
  accountType: '入账' | '出账';
  category: HotWalletCategory;
  amount: number;
  currency: 'USDT' | 'TRX' | 'ETH';
  network: 'TRON' | 'Polygon' | 'BSC' | 'ERC20' | 'Arbitrum' | 'Optimism' | 'Solana';
  txid: string;
  time: string;
  /** 备注 — when bound via supplier refund flow, holds the sell-USDT order id. */
  remark: string;
};

export type FeeDerived = {
  platFee: number;
  supAmt: number;
  supRate: number;
  userGot: number;
  extFee: number;
};
