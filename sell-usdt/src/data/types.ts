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
  /**
   * 市场汇率 USDT → 法币。仅支持 USD，固定为 1:1。
   * 字段保留以兼容历史数据结构；新数据写入时统一为 1。
   */
  market: number;
  /** 收款法币币种。仅支持 USD。 */
  ccy: 'USD';
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
  /** 平台服务费率（%，可编辑）。商户级配置，在「法币提现 编辑」弹窗维护。 */
  platform: string;
  /**
   * 供应商银行转账补贴（USDT，固定值）。每笔订单平台从 sellAmt 中预留这么多
   * USDT 一并交给供应商，供应商再用它去覆盖国际汇款银行手续费。本字段后台
   * 配置死，本期写死 10 USDT，前端不可改。
   */
  platformFlat: string;
  /** 供应商服务费率（%，固定 0.5%，无前端编辑入口）。 */
  supplier: string;
  /** 商户级法币提现费率（%，可编辑）。 */
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
  /** 平台服务费（USDT），= sellAmt × 平台服务费率。 */
  platFee: number;
  /** 供应商银行转账补贴（USDT，固定）。 */
  supplierSubsidy: number;
  /** 供应商按 0.5% 留下的服务费（USDT）。 */
  supplierSelfFee: number;
  /** Cwallet 运营账户转给供应商的 USDT，= sellAmt − 平台服务费。 */
  cwalletAmt: number;
  /** 供应商实际承兑给用户的 USDT 数量。 */
  supAmt: number;
  /** 供应商承兑汇率（USDT → 法币）。本期固定 1。 */
  supRate: number;
  /** 用户实际到手（法币 USD）。本期 = supAmt × 1。 */
  userGot: number;
  /** 用户外显服务费（USD），= sellAmt − userGot。 */
  extFee: number;
};
