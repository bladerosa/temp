export type SellOrderRaw = {
  time: string;
  recordId: string;
  mid: string;
  sellAmt: number;
  market: number;
  ccy: 'USD' | 'EUR' | string;
  bank: string;
};

export type RejectedRow = {
  time: string;
  recordId: string;
  mid: string;
  refund: string;
  reason: string;
  operator: string;
};

export type CompletedRow = {
  time: string;
  orderId: string;
  mid: string;
  fiatPaid: string;
  payBank: string;
  proofId: string;
  cwalletTo: string;
  cwalletId: string;
  operator: string;
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
