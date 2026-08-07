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
  /**
   * 处置这笔充值的那条风险资金提款记录的记录编号。
   * 有值表示已被退款处置；同一个值被多笔充值引用时，即为一次批量退款。
   */
  refundId?: string;
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

export const PAY_SEARCH_FIELDS = ['紀錄 ID', 'Txid', '从地址'] as const;
export const WITHDRAW_SEARCH_FIELDS = ['紀錄 ID', 'Txid', '至地址'] as const;
export const WITHDRAW_MODES = ['全部', '單筆', '批量'] as const;

export type PaySearchField = (typeof PAY_SEARCH_FIELDS)[number];
export type WithdrawSearchField = (typeof WITHDRAW_SEARCH_FIELDS)[number];
export type WithdrawMode = (typeof WITHDRAW_MODES)[number];

export const CHAIN_FEE: Record<ChainName, string> = {
  TRON: '8.15575 USDT',
  Polygon: '0.03169 USDT',
  Hedera: '0.0012 USDT',
};

/**
 * 详情里的「To address」在未成功退款时展示的退款地址 —— 即发起这笔退款时
 * 填写（手动）或按退回路径选出（自动）的目标地址。按链给出对应格式，
 * 否则会出现「Hedera 记录上显示 TRON 形态地址」这种不成立的演示数据。
 */
export const REFUND_ADDRESS: Record<ChainName, string> = {
  TRON: 'TUQ7qQDWXB…LLbTgJDqav',
  Polygon: '0x9c4b2f7a51…6e08d3b1fa',
  Hedera: '0.0.6172094',
};

/** 支持 memo 的币种。 */
export const MEMO_COINS: TokenSymbol[] = ['HBAR'];

export const tokenIcon = (symbol: TokenSymbol) => `/crypto/${symbol}.svg`;

export const PAYMENTS: RiskPayment[] = [
  { id: '20260506134012409183726501', type: '直接儲值', symbol: 'USDT', amount: '+ 0.2 USDT', chain: 'TRON', from: 'TMhCk9FQs2…kuBJWKHUof', txid: '01994edef8…486543c16a', time: '06 May. 2026 13:40', reprocess: 'pending' },
  { id: '20260506022733156483113483', type: '直接儲值', symbol: 'USDT', amount: '+ 0.5 USDT', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: '015427dd37…9b15019e8e', time: '06 May. 2026 02:27', reprocess: 'refunded', refundId: '20260506030433403575143482' },
  { id: '20260430094144123152448467', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000007 TRX', chain: 'TRON', from: 'TTXSwp47kJ…HFxDm7FqaV', txid: '96df8752a0…f4ca880601', time: '30 Apr. 2026 09:41', reprocess: 'refunded', refundId: '20260430101844401510079714' },
  { id: '20260430094115284442953523', type: '直接儲值', symbol: 'POL', amount: '+ 1 POL', chain: 'Polygon', from: '0x50e281e7d0…79483c3d31', txid: '0x8659284ed8…a1ff4c8a92', time: '30 Apr. 2026 09:41', reprocess: 'refunded', refundId: '20260430101815401509960028' },
  { id: '20260430071122615808945850', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0xe3c515fffe…9e8eb6bf5f', time: '30 Apr. 2026 07:11', reprocess: 'rejected', refundId: '20260430074822401472239188' },
  { id: '20260430070953450037982634', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0x72d7ec7153…7f35e6d7ec', time: '30 Apr. 2026 07:09', reprocess: 'rejected', refundId: '20260430074653401471866905' },
  { id: '20260430065452468289240412', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0xe5ec876eb4…bee277913e', time: '30 Apr. 2026 06:54', reprocess: 'rejected', refundId: '20260430073152401468085714' },
  { id: '20260430064414482003296755', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x50e281e7d0…79483c3d31', txid: '0xdc5362a116…a8168aac2d', time: '30 Apr. 2026 06:44', reprocess: 'rejected', refundId: '20260430072114401465409622' },
  { id: '20260430061837400388661054', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0x3200eac8d0…0f5443aa71', time: '30 Apr. 2026 06:18', reprocess: 'rejected', refundId: '20260430065537401458963350' },
  { id: '20260430030425664521525697', type: '直接儲值', symbol: 'USDT', amount: '+ 3.8 USDT', chain: 'TRON', from: 'TTXSwp47kJ…HFxDm7FqaV', txid: 'ac8063491e…efb4b1ccf0', time: '30 Apr. 2026 03:04', reprocess: 'rejected', refundId: '20260430034125401410092518' },
  { id: '20260319200418386412093771', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000001 TRX', chain: 'TRON', from: 'TTXSwp47kJ…HFxDm7FqaV', txid: '1e123eb220…7c04e12542', time: '19 Mar. 2026 20:04', reprocess: 'refunded', refundId: '20260319204518679966098506' },
  { id: '20260319200312386411870942', type: '直接儲值', symbol: 'HBAR', amount: '+ 8 HBAR', chain: 'Hedera', from: '0.0.5561028', txid: '01c7f42be5…3a90d51f77', time: '19 Mar. 2026 20:03', reprocess: 'refunded', memo: '883921', refundId: '20260319200312386411871079' },
  { id: '20260319200247386411664530', type: '直接儲值', symbol: 'POL', amount: '+ 13.988156 POL', chain: 'Polygon', from: '0x50e281e7d0…79483c3d31', txid: '0x8b41c7d902…5ea7710b46', time: '19 Mar. 2026 20:02', reprocess: 'refunded', memo: '', refundId: '20260609075859415970427518' },
  { id: '20260319200211386411402277', type: '直接儲值', symbol: 'POL', amount: '+ 4 POL', chain: 'Polygon', from: '0x50e281e7d0…79483c3d31', txid: '0x8b41c7d902…5ea7710b46', time: '19 Mar. 2026 20:02', reprocess: 'refunded', memo: '', refundId: '20260609075859415970427518' },
  { id: '20260319112811250036702951', type: '直接儲值', symbol: 'USDT', amount: '+ 0.5 USDT', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: '216b638dd6…eb262186b2', time: '19 Mar. 2026 11:28', reprocess: 'refunded', refundId: '20260319120511386316580790' },
  { id: '20260318190845385833104618', type: '直接儲值', symbol: 'HBAR', amount: '+ 1.2 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '02b6ad9137…5e1c7042ab', time: '18 Mar. 2026 19:08', reprocess: 'rejected', memo: '', refundId: '20260318190845385833104755' },
  { id: '20260318185127385826740155', type: '直接儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0x7bccdb3c…05395d7813', time: '18 Mar. 2026 18:51', reprocess: 'failed', memo: '', refundId: '20260318185127385826740292' },
  { id: '20260318183212122005761331', type: '直接儲值', symbol: 'USDT', amount: '+ 0.2 USDT', chain: 'TRON', from: 'TTXSwp47kJ…HFxDm7FqaV', txid: 'f8996c43ec…6f98da7cdc', time: '18 Mar. 2026 18:32', reprocess: 'refunded', refundId: '20260318190912385833410287' },
  { id: '20260318181504755476010902', type: '直接儲值', symbol: 'HBAR', amount: '+ 3.5 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '82016dd931…1c037e409f', time: '18 Mar. 2026 18:15', reprocess: 'failed', memo: '010902', refundId: '20260318185204385827118463' },
  { id: '20260306114218374920553108', type: '直接儲值', symbol: 'HBAR', amount: '+ 12 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '00993af1c2…7b5e04a1d9', time: '06 Mar. 2026 11:42', reprocess: 'pending', memo: '5501723' },
  { id: '20260306110610810083728455', type: '直接儲值', symbol: 'USDT', amount: '+ 1.5 USDT', chain: 'TRON', from: 'TMhCk9FQs2…kuBJWKHUof', txid: 'e89c2a3e73…c7136b86ba', time: '06 Mar. 2026 11:06', reprocess: 'refunded', refundId: '20260306114310374921065509' },
  { id: '20260227093054370118864205', type: '用戶儲值', symbol: 'HBAR', amount: '+ 3.5 HBAR', chain: 'Hedera', from: '0.0.3915672', txid: '0119cf83be…5c7a2e6041', time: '27 Feb. 2026 09:30', reprocess: 'failed', memo: '660412', refundId: '20260227093054370118864342' },
  { id: '20260201143938369685607021', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000001 TRX', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: 'fa0f1d07e9…aaae3e4756', time: '01 Feb. 2026 22:39', reprocess: 'refunded', refundId: '20260201152038427032785429' },
  { id: '20260131151012369330908455', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000001 TRX', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: 'e5feaeff70…1e21742cb1', time: '31 Jan. 2026 23:10', reprocess: 'rejected', memo: '', refundId: '20260201093042369330908455' },
  { id: '20260130153910368975814522', type: '直接儲值', symbol: 'TRX', amount: '+ 0.000002 TRX', chain: 'TRON', from: 'TY8z8xvCRF…m3Xydy2Uof', txid: '3d5ea73bc3…0aaad796d1', time: '30 Jan. 2026 23:39', reprocess: 'rejected', memo: '', refundId: '20260201093042369330908455' },
  { id: '20260130102131368895873108', type: '直接儲值', symbol: 'HBAR', amount: '+ 2.5 HBAR', chain: 'Hedera', from: '0.0.5561028', txid: '01c7f42be5…3a90d51f77', time: '30 Jan. 2026 18:21', reprocess: 'refunded', memo: '883921', refundId: '20260319200312386411871079' },
  { id: '20260109034139361185099574', type: '直接儲值', symbol: 'USDT', amount: '+ 1.2 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0x2ad51f7c…b83e60d194', time: '09 Jan. 2026 11:41', reprocess: 'failed', memo: '', refundId: '20260318185127385826740292' },
  { id: '20260109034135361185083092', type: '儲值', symbol: 'USDT', amount: '+ 2 USDT', chain: 'TRON', from: 'TMhCk9FQs2…kuBJWKHUof', txid: 'c909bb92a3…63e6e0bc33', time: '09 Jan. 2026 11:41', reprocess: 'refunded', refundId: '20260319120540386316700142' },
  { id: '20251231033626357922293407', type: '用戶儲值', symbol: 'HBAR', amount: '+ 0.8 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '04a7c1de56…8f0b3e7712', time: '31 Dec. 2025 11:36', reprocess: 'rejected', memo: '', refundId: '20260318190845385833104755' },
  { id: '20251230114508357610224918', type: '用戶儲值', symbol: 'HBAR', amount: '+ 1.6 HBAR', chain: 'Hedera', from: '0.0.3915672', txid: '05e2fb8a30…71d4c6098e', time: '30 Dec. 2025 19:45', reprocess: 'failed', memo: '660412', refundId: '20260227093054370118864342' },
  { id: '20251228090217356804119730', type: '直接儲值', symbol: 'HBAR', amount: '+ 6 HBAR', chain: 'Hedera', from: '0.0.4728193', txid: '00993af1c2…7b5e04a1d9', time: '28 Dec. 2025 17:02', reprocess: 'pending', memo: '5501723' },
  { id: '20251221172443354386610255', type: '直接儲值', symbol: 'HBAR', amount: '+ 4.4 HBAR', chain: 'Hedera', from: '0.0.5561028', txid: '03d1be7042…9c4f21ab80', time: '22 Dec. 2025 01:24', reprocess: 'refunded', memo: '771205', refundId: '20251221180543954281156513' },
  { id: '20251219102214353602881744', type: '儲值', symbol: 'USDT', amount: '+ 0.5 USDT', chain: 'Polygon', from: '0x4766dc52…9db104e37e', txid: '0xa5d7192f…41c9bb0e63', time: '19 Dec. 2025 18:22', reprocess: 'pending' },
];

export const WITHDRAWALS: RiskWithdrawal[] = [
  { id: '20260609075859415970427518', symbol: 'POL', amount: '- 17.988156 POL', chain: 'Polygon', fee: '0.00665804 USDT', to: '0x50e281e7d07707fb1d7bfa…', txid: '0x8b41c7d902…5ea7710b46', time: '09 Jun. 2026 15:59', status: 'success', memo: '' },
  { id: '20260506030433403575143482', symbol: 'USDT', amount: '- 0.5 USDT', chain: 'TRON', fee: '34.343 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '3b02fd16cc…e4d5002dbf', time: '06 May. 2026 11:11', status: 'success' },
  { id: '20260430101844401510079714', symbol: 'TRX', amount: '- 0.000007 TRX', chain: 'TRON', fee: '8.15575 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: 'dc4300c749…580ea3d552', time: '06 May. 2026 11:11', status: 'success' },
  { id: '20260430101815401509960028', symbol: 'POL', amount: '- 1 POL', chain: 'Polygon', fee: '0.00665733 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '0x849d8c94…37f114781c', time: '30 Apr. 2026 18:21', status: 'success' },
  { id: '20260430074822401472239188', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.0244 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430074653401471866905', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.0244 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430073152401468085714', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.02402 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430072114401465409622', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.02402 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430065537401458963350', symbol: 'USDT', amount: '- 2 USDT', chain: 'Polygon', fee: '0.02416 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '', time: '--', status: 'rejected' },
  { id: '20260430034125401410092518', symbol: 'USDT', amount: '- 3.8 USDT', chain: 'TRON', fee: '61.56 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '', time: '--', status: 'rejected' },
  { id: '20260319204518679966098506', symbol: 'TRX', amount: '- 0.000001 TRX', chain: 'TRON', fee: '25.641 USDT', to: 'TTXSwp47kJ…HFxDm7FqaV', txid: '5676c480a8…c260a61834', time: '19 Mar. 2026 20:45', status: 'success' },
  { id: '20260319200312386411871079', symbol: 'HBAR', amount: '- 10.5 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.5561028', txid: '01c7f42be5…3a90d51f77', time: '19 Mar. 2026 20:04', status: 'success', memo: '883921' },
  { id: '20260319120540386316700142', symbol: 'USDT', amount: '- 2 USDT', chain: 'TRON', fee: '30.288 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '979b923aaf…a4c8ec3ffe', time: '19 Mar. 2026 20:05', status: 'success' },
  { id: '20260319120511386316580790', symbol: 'USDT', amount: '- 0.5 USDT', chain: 'TRON', fee: '30.288 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: 'b946ee5cbc…d5da51f005', time: '19 Mar. 2026 20:05', status: 'success' },
  { id: '20260318190912385833410287', symbol: 'USDT', amount: '- 0.2 USDT', chain: 'TRON', fee: '28.104 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: '5f1c07ab63…9e2d448a10', time: '18 Mar. 2026 19:09', status: 'success' },
  { id: '20260318190845385833104755', symbol: 'HBAR', amount: '- 2 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.4728193', txid: '02b6ad9137…5e1c7042ab', time: '--', status: 'rejected', memo: '' },
  { id: '20260318185204385827118463', symbol: 'HBAR', amount: '- 3.5 HBAR', chain: 'Hedera', fee: '0.03042 USDT', to: '0.0.3915672', txid: '', time: '18 Mar. 2026 18:52', status: 'failed', memo: '010902' },
  { id: '20260318185127385826740292', symbol: 'USDT', amount: '- 3.2 USDT', chain: 'Polygon', fee: '0.03042 USDT', to: '0x4766dc5207f5172c05da8d…', txid: '0x7bccdb3c…05395d7813', time: '18 Mar. 2026 18:52', status: 'failed', memo: '' },
  { id: '20260306114310374921065509', symbol: 'USDT', amount: '- 1.5 USDT', chain: 'TRON', fee: '25.641 USDT', to: 'TMhCk9FQs2P7mDGRZ1PhZns8…', txid: 'ab30f6c142…7d1e0c4b95', time: '06 Mar. 2026 11:43', status: 'success' },
  { id: '20260227093054370118864342', symbol: 'HBAR', amount: '- 5.1 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.3915672', txid: '0119cf83be…5c7a2e6041', time: '27 Feb. 2026 09:31', status: 'failed', memo: '660412' },
  { id: '20260201152038427032785429', symbol: 'TRX', amount: '- 0.000001 TRX', chain: 'TRON', fee: '25.641 USDT', to: 'TY8z8xvCRF…m3Xydy2Uof', txid: 'd760b9b96b…2d43ef6f60', time: '01 Feb. 2026 15:20', status: 'success' },
  { id: '20260201093042369330908455', symbol: 'TRX', amount: '- 0.000003 TRX', chain: 'TRON', fee: '25.641 USDT', to: 'TY8z8xvCRFxT8jYm3Xydy2U…', txid: 'e5feaeff70…1e21742cb1', time: '--', status: 'rejected', memo: '' },
  { id: '20251221180543954281156513', symbol: 'HBAR', amount: '- 4.4 HBAR', chain: 'Hedera', fee: '0.00042 USDT', to: '0.0.5561028', txid: '3dfb3316d4…57d06f8262', time: '21 Dec. 2025 18:05', status: 'success', memo: '771205' },
];
