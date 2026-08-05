/**
 * 風險交易列表 — 类型与 mock fixtures。
 *
 * 数据逐条对齐原型 `Risk Transactions.dc.html`（Claude Design 项目
 * `d0d2b94d…9116ea5d0ef`）中的 PAY / WD / BATCH_* 常量，未增删任何字段或行。
 */

export type TokenSymbol = 'USDT' | 'TRX' | 'POL' | 'HBAR';
export type ChainName = 'TRON' | 'Polygon' | 'Hedera';

/** 风险付款的「重新处理状态」。 */
export type ReprocessStatus = 'pending' | 'refunded' | 'rejected' | 'failed';
/** 风险资金提款的链上状态。 */
export type WithdrawStatus = 'success' | 'failed' | 'rejected';

export interface RiskPayment {
  id: string;
  /** 直接儲值 / 用戶儲值 / 儲值 */
  type: string;
  symbol: TokenSymbol;
  /** 带符号与单位的展示字符串，例：`+ 0.2 USDT` */
  amount: string;
  chain: ChainName;
  from: string;
  txid: string;
  time: string;
  reprocess?: ReprocessStatus;
  memo?: string;
  /** 批次 ID；有值表示该笔被并入一次批量退款。 */
  bill?: string;
}

export interface RiskWithdrawal {
  id: string;
  symbol: TokenSymbol;
  /** 带符号与单位的展示字符串，例：`- 0.5 USDT` */
  amount: string;
  chain: ChainName;
  fee: string;
  to: string;
  txid: string;
  /** `--` 表示尚未上链。 */
  time: string;
  status: WithdrawStatus;
  bill?: string;
  memo?: string;
}

/** 表格里的省略地址 → 完整地址。退款弹窗按付款地址回填时用。 */
export const FULL_ADDRESS: Record<string, string> = {
  '0x4766dc52…9db104e37e': '0x4766dc5207f5172c05da8d4f1d66599db104e37e',
  '0x1f38d515…c1f3a3c03a': '0x1f38d515b7a04e29c6d81f5a3be07c1f3a3c03a',
  'TMhCk9FQs2…kuBJWKHUof': 'TMhCk9FQs2P7mDGRZ1PhZns8kuBJWKHUof',
  'TTXSwp47kJ…HFxDm7FqaV': 'TTXSwp47kJ8vLpV9pQmRz3nHFxDm7FqaV',
  'TY8z8xvCRF…m3Xydy2Uof': 'TY8z8xvCRFqL7bNk4dWpXr2m3Xydy2Uof',
};

export interface BatchCoin {
  sym: TokenSymbol;
  label: string;
}

export const BATCH_COINS: BatchCoin[] = [
  { sym: 'POL', label: 'POL-POLYGON' },
  { sym: 'USDT', label: 'USDT-TRON' },
  { sym: 'TRX', label: 'TRX-TRON' },
  { sym: 'HBAR', label: 'HBAR-HEDERA' },
];

export interface BatchChild {
  id: string;
  amount: number;
}
export interface BatchGroup {
  addr: string;
  children: BatchChild[];
}

/** 批量退款确认弹窗里按地址分组的待退款明细。 */
export const BATCH_GROUPS: BatchGroup[] = [
  {
    addr: '0x50e281e7d07707fb1d7bfa55d8761e79483c3d31',
    children: [
      { id: '20251031062114335858193044', amount: 4 },
      { id: '20260609075859415970427518', amount: 13.988156 },
    ],
  },
  {
    addr: '0xe778752d3a79b148b1b7760e3f5a2d90ac41b28c',
    children: [{ id: '20260430101946401510340577', amount: 32.9 }],
  },
];

/** 「指定地址」模式下可选的地址。 */
export const BATCH_ADDRESSES = [
  '0x50e281e7d07707fb1d7bfa55d8761e79483c3d31',
  '0x4766dc5207f5172c05da8d4f1d66599db104e37e',
];

export const PAY_SEARCH_FIELDS = ['紀錄 ID', 'Txid', '从地址', '批次 ID'] as const;
export const WITHDRAW_SEARCH_FIELDS = ['紀錄 ID', 'Txid', '至地址', '批次 ID'] as const;
export const WITHDRAW_MODES = ['全部', '單筆', '批量'] as const;

export type PaySearchField = (typeof PAY_SEARCH_FIELDS)[number];
export type WithdrawSearchField = (typeof WITHDRAW_SEARCH_FIELDS)[number];
export type WithdrawMode = (typeof WITHDRAW_MODES)[number];

export const CHAIN_FEE: Record<ChainName, string> = {
  TRON: '8.15575 USDT',
  Polygon: '0.03169 USDT',
  Hedera: '0.0012 USDT',
};

/** 「已拒絕」时详情里展示的收款地址。 */
export const REJECT_ADDRESS = 'TUQ7qQDWXB…LLbTgJDqav';

/** 支持 memo 的币种。 */
export const MEMO_COINS: TokenSymbol[] = ['HBAR'];

export const tokenIcon = (symbol: TokenSymbol) => `/crypto/${symbol}.svg`;

export const PAYMENTS: RiskPayment[] = [
  { id: '20260506134012409183726501', type: '直接儲值', symbol: 'USDT', amount: '+ 0.2 USDT', chain: 'TRON', from: 'TMhCk9FQs2…kuBJWKHUof', txid: '01994edef8…486543c16a', time: '06 May. 2026 13:40', reprocess: 'pending' },
  { id: '20260319200418386412093771', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000001 TRX', chain: 'TRON', from: 'TTXSwp47kJ…HFxDm7FqaV', txid: '1e123eb220…7c04e12542', time: '19 Mar. 2026 20:04', reprocess: 'refunded' },
  { id: '20260319200312386411870942', type: '直接儲值', symbol: 'HBAR', amount: '+ 8 HBAR', chain: 'Hedera', from: '0.0.5561028', txid: '01c7f42be5…3a90d51f77', time: '19 Mar. 2026 20:03', reprocess: 'refunded', memo: '883921', bill: 'BILL20260319200312' },
  { id: '20260319200247386411664530', type: '直接儲值', symbol: 'POL', amount: '+ 13.988156 POL', chain: 'Polygon', from: '0x50e281e7d0…79483c3d31', txid: '0x8b41c7d902…5ea7710b46', time: '19 Mar. 2026 20:02', reprocess: 'refunded', memo: '', bill: 'BILL20260609075859' },
  { id: '20260319200211386411402277', type: '直接儲值', symbol: 'POL', amount: '+ 4 POL', chain: 'Polygon', from: '0x50e281e7d0…79483c3d31', txid: '0x8b41c7d902…5ea7710b46', time: '19 Mar. 2026 20:02', reprocess: 'refunded', memo: '', bill: 'BILL20260609075859' },
  { id: '20260318190845385833104618', type: '直接儲值', symbol: 'HBAR', amount: '+ 1.2 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '02b6ad9137…5e1c7042ab', time: '18 Mar. 2026 19:08', reprocess: 'rejected', memo: '', bill: 'BILL20260318190845' },
  { id: '20260318185127385826740155', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0x7bccdb3c…05395d7813', time: '18 Mar. 2026 18:51', reprocess: 'failed', memo: '', bill: 'BILL20260318185127' },
  { id: '20260306114218374920553108', type: '直接儲值', symbol: 'HBAR', amount: '+ 12 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '00993af1c2…7b5e04a1d9', time: '06 Mar. 2026 11:42', reprocess: 'pending', memo: '5501723' },
  { id: '20260227093054370118864205', type: '用戶儲值', symbol: 'HBAR', amount: '+ 3.5 HBAR', chain: 'Hedera', from: '0.0.3915672', txid: '0119cf83be…5c7a2e6041', time: '27 Feb. 2026 09:30', reprocess: 'failed', memo: '660412', bill: 'BILL20260227093054' },
  { id: '20260201143938369685607021', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000001 TRX', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: 'fa0f1d07e9…aaae3e4756', time: '01 Feb. 2026 22:39', reprocess: 'refunded' },
  { id: '20260131151012369330908455', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000001 TRX', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: 'e5feaeff70…1e21742cb1', time: '31 Jan. 2026 23:10', reprocess: 'rejected', memo: '', bill: 'BILL20260201093042' },
  { id: '20260130153910368975814522', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000002 TRX', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: '3d5ea73bc3…0aaad796d1', time: '30 Jan. 2026 23:39', reprocess: 'rejected', memo: '', bill: 'BILL20260201093042' },
  { id: '20260130102131368895873108', type: '直接儲值', symbol: 'HBAR', amount: '+ 2.5 HBAR', chain: 'Hedera', from: '0.0.5561028', txid: '01c7f42be5…3a90d51f77', time: '30 Jan. 2026 18:21', reprocess: 'refunded', memo: '883921', bill: 'BILL20260319200312' },
  { id: '20260109034139361185099574', type: '直接儲值', symbol: 'USDT', amount: '+ 1.2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0x2ad51f7c…b83e60d194', time: '09 Jan. 2026 11:41', reprocess: 'failed', memo: '', bill: 'BILL20260318185127' },
  { id: '20260109034135361185083092', type: '儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'TRON', from: 'TMhCk9FQs2…kuBJWKHUof', txid: 'c909bb92a3…63e6e0bc33', time: '09 Jan. 2026 11:41', reprocess: 'refunded' },
  { id: '20251231033626357922293407', type: '用戶儲值', symbol: 'HBAR', amount: '+ 0.8 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '04a7c1de56…8f0b3e7712', time: '31 Dec. 2025 11:36', reprocess: 'rejected', memo: '', bill: 'BILL20260318190845' },
  { id: '20251230114508357610224918', type: '用戶儲值', symbol: 'HBAR', amount: '+ 1.6 HBAR', chain: 'Hedera', from: '0.0.3915672', txid: '05e2fb8a30…71d4c6098e', time: '30 Dec. 2025 19:45', reprocess: 'failed', memo: '660412', bill: 'BILL20260227093054' },
  { id: '20251228090217356804119730', type: '直接儲值', symbol: 'HBAR', amount: '+ 6 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '00993af1c2…7b5e04a1d9', time: '28 Dec. 2025 17:02', reprocess: 'pending', memo: '5501723' },
  { id: '20251221172443354386610255', type: '直接儲值', symbol: 'HBAR', amount: '+ 4.4 HBAR', chain: 'Hedera', from: '0.0.5561028', txid: '03d1be7042…9c4f21ab80', time: '22 Dec. 2025 01:24', reprocess: 'refunded', memo: '771205' },
  { id: '20251219102214353602881744', type: '儲值', symbol: 'USDT', amount: '+ 0.5 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0xa5d7192f…41c9bb0e63', time: '19 Dec. 2025 18:22', reprocess: 'pending' },
];

export const WITHDRAWALS: RiskWithdrawal[] = [
  { id: '20260506030433403575143482', symbol: 'USDT', amount: '- 0.5 USDT', chain: 'TRON', fee: '34.343 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '3b02fd16cc…e4d5002dbf', time: '06 May. 2026 11:11', status: 'success' },
  { id: '20260609075859415970427518', symbol: 'POL', amount: '- 17.988156 POL', chain: 'Polygon', fee: '0.00665804 USDT', to: '0x50e281e7d07707fb1d7bfa…', txid: '0x8b41c7d902…5ea7710b46', time: '09 Jun. 2026 15:59', status: 'success', bill: 'BILL20260609075859', memo: '' },
  { id: '20260319200312386411870942', symbol: 'HBAR', amount: '- 10.5 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.5561028', txid: '01c7f42be5…3a90d51f77', time: '19 Mar. 2026 20:04', status: 'success', bill: 'BILL20260319200312', memo: '883921' },
  { id: '20260430101844401510079714', symbol: 'TRX', amount: '- 0.000007 TRX', chain: 'TRON', fee: '8.15575 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: 'dc4300c749…580ea3d552', time: '06 May. 2026 11:11', status: 'success' },
  { id: '20260430101815401509960028', symbol: 'POL', amount: '- 1 POL', chain: 'Polygon', fee: '0.00665733 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '0x849d8c94…37f114781c', time: '30 Apr. 2026 18:21', status: 'success' },
  { id: '20260318185127385826740155', symbol: 'USDT', amount: '- 3.2 USDT', chain: 'Polygon', fee: '0.03042 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '0x7bccdb3c…05395d7813', time: '18 Mar. 2026 18:52', status: 'failed', bill: 'BILL20260318185127', memo: '' },
  { id: '20260227093054370118864205', symbol: 'HBAR', amount: '- 5.1 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.3915672', txid: '0119cf83be…5c7a2e6041', time: '27 Feb. 2026 09:31', status: 'failed', bill: 'BILL20260227093054', memo: '660412' },
  { id: '20260318190845385833104618', symbol: 'HBAR', amount: '- 2 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.4728193', txid: '02b6ad9137…5e1c7042ab', time: '--', status: 'rejected', bill: 'BILL20260318190845', memo: '' },
  { id: '20260201093042369330908455', symbol: 'TRX', amount: '- 0.000003 TRX', chain: 'TRON', fee: '25.641 USDT', to: 'TY8z8xvCRFxT8jYm3Xydy2U…', txid: 'e5feaeff70…1e21742cb1', time: '--', status: 'rejected', bill: 'BILL20260201093042', memo: '' },
  { id: '20260430074822401472239188', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.0244 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430074653401471866905', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.0244 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430073152401468085714', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.02402 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430072114401465409622', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.02402 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430065537401458963350', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.02416 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430034125401410092518', symbol: 'USDT', amount: '- 3.8 USDT', chain: 'TRON', fee: '61.56 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '', time: '--', status: 'rejected' },
  { id: '20260319120540386316700142', symbol: 'USDT', amount: '- 2 USDT', chain: 'TRON', fee: '30.288 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '979b923aaf…a4c8ec3ffe', time: '19 Mar. 2026 20:05', status: 'success' },
  { id: '20260319120511386316580790', symbol: 'USDT', amount: '- 0.5 USDT', chain: 'TRON', fee: '30.288 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: 'b946ee5cbc…d5da51f005', time: '19 Mar. 2026 20:05', status: 'success' },
  { id: '20260318190912385833410287', symbol: 'USDT', amount: '- 0.2 USDT', chain: 'TRON', fee: '28.104 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '5f1c07ab63…9e2d448a10', time: '18 Mar. 2026 19:09', status: 'success' },
  { id: '20260318185204385827118463', symbol: 'HBAR', amount: '- 3.5 HBAR', chain: 'Hedera', fee: '0.03042 USDT', to: '0.0.3915672', txid: '', time: '18 Mar. 2026 18:52', status: 'failed' },
  { id: '20260306114310374921065509', symbol: 'USDT', amount: '- 1.5 USDT', chain: 'TRON', fee: '25.641 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: 'ab30f6c142…7d1e0c4b95', time: '06 Mar. 2026 11:43', status: 'success' },
];
