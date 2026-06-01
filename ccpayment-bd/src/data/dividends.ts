import dayjs from 'dayjs';

export interface DividendRecord {
  createdAt: string;
  endAt: string;
  merchantId: string;
  merchantName: string;
  ratio: number; // percent
}

export const addOneYear = (dt: string): string =>
  dayjs(dt, 'YYYY-MM-DD HH:mm:ss').add(1, 'year').format('YYYY-MM-DD HH:mm:ss');

const RAW: Array<Omit<DividendRecord, 'endAt'>> = [
  { createdAt: '2026-04-14 15:53:08', merchantId: '27145', merchantName: 'safe test', ratio: 20 },
  { createdAt: '2026-03-05 15:42:30', merchantId: '25917', merchantName: '6666', ratio: 20 },
  { createdAt: '2026-03-03 15:53:08', merchantId: '14195', merchantName: 'batchtest', ratio: 20 },
  { createdAt: '2026-03-03 15:53:08', merchantId: '25597', merchantName: 'lalala', ratio: 10 },
  { createdAt: '2026-03-03 11:20:41', merchantId: '13218', merchantName: 'bd4', ratio: 60 },
  { createdAt: '2026-03-02 15:53:08', merchantId: '23738', merchantName: 'bdd2', ratio: 20 },
  { createdAt: '2026-02-27 13:38:48', merchantId: '27039', merchantName: 'npbd1-第二个号', ratio: 50 },
  { createdAt: '2026-02-26 13:52:49', merchantId: '15626', merchantName: 'np1', ratio: 50 },
];

export const makeDividendRecords = (): DividendRecord[] =>
  RAW.map((r) => ({ ...r, endAt: addOneYear(r.createdAt) }));
