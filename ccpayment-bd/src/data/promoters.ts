export interface Merchant {
  name: string;
  id: string;
}

export interface Promoter {
  name: string;
  email: string;
  joined: string;
  ip: number;
  bound: number;
  funded: number;
  total: number;
  commission: number;
  totalCom: number;
  withdrawn: number;
  pending: number;
  remark: string;
  has2fa?: boolean;
  merchant: Merchant | null;
}

export const KNOWN_MERCHANTS: Record<string, string> = {
  CP10001: 'Acme Pay',
  CP10238: 'SecurityLab',
  CP10456: 'Shirley Studio',
  CP10781: 'PlaySmart',
  CP10912: 'Satoshi Games',
  CP11034: 'Yuu',
  CP11290: 'Hercules',
  CP11765: '6Hang Pay',
  CP12110: 'Lalala Mart',
  CP12345: 'Jasees Inc.',
};

export const INITIAL_PROMOTERS: Promoter[] = [
  { name: 'testhack', email: 'LeoSun1299@playsmart.ai', joined: '2026-05-27 11:20:54', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '', merchant: null },
  { name: 'testhack', email: 'LeoSun1243@playsmart.ai', joined: '2026-03-27 10:44:07', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '', merchant: null },
  { name: 'securitytest', email: 'ywu829557@gmail.com', joined: '2026-03-11 11:01:15', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '1ds...565', has2fa: true, merchant: { name: 'SecurityLab', id: 'CP10238' } },
  { name: '6hhh', email: '6hang+bd2@proton.me', joined: '2026-03-09 11:27:47', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 50, remark: '', merchant: null },
  { name: 'shirley', email: 'shirley130+1@proton.me', joined: '2026-03-05 11:43:55', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '', merchant: { name: 'Shirley Studio', id: 'CP10456' } },
  { name: 'LeoSun', email: 'LeoSun@playsmart.ai', joined: '2026-02-25 16:12:19', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '', has2fa: true, merchant: { name: 'PlaySmart', id: 'CP10781' } },
  { name: 'Satoshigamezz', email: 'satoshigamezz@gmail.com', joined: '2026-02-19 15:46:44', ip: 1, bound: 1, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '', has2fa: true, merchant: { name: 'Satoshi Games', id: 'CP10912' } },
  { name: 'Yuutest', email: 'ok3120368@gmail.com', joined: '2026-02-03 16:56:12', ip: 2, bound: 1, funded: 1, total: 1, commission: 0.9, totalCom: 0.18, withdrawn: 0, pending: 0.18, remark: 'test', has2fa: true, merchant: { name: 'Yuu', id: 'CP11034' } },
  { name: 'jasee', email: 'jasees+0202@proton.me', joined: '2026-02-02 15:01:14', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: 'test-001', merchant: null },
  { name: 'jasee', email: 'jasees+0128@proton.me', joined: '2026-01-28 17:35:29', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 100, remark: 'test-003', merchant: null },
  { name: 'test', email: 'herculew+1@protonmail.com', joined: '2026-01-28 17:26:40', ip: 2, bound: 1, funded: 1, total: 6.908338, commission: 0.034544, totalCom: 40.007491, withdrawn: 0, pending: 37000.007491, remark: 'Alvin12', has2fa: true, merchant: { name: 'Hercules', id: 'CP11290' } },
  { name: 'Jasees', email: 'Jasees+12271@proton.me', joined: '2025-12-27 21:50:23', ip: 1, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '888', merchant: null },
  { name: 'Jasees+1227', email: 'Jasees+1227@proton.me', joined: '2025-12-27 19:30:53', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '456', merchant: null },
  { name: '6hhh', email: '6hang+bd@proton.me', joined: '2025-12-08 11:08:45', ip: 6, bound: 8, funded: 6, total: 579.6748980951, commission: 220.96070268808, totalCom: 109.62097584404, withdrawn: 39.49301584, pending: 70.12796000404, remark: 'shirley', has2fa: true, merchant: { name: '6Hang Pay', id: 'CP11765' } },
  { name: 'ppp', email: 'lglydk1016@gmail.com', joined: '2025-09-27 09:42:48', ip: 1, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '999', merchant: null },
  { name: '波比11', email: 'Jasees+33@proton.me', joined: '2025-09-25 15:40:08', ip: 0, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 0, remark: '', merchant: null },
  { name: 'lalala', email: '6hang@proton.me', joined: '2025-09-17 10:56:30', ip: 2, bound: 0, funded: 0, total: 0, commission: 0, totalCom: 0, withdrawn: 0, pending: 100, remark: '000', has2fa: true, merchant: { name: 'Lalala Mart', id: 'CP12110' } },
  { name: 'jasees', email: 'jasees@proton.me', joined: '2024-11-26 15:16:45', ip: 4, bound: 2, funded: 0, total: 0, commission: 0, totalCom: 500, withdrawn: 0, pending: 500, remark: '', merchant: { name: 'Jasees Inc.', id: 'CP12345' } },
];
