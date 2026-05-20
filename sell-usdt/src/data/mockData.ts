import type { CompletedRow, RejectedRow, SellOrderRaw } from './types';

export const PENDING_ROWS: SellOrderRaw[] = [
  { time: '13 Sep 2024 14:49:34', recordId: '202409...688064', mid: 'CP14732', sellAmt: 222,    market: 1,        ccy: 'USD', bank: 'TrueMoney (Thai…' },
  { time: '13 Sep 2024 14:43:06', recordId: '202409...899520', mid: 'CP14732', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'TrueMoney (Thai…' },
  { time: '13 Sep 2024 14:29:56', recordId: '202409...324864', mid: 'CP14732', sellAmt: 100,    market: 0.90284,  ccy: 'EUR', bank: 'Deutsche Bank' },
  { time: '30 Aug 2024 14:08:33', recordId: '202408...050560', mid: 'CP15641', sellAmt: 130,    market: 1,        ccy: 'USD', bank: 'Ecopayz' },
  { time: '30 Aug 2024 14:06:07', recordId: '202408...950016', mid: 'CP16451', sellAmt: 101,    market: 0.902797, ccy: 'EUR', bank: 'FCM Bank' },
  { time: '30 Aug 2024 11:51:17', recordId: '202408...605184', mid: 'CP16451', sellAmt: 101,    market: 0.903005, ccy: 'EUR', bank: 'FCM Bank' },
  { time: '30 Aug 2024 10:34:54', recordId: '202408...679616', mid: 'CP15641', sellAmt: 120,    market: 1,        ccy: 'USD', bank: 'Neteller' },
  { time: '30 Aug 2024 10:32:34', recordId: '202408...851840', mid: 'CP13174', sellAmt: 999600, market: 1,        ccy: 'USD', bank: 'Banco Agro…' },
  { time: '30 Aug 2024 10:31:00', recordId: '202408...551872', mid: 'CP15641', sellAmt: 200,    market: 0.903295, ccy: 'EUR', bank: 'NLB' },
  { time: '30 Aug 2024 10:22:41', recordId: '202408...248192', mid: 'CP15641', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'Ecopayz' },
  { time: '29 Aug 2024 17:47:44', recordId: '202408...177344', mid: 'CP13174', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'Banco Agro…' },
  { time: '29 Aug 2024 17:42:45', recordId: '202408...149056', mid: 'CP13174', sellAmt: 100,    market: 0.90128,  ccy: 'EUR', bank: 'Sparkasse (IT)' },
];

export const PAYING_ROWS: SellOrderRaw[] = [
  { time: '19 Aug 2025 18:01:39', recordId: '202507...370816', mid: 'CP16882', sellAmt: 100000, market: 0.85639,  ccy: 'EUR', bank: 'Bank transfer', operator: 'shirley13' },
  { time: '23 Jun 2025 16:15:36', recordId: '202505...228032', mid: 'CP15243', sellAmt: 100022, market: 0.88314,  ccy: 'EUR', bank: 'Bank transfer', operator: 'shirley13' },
  { time: '27 Feb 2025 15:14:55', recordId: '202502...619264', mid: 'CP16451', sellAmt: 100000, market: 0.955055, ccy: 'EUR', bank: 'Bank transfer', operator: 'shirley13' },
  { time: '15 May 2025 19:38:26', recordId: '202412...201088', mid: 'CP16451', sellAmt: 100010, market: 0.961115, ccy: 'EUR', bank: 'Bank transfer', operator: 'gliu29514' },
  { time: '21 Nov 2024 20:23:11', recordId: '202411...836608', mid: 'CP15641', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'TrueMoney (…',  operator: 'gliu29514' },
  { time: '31 Dec 2024 11:31:27', recordId: '202411...729664', mid: 'CP16236', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'FasterPay',     operator: 'shirley13' },
  { time: '12 Sep 2024 17:38:44', recordId: '202409...822016', mid: 'CP15641', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'Global66',      operator: 'gliu29514' },
  { time: '16 May 2025 14:46:56', recordId: '202409...272064', mid: 'CP16236', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'KHQR',          operator: 'shirley13' },
  { time: '08 Jul 2025 14:15:19', recordId: '202408...638976', mid: 'CP16236', sellAmt: 200,    market: 1,        ccy: 'USD', bank: 'FasterPay',     operator: 'shirley13' },
];

export const TRANSFER_PENDING_ROWS: SellOrderRaw[] = [
  { time: '14 Sep 2024 09:12:08', recordId: '202409...771840', mid: 'CP14732', sellAmt: 222,    market: 1,        ccy: 'USD', bank: 'TrueMoney (Thai…', operator: 'shirley13' },
  { time: '14 Sep 2024 09:15:43', recordId: '202409...108160', mid: 'CP14732', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'TrueMoney (Thai…', operator: 'shirley13' },
  { time: '01 Sep 2024 11:30:24', recordId: '202409...532032', mid: 'CP15641', sellAmt: 130,    market: 1,        ccy: 'USD', bank: 'Ecopayz',           operator: 'gliu29514' },
  { time: '01 Sep 2024 14:08:33', recordId: '202408...050240', mid: 'CP16451', sellAmt: 101,    market: 0.902797, ccy: 'EUR', bank: 'FCM Bank',          operator: 'shirley13' },
  { time: '31 Aug 2024 16:20:55', recordId: '202408...605000', mid: 'CP15641', sellAmt: 200,    market: 0.903295, ccy: 'EUR', bank: 'NLB',               operator: 'shirley13' },
  { time: '31 Aug 2024 12:48:11', recordId: '202408...248320', mid: 'CP15641', sellAmt: 100,    market: 1,        ccy: 'USD', bank: 'Ecopayz',           operator: 'gliu29514' },
];

export const REJECTED_ROWS: RejectedRow[] = [
  { time: '19 Aug 2025 18:04:02', recordId: '202508...097280', mid: 'CP16792', refund: '120,000 USDT', reason: 'Incorrect Recipient Inform…', operator: 'shirley13' },
  { time: '23 Jul 2025 20:21:01', recordId: '202507...396288', mid: 'CP15641', refund: '110 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'shirley13' },
  { time: '29 Nov 2024 15:08:06', recordId: '202411...030656', mid: 'CP16451', refund: '111 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'gliu29514' },
  { time: '29 Nov 2024 15:08:14', recordId: '202411...201216', mid: 'CP16451', refund: '111 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'gliu29514' },
  { time: '29 Nov 2024 15:08:10', recordId: '202411...453824', mid: 'CP16451', refund: '111 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'gliu29514' },
  { time: '29 Nov 2024 15:08:18', recordId: '202411...238784', mid: 'CP15641', refund: '100 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'gliu29514' },
  { time: '22 Nov 2024 11:31:51', recordId: '202411...594560', mid: 'CP16451', refund: '111 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'gliu29514' },
  { time: '21 Nov 2024 20:23:03', recordId: '202411...554112', mid: 'CP15641', refund: '120 USDT',     reason: 'Incorrect Recipient Inform…', operator: 'momek50304' },
];

export const COMPLETED_ROWS: CompletedRow[] = [
  { time: '18 May 2026 17:07:42', orderId: '202605...108160', mid: 'CP28355', fiatPaid: '98,990.09 USD', payBank: 'FasterPay',     proofId: 'test0000009999',               cwalletTo: '100,000.0995 USDT', cwalletId: '9527321',  operator: 'shirley13' },
  { time: '15 May 2026 15:07:50', orderId: '202605...079104', mid: 'CP28355', fiatPaid: '98,990.00 USD', payBank: 'FasterPay',     proofId: '123123',                       cwalletTo: '100,000 USDT',      cwalletId: '34575837', operator: 'System' },
  { time: '04 Sep 2025 17:30:55', orderId: '202509...095040', mid: 'CP15243', fiatPaid: '84,441.43 EUR', payBank: 'Bank transfer', proofId: '12323',                        cwalletTo: '100,000 USDT',      cwalletId: '34575837', operator: 'System' },
  { time: '22 Aug 2025 19:01:40', orderId: '202508...236096', mid: 'CP16792', fiatPaid: '98,990.00 USD', payBank: 'Neteller',      proofId: '123',                          cwalletTo: '100,000 USDT',      cwalletId: '34575837', operator: 'System' },
  { time: '01 Jul 2025 16:58:26', orderId: '202507...931392', mid: 'CP16882', fiatPaid: '83,915.8 EUR',  payBank: 'Bank transfer', proofId: '1',                            cwalletTo: '100,000 USDT',      cwalletId: '34575837', operator: 'User' },
  { time: '03 Sep 2024 16:11:15', orderId: '202409...364352', mid: 'CP15641', fiatPaid: '80.00 USD',    payBank: 'Global66',      proofId: '20240902034018216153707364352', cwalletTo: '80 USDT',           cwalletId: '9576481',  operator: 'User' },
  { time: '06 Sep 2024 15:55:05', orderId: '202409...655616', mid: 'CP15641', fiatPaid: '235.18 EUR',   payBank: 'Global66',      proofId: '235.18',                       cwalletTo: '260 USDT',          cwalletId: '9576481',  operator: 'System' },
];

export const NAV_ITEMS: Array<{
  key: string;
  label: string;
  hasChev?: boolean;
  children?: Array<{ key: string; label: string }>;
}> = [
  { key: 'n_dashboard', label: '数据看板',       hasChev: true },
  { key: 'n_finance',   label: '财务数据看板',   hasChev: true },
  { key: 'n_activity',  label: '活动中心',       hasChev: true },
  { key: 'n_token',     label: '代币/网络管理',  hasChev: true },
  {
    key: 'merchant',
    label: '商户管理',
    children: [
      { key: 'merchant-roles',    label: '商户角色管理' },
      { key: 'merchant-list',     label: '商户列表' },
      { key: 'merchant-register', label: '商户注册列表' },
      { key: 'merchant-accounts', label: '账户列表' },
      { key: 'merchant-freeze',   label: '资产冻结/解冻' },
    ],
  },
  { key: 'n_trx',      label: 'TRX 能量租赁',   hasChev: false },
  { key: 'n_trade',    label: '交易查询',       hasChev: true  },
  { key: 'n_risk',     label: '风控交易管理',   hasChev: true  },
  { key: 'n_collect',  label: '归集系统',       hasChev: true  },
  { key: 'n_campaign', label: '投放',           hasChev: false },
  { key: 'n_promo',    label: '推广合作',       hasChev: true  },
  { key: 'n_recon',    label: '对账',           hasChev: true  },
  { key: 'sell-usdt',  label: 'Sell USDT 申请', hasChev: false },
  { key: 'n_notif',    label: '通知系统',       hasChev: true  },
  { key: 'n_opslog',   label: '运营系统日志',   hasChev: false },
  { key: 'n_ip',       label: '封禁IP',         hasChev: false },
  { key: 'n_email',    label: '邮件验证码列表', hasChev: false },
];
