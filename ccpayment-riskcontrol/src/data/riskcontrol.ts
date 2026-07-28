// 风控交易管理 — 领域数据、类型与 MistTrack AML 结果构造。
// 数据与判定逻辑严格对齐原型 (风控交易管理.dc.html)，不新增未实现的功能字段。

export type NetworkKey = 'POLYGON' | 'TRX' | 'BSC';
export type LevelKey = 'low' | 'moderate' | 'high' | 'severe';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';
export type DepositStatus = 'withdrawing' | 'unhandled' | 'withdrawn' | 'rejected';
export type NotifyResult = 'Success' | 'Pending';

export interface DepositRow {
  time: string;
  displayId: string;
  network: NetworkKey;
  amount: string;
  value: string;
  from: string;
  to: string;
  txid: string;
  recordId: string;
  score: number;
  status: DepositStatus;
}

// 风险提现：表结构与风险充值相同，但没有「状态」与「操作」列
export interface WithdrawRow {
  time: string;
  displayId: string;
  network: NetworkKey;
  amount: string;
  value: string;
  from: string;
  to: string;
  txid: string;
  recordId: string;
  score: number;
}

export interface AddressRow {
  merchantId: string;
  riskAt: string;
  network: NetworkKey;
  address: string;
  score: number;
  notify: NotifyResult;
  after: string;
}

// 抽屉详情打开时携带的最小上下文
export interface DrawerMeta {
  kind: 'deposit' | 'withdraw' | 'address';
  displayId?: string;
  txid?: string;
  recordId?: string;
  merchantId?: string;
  riskAt?: string;
}
export interface DrawerTarget {
  target: string;
  network: NetworkKey;
  score: number;
  meta: DrawerMeta;
}

export type RiskType =
  | 'sanctioned_entity'
  | 'illicit_activity'
  | 'mixer'
  | 'gambling'
  | 'risk_exchange'
  | 'bridge';

export interface RiskDetailEntry {
  entity: string;
  risk_type: RiskType;
  exposure_type: 'direct' | 'indirect';
  hop_num: number;
  volume: number;
  percent: number;
  hop_dic: Record<string, string[]>;
}

export interface AmlResult {
  score: number;
  risk_level: RiskLevel;
  hacking_event: string;
  address_label: string;
  detail_list: string[];
  risk_detail: RiskDetailEntry[];
  risk_report_url: string;
}

// ---------- fixtures (原型 DEPOSIT / ADDRESS) ----------

export const DEPOSIT: DepositRow[] = [
  { time: '18 hours ago', displayId: 'CP28912', network: 'TRX', amount: '0.2 USDT', value: '$0.20', from: 'TMhCk9…WKHUof', to: 'TTTrPu…9Yn1Wa', txid: '3d0348…b437be', recordId: '202607…737600', score: 8, status: 'withdrawing' },
  { time: '03 Jul 2026 11:52', displayId: 'CP25597', network: 'POLYGON', amount: '0.1234 USDT', value: '$0.12', from: '0x4766…04e37e', to: '0x5156…bfc218', txid: '0x59ca…bc2099', recordId: '202607…655168', score: 15, status: 'unhandled' },
  { time: '03 Jul 2026 11:39', displayId: 'CP25597', network: 'POLYGON', amount: '0.4 USDT', value: '$0.40', from: '0x4766…04e37e', to: '0x5156…bfc218', txid: '0x428b…0fc4fb', recordId: '202607…591552', score: 42, status: 'unhandled' },
  { time: '03 Jul 2026 11:34', displayId: 'CP25597', network: 'POLYGON', amount: '0.3 USDT', value: '$0.30', from: '0x4766…04e37e', to: '0x5156…bfc218', txid: '0x4486…764580', recordId: '202607…544320', score: 27, status: 'unhandled' },
  { time: '03 Jul 2026 11:26', displayId: 'CP25597', network: 'POLYGON', amount: '0.222 USDT', value: '$0.22', from: '0x4766…04e37e', to: '0xe06f…72605f', txid: '0x4b1a…26e4a2', recordId: '202607…536832', score: 55, status: 'unhandled' },
  { time: '03 Jul 2026 11:25', displayId: 'CP25597', network: 'POLYGON', amount: '0.166 USDT', value: '$0.16', from: '0x4766…04e37e', to: '0xe06f…72605f', txid: '0x536b…7d3f7e', recordId: '202607…111232', score: 12, status: 'unhandled' },
  { time: '03 Jul 2026 10:50', displayId: 'CP25597', network: 'POLYGON', amount: '0.155 USDT', value: '$0.15', from: '0x4766…04e37e', to: '0xe06f…72605f', txid: '0x7abc…b7dd16', recordId: '202607…567680', score: 68, status: 'unhandled' },
  { time: '03 Jul 2026 10:42', displayId: 'CP25597', network: 'POLYGON', amount: '0.17 USDT', value: '$0.17', from: '0x4766…04e37e', to: '0xe06f…72605f', txid: '0x6f1e…c7c410', recordId: '202607…989696', score: 33, status: 'unhandled' },
  { time: '15 Jun 2026 18:30', displayId: 'CP27849', network: 'POLYGON', amount: '0.5 USDT', value: '$0.50', from: '0x4766…04e37e', to: '0xe778…1b88a9', txid: '0x12ab…de6c77', recordId: '202606…614016', score: 76, status: 'unhandled' },
  { time: '09 Jun 2026 15:59', displayId: 'CP27849', network: 'POLYGON', amount: '13.…988156 POL', value: '$1.06', from: '0x1f38…a3c03a', to: '0x50e2…3c3d31', txid: '0x46f4…6b7eba', recordId: '202606…031168', score: 22, status: 'unhandled' },
  { time: '29 May 2026 10:56', displayId: 'CP19444', network: 'POLYGON', amount: '0.…495451 USDT', value: '$0.49', from: '0xbf5e…61c87b', to: '0x3665…674501', txid: '0xee35…8230f0', recordId: '202605…673216', score: 5, status: 'unhandled' },
  { time: '06 May 2026 13:39', displayId: 'CP27849', network: 'TRX', amount: '0.2 USDT', value: '$0.20', from: 'TMhCk9…WKHUof', to: 'TUQ7qQ…gJDqav', txid: '01994e…43c16a', recordId: '202605…372416', score: 88, status: 'unhandled' },
  { time: '27 Apr 2026 11:38', displayId: 'CP22948', network: 'POLYGON', amount: '0.00011 USDT', value: '$0.00', from: '0x26fb…6662d7', to: '0x64d1…68564b', txid: '0x5fad…188a27', recordId: '202604…527680', score: 95, status: 'withdrawn' },
  { time: '21 Apr 2026 13:59', displayId: 'CP22948', network: 'POLYGON', amount: '2 USDT', value: '$2.00', from: '0x4766…04e37e', to: '0x8099…e00ca3', txid: '0xb4b4…8f6b1e', recordId: '202604…230656', score: 61, status: 'rejected' },
  { time: '21 Apr 2026 13:54', displayId: 'CP22948', network: 'POLYGON', amount: '1.1 USDT', value: '$1.10', from: '0x4766…04e37e', to: '0x64d1…68564b', txid: '0xac75…af8dcf', recordId: '202604…091840', score: 92, status: 'withdrawn' },
  { time: '21 Apr 2026 13:54', displayId: 'CP22948', network: 'POLYGON', amount: '1.1 USDT', value: '$1.10', from: '0x4766…04e37e', to: '0x64d1…68564b', txid: '0xb133…83c16d', recordId: '202604…583552', score: 18, status: 'rejected' },
  { time: '21 Apr 2026 13:54', displayId: 'CP22948', network: 'POLYGON', amount: '1 USDT', value: '$1.00', from: '0x4766…04e37e', to: '0xd7c5…9bd973', txid: '0x3dd8…bd401c', recordId: '202604…105280', score: 47, status: 'unhandled' },
  { time: '21 Apr 2026 13:54', displayId: 'CP22948', network: 'POLYGON', amount: '1 USDT', value: '$1.00', from: '0x4766…04e37e', to: '0xd7c5…9bd973', txid: '0xf673…5172bf', recordId: '202604…546816', score: 9, status: 'unhandled' },
  { time: '21 Apr 2026 13:53', displayId: 'CP22948', network: 'POLYGON', amount: '2 USDT', value: '$2.00', from: '0x4766…04e37e', to: '0x2883…83c501', txid: '0x3f0a…a960f2', recordId: '202604…969088', score: 74, status: 'unhandled' },
  { time: '20 Apr 2026 18:22', displayId: 'CP22948', network: 'POLYGON', amount: '40 USDT', value: '$40.00', from: '0x4766…04e37e', to: '0x687f…a6287f', txid: '0x1077…d05a66', recordId: '202604…841152', score: 84, status: 'withdrawn' },
  { time: '20 Apr 2026 18:20', displayId: 'CP22948', network: 'POLYGON', amount: '30 USDT', value: '$30.00', from: '0x4766…04e37e', to: '0x687f…a6287f', txid: '0x841b…2ba0a0', recordId: '202604…323776', score: 97, status: 'withdrawn' },
  { time: '20 Apr 2026 18:18', displayId: 'CP22948', network: 'POLYGON', amount: '2 USDT', value: '$2.00', from: '0x4766…04e37e', to: '0x687f…a6287f', txid: '0x3096…015eca', recordId: '202604…133504', score: 30, status: 'withdrawn' },
  { time: '20 Apr 2026 18:15', displayId: 'CP22948', network: 'POLYGON', amount: '2 USDT', value: '$2.00', from: '0x4766…04e37e', to: '0x2883…83c501', txid: '0xa941…040aba', recordId: '202604…703424', score: 51, status: 'withdrawn' },
];

// 风险提现记录。from 取自「风险地址」列表中的地址，使「查询提现交易」能筛出结果。
export const WITHDRAW: WithdrawRow[] = [
  { time: '6 hours ago', displayId: 'CP28912', network: 'POLYGON', amount: '120 USDT', value: '$120.00', from: '0x5156…bfc218', to: '0x91ac…5f20b1', txid: '0x7c41…9ad3e0', recordId: '202607…812004', score: 8 },
  { time: '04 Jul 2026 09:18', displayId: 'CP25597', network: 'POLYGON', amount: '58.5 USDT', value: '$58.50', from: '0xe06f…72605f', to: '0x3a77…c1d904', txid: '0x1de8…44b7cc', recordId: '202607…790112', score: 16 },
  { time: '03 Jul 2026 20:41', displayId: 'CP25597', network: 'POLYGON', amount: '310 USDT', value: '$310.00', from: '0x6A1E…43AC08', to: '0xbb02…7e9f13', txid: '0x9fa2…30c6b8', recordId: '202607…748330', score: 45 },
  { time: '03 Jul 2026 15:02', displayId: 'CP27849', network: 'TRX', amount: '25 USDT', value: '$25.00', from: 'TKfVrJ…4dWBVK', to: 'TQmXe4…8ftLpR', txid: '4b7a02…e91d55', recordId: '202607…703918', score: 3 },
  { time: '02 Jul 2026 18:37', displayId: 'CP27849', network: 'TRX', amount: '1,480 USDT', value: '$1,480.00', from: 'TKeKSn…ti3H2v', to: 'TZr9Kc…2mQvXy', txid: '8c1f66…7ba204', recordId: '202607…661472', score: 72 },
  { time: '01 Jul 2026 11:55', displayId: 'CP22948', network: 'BSC', amount: '76.2 USDT', value: '$76.20', from: '0x4387…e89ca0', to: '0x5d18…a04c72', txid: '0x2ba9…6f18d3', recordId: '202607…620855', score: 34 },
  { time: '29 Jun 2026 16:24', displayId: 'CP22948', network: 'POLYGON', amount: '640 USDT', value: '$640.00', from: '0x041A…F9E4eD', to: '0xc740…19be55', txid: '0x63cd…b2a771', recordId: '202606…588140', score: 58 },
  { time: '28 Jun 2026 14:09', displayId: 'CP19444', network: 'TRX', amount: '9,250 USDT', value: '$9,250.00', from: 'TFiC96…yTwSnt', to: 'TBn7Wq…4kLdHs', txid: '0a55d3…c07e69', recordId: '202606…541093', score: 91 },
  { time: '27 Jun 2026 10:31', displayId: 'CP19444', network: 'BSC', amount: '43 USDT', value: '$43.00', from: '0x876D…1E5f1F', to: '0xf210…8d6a34', txid: '0x8e07…1c4b90', recordId: '202606…509866', score: 12 },
  { time: '25 Jun 2026 19:47', displayId: 'CP16271', network: 'POLYGON', amount: '17.8 USDT', value: '$17.80', from: '0x382c…6fe812', to: '0x6b95…f3e207', txid: '0x4a31…d7f562', recordId: '202606…470215', score: 5 },
  { time: '24 Jun 2026 13:12', displayId: 'CP16271', network: 'POLYGON', amount: '2,300 USDT', value: '$2,300.00', from: '0x3Ef9…42d26F', to: '0xa118…52cd88', txid: '0xd902…8b3e41', recordId: '202606…432708', score: 83 },
  { time: '22 Jun 2026 08:56', displayId: 'CP16653', network: 'POLYGON', amount: '155 USDT', value: '$155.00', from: '0x5658…6e2D1d', to: '0x77e3…9014ba', txid: '0x5c68…a2f037', recordId: '202606…399514', score: 39 },
  { time: '20 Jun 2026 17:03', displayId: 'CP16498', network: 'POLYGON', amount: '88.4 USDT', value: '$88.40', from: '0xcEa7…00d7fd', to: '0x2f40…6ba1c9', txid: '0xb7de…40915a', recordId: '202606…361280', score: 19 },
  { time: '18 Jun 2026 12:40', displayId: 'CP15747', network: 'POLYGON', amount: '12,600 USDT', value: '$12,600.00', from: '0xdcAf…fAd93e', to: '0x9c05…3e7742', txid: '0x0fa6…c85b13', recordId: '202606…318447', score: 97 },
  { time: '16 Jun 2026 15:29', displayId: 'CP16437', network: 'POLYGON', amount: '870 USDT', value: '$870.00', from: '0xa842…9334b1', to: '0x48b1…d20f66', txid: '0x36e4…97ca20', recordId: '202606…276903', score: 78 },
  { time: '14 Jun 2026 09:14', displayId: 'CP16437', network: 'POLYGON', amount: '3,120 USDT', value: '$3,120.00', from: '0x105a…8abf2a', to: '0xe57c…b8104d', txid: '0x71bf…2d6e58', recordId: '202606…233619', score: 88 },
  { time: '12 Jun 2026 21:08', displayId: 'CP15285', network: 'BSC', amount: '64 USDT', value: '$64.00', from: '0x2b39…cA71D2', to: '0x83da…7f2159', txid: '0xc419…5a0d76', recordId: '202606…198530', score: 25 },
  { time: '10 Jun 2026 11:52', displayId: 'CP28912', network: 'POLYGON', amount: '405 USDT', value: '$405.00', from: '0x5156…bfc218', to: '0xd66f…04a833', txid: '0x28ea…f71b45', recordId: '202606…150724', score: 62 },
  { time: '08 Jun 2026 16:35', displayId: 'CP25597', network: 'POLYGON', amount: '7,940 USDT', value: '$7,940.00', from: '0xe06f…72605f', to: '0x1b83…6c9e02', txid: '0xa5d0…3f8271', recordId: '202606…112966', score: 95 },
  { time: '06 Jun 2026 10:07', displayId: 'CP19444', network: 'TRX', amount: '212 USDT', value: '$212.00', from: 'TFiC96…yTwSnt', to: 'TWs3Nb…6vHgKt', txid: 'd31c07…6e2a84', recordId: '202606…071338', score: 41 },
];

export const ADDRESS: AddressRow[] = [
  { merchantId: '25597', riskAt: '03 Jul 2026 11:52', network: 'POLYGON', address: '0x5156…bfc218', score: 8, notify: 'Success', after: '--' },
  { merchantId: '25597', riskAt: '03 Jul 2026 11:25', network: 'POLYGON', address: '0xe06f…72605f', score: 16, notify: 'Success', after: '1' },
  { merchantId: '16271', riskAt: '20 Oct 2025 16:59', network: 'POLYGON', address: '0x6A1E…43AC08', score: 45, notify: 'Pending', after: '--' },
  { merchantId: '16271', riskAt: '15 Oct 2025 14:21', network: 'TRX', address: 'TKfVrJ…4dWBVK', score: 3, notify: 'Pending', after: '1' },
  { merchantId: '16271', riskAt: '15 Oct 2025 13:50', network: 'TRX', address: 'TKeKSn…ti3H2v', score: 72, notify: 'Pending', after: '--' },
  { merchantId: '16271', riskAt: '24 Sep 2025 11:45', network: 'BSC', address: '0x4387…e89ca0', score: 34, notify: 'Pending', after: '3' },
  { merchantId: '16271', riskAt: '23 Sep 2025 17:14', network: 'POLYGON', address: '0x041A…F9E4eD', score: 58, notify: 'Pending', after: '4' },
  { merchantId: '16271', riskAt: '22 Sep 2025 17:03', network: 'TRX', address: 'TFiC96…yTwSnt', score: 91, notify: 'Pending', after: '7' },
  { merchantId: '16271', riskAt: '22 Sep 2025 15:36', network: 'BSC', address: '0x876D…1E5f1F', score: 12, notify: 'Pending', after: '--' },
  { merchantId: '16271', riskAt: '22 Sep 2025 15:36', network: 'BSC', address: '0x041A…F9E4eD', score: 27, notify: 'Pending', after: '--' },
  { merchantId: '16271', riskAt: '22 Sep 2025 11:24', network: 'POLYGON', address: '0x4387…e89ca0', score: 66, notify: 'Pending', after: '--' },
  { merchantId: '16271', riskAt: '22 Sep 2025 11:20', network: 'POLYGON', address: '0x382c…6fe812', score: 5, notify: 'Pending', after: '2' },
  { merchantId: '16271', riskAt: '22 Sep 2025 11:13', network: 'POLYGON', address: '0x3Ef9…42d26F', score: 83, notify: 'Pending', after: '17' },
  { merchantId: '16653', riskAt: '16 Sep 2025 15:55', network: 'POLYGON', address: '0x5658…6e2D1d', score: 39, notify: 'Pending', after: '1' },
  { merchantId: '16498', riskAt: '12 Aug 2025 18:26', network: 'POLYGON', address: '0xcEa7…00d7fd', score: 19, notify: 'Pending', after: '--' },
  { merchantId: '16955', riskAt: '12 Mar 2025 17:42', network: 'POLYGON', address: '0xcA3e…DfBE39', score: 3, notify: 'Success', after: '--' },
  { merchantId: '17053', riskAt: '12 Mar 2025 16:19', network: 'POLYGON', address: '0x3C53…F94cF5', score: 34, notify: 'Success', after: '--' },
  { merchantId: '15747', riskAt: '12 Mar 2025 11:18', network: 'POLYGON', address: '0xdcAf…fAd93e', score: 97, notify: 'Success', after: '--' },
  { merchantId: '15747', riskAt: '12 Mar 2025 11:13', network: 'POLYGON', address: '0xB28b…B547Fa', score: 52, notify: 'Success', after: '--' },
  { merchantId: '17023', riskAt: '07 Jan 2025 14:11', network: 'POLYGON', address: '0xEe7e…e42127', score: 34, notify: 'Success', after: '--' },
  { merchantId: '16437', riskAt: '07 Jan 2025 13:53', network: 'POLYGON', address: '0xa842…9334b1', score: 78, notify: 'Success', after: '1' },
  { merchantId: '16437', riskAt: '07 Jan 2025 11:34', network: 'POLYGON', address: '0xF343…CA4881', score: 44, notify: 'Success', after: '--' },
  { merchantId: '16437', riskAt: '06 Jan 2025 16:47', network: 'POLYGON', address: '0x105a…8abf2a', score: 88, notify: 'Success', after: '2' },
  { merchantId: '16437', riskAt: '06 Jan 2025 14:14', network: 'POLYGON', address: '0xDaC0…c33794', score: 3, notify: 'Success', after: '--' },
  { merchantId: '16437', riskAt: '06 Jan 2025 14:02', network: 'POLYGON', address: '0xFC58…267BaA', score: 62, notify: 'Success', after: '--' },
  { merchantId: '15285', riskAt: '01 Jan 2025 14:50', network: 'BSC', address: '0x2b39…cA71D2', score: 25, notify: 'Pending', after: '--' },
];

// 地址下拉筛选项：风险充值按 To Address 筛、风险提现按 From Address 筛
export const DEPOSIT_TO_ADDRESSES: string[] = Array.from(new Set(DEPOSIT.map((r) => r.to)));
export const WITHDRAW_FROM_ADDRESSES: string[] = Array.from(new Set(WITHDRAW.map((r) => r.from)));

// ---------- coin / level / status / risk-type meta ----------

export interface CoinMeta {
  coin: string;
  symbol: string;
  color: string;
  networkLabel: string;
}
const COIN_META: Record<NetworkKey, CoinMeta> = {
  POLYGON: { coin: 'USDT-POLYGON', symbol: 'USDT', color: '#26A17B', networkLabel: 'Polygon (PoS)' },
  TRX: { coin: 'USDT-TRC20', symbol: 'USDT', color: '#26A17B', networkLabel: 'Tron (TRC20)' },
  BSC: { coin: 'USDT-BSC', symbol: 'USDT', color: '#26A17B', networkLabel: 'BNB Smart Chain (BEP20)' },
};
export function coinMeta(network: NetworkKey): CoinMeta {
  return COIN_META[network] ?? COIN_META.POLYGON;
}

export interface LevelMeta {
  key: LevelKey;
  label: string;
  range: string;
  color: string;
  bg: string;
  gauge: string;
  sugg: string;
}
// 风险等级色阶为领域语义色，取值对齐原型 levelMeta（DS 风险色 ramp）。
const LEVEL_META: Record<RiskLevel, LevelMeta> = {
  Low: { key: 'low', label: '低风险', range: '评分 0 – 30', color: '#218861', bg: '#DBFBDB', gauge: '#43BE76', sugg: '该地址自身风险较低，但存在与高风险标签地址的间接资金往来，建议保持常规监控。' },
  Moderate: { key: 'moderate', label: '中风险', range: '评分 31 – 70', color: '#AC7C1F', bg: '#FEF7D8', gauge: '#E7B22B', sugg: '需进行中等程度的监管，建议结合 MistTrack AML 平台复核后再放行。' },
  High: { key: 'high', label: '高风险', range: '评分 71 – 90', color: '#B23A12', bg: '#FEE9D8', gauge: '#EC684C', sugg: '保持高度监控，并通过 MistTrack AML 平台或 OpenAPI 进行交易分析。' },
  Severe: { key: 'severe', label: '严重风险', range: '评分 91 – 100', color: '#7A1212', bg: '#FBDADA', gauge: '#A92926', sugg: '禁止提现与交易，并立即上报该地址。' },
};

export function levelOfScore(score: number): RiskLevel {
  return score >= 91 ? 'Severe' : score >= 71 ? 'High' : score >= 31 ? 'Moderate' : 'Low';
}
export function levelMeta(level: RiskLevel): LevelMeta {
  return LEVEL_META[level];
}
export function levelForScore(score: number): LevelMeta {
  return LEVEL_META[levelOfScore(score)];
}

export interface StatusMeta {
  label: string;
  color: string;
}
const STATUS_META: Record<DepositStatus, StatusMeta> = {
  withdrawing: { label: '提现中', color: 'warning.dark' },
  unhandled: { label: '未处理', color: 'grey.500' },
  withdrawn: { label: '已提现', color: 'primary.main' },
  rejected: { label: '审核拒绝', color: 'error.main' },
};
export function statusMeta(status: DepositStatus): StatusMeta {
  return STATUS_META[status] ?? STATUS_META.unhandled;
}

export interface RiskTypeMeta {
  label: string;
  color: string;
  bg: string;
}
const RISK_TYPE_META: Record<RiskType, RiskTypeMeta> = {
  sanctioned_entity: { label: '受制裁实体', color: '#A92926', bg: '#FBDADA' },
  illicit_activity: { label: '非法活动', color: '#B23A12', bg: '#FEE9D8' },
  mixer: { label: '混币器', color: '#6D4ACB', bg: '#EDE7FB' },
  gambling: { label: '博彩', color: '#AC7C1F', bg: '#FEF7D8' },
  risk_exchange: { label: '高风险交易所', color: '#2B7A99', bg: '#E3F7FD' },
  bridge: { label: '跨链桥', color: '#656872', bg: '#E8ECF2' },
};
export function riskTypeMeta(t: RiskType): RiskTypeMeta {
  return RISK_TYPE_META[t] ?? RISK_TYPE_META.bridge;
}

// ---------- deterministic string helpers (对齐原型 hash/expand) ----------

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function looksAddr(a: string): boolean {
  return /^(0x)?[A-Za-z0-9]{20,}$/.test(a) && !/\s/.test(a);
}

export function trunc(a: string): string {
  if (!a) return '';
  return a.length > 20 ? a.slice(0, 8) + '…' + a.slice(-6) : a;
}

export function fmtUSD(n: number): string {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fakeAddr(seed: string, n: number): string {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789';
  let h = hash(seed + '_' + n);
  let s = 'T';
  for (let i = 0; i < 33; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    s += ch[h % ch.length];
  }
  return s;
}

function expandGeneric(disp: string, alphabet: string, totalLen: number): string {
  const parts = disp.split('…');
  if (parts.length < 2) return disp;
  const pre = parts[0];
  const suf = parts[1];
  const need = Math.max(0, totalLen - pre.length - suf.length);
  let h = hash(disp);
  let mid = '';
  for (let i = 0; i < need; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    mid += alphabet[h % alphabet.length];
  }
  return pre + mid + suf;
}

// 将截断展示地址展开为可复制的完整地址（占位，与原型一致）
export function expandAddress(disp: string): string {
  const isHex = disp.startsWith('0x');
  const total = isHex ? 42 : 34;
  const alpha = isHex ? '0123456789abcdef' : '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  return expandGeneric(disp, alpha, total);
}
export function expandTxid(disp: string): string {
  const isHex = disp.startsWith('0x');
  return expandGeneric(disp, '0123456789abcdef', isHex ? 66 : 64);
}
export function expandRecordId(disp: string): string {
  return expandGeneric(disp, '0123456789', 20);
}

// ---------- MistTrack AML 结果构造（对齐原型 buildResult） ----------

export function buildResult(score: number, target: string): AmlResult {
  const level = levelOfScore(score);
  const url = 'https://light.misttrack.io/riskReport/' + target + '?token=43fb70ee-76a2-40b6-95a8-d67205d96f0e';

  if (level === 'Low') {
    return {
      score,
      risk_level: 'Low',
      hacking_event: '',
      address_label: 'Unhosted Wallet',
      detail_list: ['Interact With High-risk Tag Address'],
      risk_detail: [
        { entity: 'huionepay', risk_type: 'sanctioned_entity', exposure_type: 'indirect', hop_num: 3, volume: 42.18, percent: 1.2, hop_dic: { '1': ['huionepay'], '2': [fakeAddr(target, 1)], '3': [fakeAddr(target, 2)], '4': [target] } },
      ],
      risk_report_url: url,
    };
  }
  if (level === 'Moderate') {
    return {
      score,
      risk_level: 'Moderate',
      hacking_event: '',
      address_label: 'Unhosted Wallet, Suspected Money Laundering',
      detail_list: ['Malicious Address', 'Interact With High-risk Tag Address'],
      risk_detail: [
        { entity: 'huionepay', risk_type: 'sanctioned_entity', exposure_type: 'indirect', hop_num: 2, volume: 1820.66, percent: 18.3, hop_dic: { '1': ['huionepay'], '2': [fakeAddr(target, 2)], '3': [target] } },
        { entity: 'FixedFloat', risk_type: 'risk_exchange', exposure_type: 'indirect', hop_num: 3, volume: 640.12, percent: 6.1, hop_dic: { '1': ['FixedFloat'], '2': [fakeAddr(target, 3)], '3': [fakeAddr(target, 4)], '4': [target] } },
      ],
      risk_report_url: url,
    };
  }
  if (level === 'High') {
    return {
      score,
      risk_level: 'High',
      hacking_event: '',
      address_label: 'Suspected Money Laundering, Blacklisted Address, USDT Banned',
      detail_list: ['Involved Illicit Activity', 'Interact With High-risk Tag Address'],
      risk_detail: [
        { entity: 'huionepay', risk_type: 'sanctioned_entity', exposure_type: 'indirect', hop_num: 2, volume: 2373.904, percent: 45.652, hop_dic: { '1': ['huionepay'], '2': ['TExZLkqhytVwJ3Dbcsp16u91f2oFTD1VEQ'], '3': [target] } },
        { entity: 'xinbi guarantee', risk_type: 'sanctioned_entity', exposure_type: 'indirect', hop_num: 3, volume: 30.874, percent: 0.594, hop_dic: { '1': ['xinbi guarantee'], '2': ['TPZpqQpkV35Y1YXuYDJsZZkiEefCrrGGfA'], '3': ['TExZLkqhytVwJ3Dbcsp16u91f2oFTD1VEQ'], '4': [target] } },
        { entity: 'USDT Banned Address', risk_type: 'illicit_activity', exposure_type: 'indirect', hop_num: 3, volume: 22.372, percent: 0.43, hop_dic: { '1': ['TNXubajgkYKmQ2rCG3oqR3HDjYZWZJYxxg'], '2': ['TENjUs6TYuxjmQxMBkP9g2cg9Ug5mJrWCz'], '3': [target] } },
      ],
      risk_report_url: url,
    };
  }
  return {
    score,
    risk_level: 'Severe',
    hacking_event: 'Lazarus Group — Bybit 交易所被盗事件 (2025-02)',
    address_label: 'Lazarus Group, Sanctioned (OFAC SDN), DPRK',
    detail_list: ['Malicious Address', 'Sanctioned Entity', 'Mixer', 'Involved Theft Activity'],
    risk_detail: [
      { entity: 'Tornado Cash', risk_type: 'mixer', exposure_type: 'direct', hop_num: 1, volume: 48210.5, percent: 61.2, hop_dic: { '1': ['Tornado Cash'], '2': [target] } },
      { entity: 'Garantex', risk_type: 'sanctioned_entity', exposure_type: 'direct', hop_num: 1, volume: 22904.7, percent: 29.1, hop_dic: { '1': ['Garantex'], '2': [target] } },
      { entity: 'Bybit Exploiter', risk_type: 'illicit_activity', exposure_type: 'direct', hop_num: 1, volume: 6120.0, percent: 7.8, hop_dic: { '1': ['Bybit Exploiter'], '2': [target] } },
    ],
    risk_report_url: url,
  };
}
