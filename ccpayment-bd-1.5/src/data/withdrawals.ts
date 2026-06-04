export type WithdrawalStatus = 'paying' | 'paid' | 'rejected' | 'failed';

export const WD_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  paying: '打款中',
  paid: '已打款',
  rejected: '已拒绝',
  failed: '已失败',
};

export interface Withdrawal {
  createdAt: string;
  createdAtMs: number;
  name: string;
  email: string;
  network: string;
  address: string;
  amount: number;
  status: WithdrawalStatus;
  updatedAt: string;
}

const ADDRESSES = [
  '0x4766f2c9a1b3d57e2a8f6d1e9b3c4f5a6d7e04e37e',
  '0x3665a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3674501',
  '0x571b8e9d0f1a2b3c4d5e6f7a8b9c0d1e2f3a211eac',
  '0x558D2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7caDF65f',
  'TDRMPHt4Eu5Z6Y7X8W9V0U1T2S3R4Q5P6OCP3WNS',
];

const NO_MERCHANT_SENDERS = [
  { name: 'testhack', email: 'LeoSun1299@playsmart.ai', addr: ADDRESSES[1] },
  { name: 'testhack', email: 'LeoSun1243@playsmart.ai', addr: ADDRESSES[1] },
  { name: '6hhh', email: '6hang+bd2@proton.me', addr: ADDRESSES[0] },
  { name: 'jasee', email: 'jasees+0202@proton.me', addr: ADDRESSES[3] },
  { name: 'jasee', email: 'jasees+0128@proton.me', addr: ADDRESSES[3] },
  { name: 'Jasees', email: 'Jasees+12271@proton.me', addr: ADDRESSES[3] },
  { name: 'Jasees+1227', email: 'Jasees+1227@proton.me', addr: ADDRESSES[3] },
  { name: 'ppp', email: 'lglydk1016@gmail.com', addr: ADDRESSES[1] },
  { name: '波比11', email: 'Jasees+33@proton.me', addr: ADDRESSES[3] },
];

const MERCHANT_SENDERS = [
  { name: '6hhh', email: '6hang+bd@proton.me', addr: ADDRESSES[0] },
  { name: 'test', email: 'herculew+1@protonmail.com', addr: ADDRESSES[1] },
  { name: 'jasees', email: 'jasees@proton.me', addr: ADDRESSES[3] },
];

const ON_CHAIN_NETS = ['Polygon', 'Ethereum', 'Binance Smart Chain', 'OPTIMISM', 'Tron blockchain'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let __seed = 7;
function rand() {
  __seed = (__seed * 9301 + 49297) % 233280;
  return __seed / 233280;
}

function statusFor(i: number): WithdrawalStatus {
  if (i % 11 === 0) return 'paying';
  if (i % 7 === 0) return 'paid';
  if (i % 13 === 0) return 'failed';
  return 'rejected';
}

export function makeWithdrawals(): Withdrawal[] {
  __seed = 7;
  const list: Withdrawal[] = [];
  const baseTime = new Date('2026-04-08T16:41:00').getTime();

  for (let i = 0; i < 50; i++) {
    const s = NO_MERCHANT_SENDERS[i % NO_MERCHANT_SENDERS.length];
    const t = baseTime - (i * 86400000) / 2 - Math.floor(rand() * 86400000);
    const updT = t + (15 + rand() * 60) * 60000;
    const amount =
      i % 8 === 0 ? 50 : i % 5 === 0 ? 1.70503 : 1 + (i % 9) * 0.5;
    list.push({
      createdAt: fmtDate(new Date(t)),
      createdAtMs: t,
      name: s.name,
      email: s.email,
      network: ON_CHAIN_NETS[i % ON_CHAIN_NETS.length],
      address: s.addr,
      amount,
      status: statusFor(i),
      updatedAt: fmtDate(new Date(updT)),
    });
  }
  for (let i = 0; i < 12; i++) {
    const s = MERCHANT_SENDERS[i % MERCHANT_SENDERS.length];
    const t = baseTime - 86400000 * (3 + i * 1.5);
    const updT = t + (15 + rand() * 60) * 60000;
    const amount =
      i === 5 ? 32.28798584 : i === 11 ? 2326.5 : 10 + i * 4.5;
    const status: WithdrawalStatus = i === 2 ? 'paying' : i % 3 === 0 ? 'paid' : 'rejected';
    list.push({
      createdAt: fmtDate(new Date(t)),
      createdAtMs: t,
      name: s.name,
      email: s.email,
      network: 'Polygon',
      address: s.addr,
      amount,
      status,
      updatedAt: fmtDate(new Date(updT)),
    });
  }
  list.push({
    createdAt: '2026-01-04 14:00',
    createdAtMs: new Date('2026-01-04T14:00').getTime(),
    name: '--',
    email: '--',
    network: 'Tron blockchain',
    address: ADDRESSES[4],
    amount: 2326.5,
    status: 'paid',
    updatedAt: '2026-01-04 14:08',
  });
  return list;
}

export function shortAddr(a: string) {
  return a.length > 14 ? `${a.slice(0, 6)}...${a.slice(-5)}` : a;
}
