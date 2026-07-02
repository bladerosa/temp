import { MERCHANTS } from './merchants';

/** Static per-merchant profile used by 查看交易统计 extended columns. All values
 *  are deterministic mock data keyed off the merchant id (no randomness at
 *  render time), so the same merchant always shows the same profile. */
export interface MerchantProfile {
  /** 商户登录邮箱。部分商户共用同一邮箱以体现「关联商户」。 */
  email: string;
  /** 关联商户数量 = 与本商户共用同一邮箱的「其他」商户数（不含自身）。 */
  linkedCount: number;
  /** 首充时间 `YYYY.MM.DD`。 */
  firstDepositAt: string;
  /** 最后充值时间 `YYYY.MM.DD`。 */
  lastDepositAt: string;
  /** 当前执行充值费率（百分比，如 1.20 表示 1.20%）。 */
  depositFeeRate: number;
  /** 风险交易笔数（命中风控规则的交易数）。 */
  riskTxnCount: number;
}

/** Email clusters that intentionally SHARE one email across several merchants,
 *  so 关联商户数量 is meaningful. Any merchant not listed gets a unique email. */
const EMAIL_CLUSTERS: Record<string, string[]> = {
  'ops@nimbusgroup.io':      ['CP15641', 'CP15203', 'CP15487'],
  'treasury@orchidcap.com':  ['CP14982', 'CP14761'],
  'finance@meridian-fx.com': ['CP14129', 'CP15071', 'CP14299'],
};

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '');

const EMAIL_BY_ID: Record<string, string> = {};
for (const m of MERCHANTS) EMAIL_BY_ID[m.id] = `billing@${slug(m.name)}.com`;
for (const [email, ids] of Object.entries(EMAIL_CLUSTERS))
  for (const id of ids) EMAIL_BY_ID[id] = email;

const EMAIL_COUNT: Record<string, number> = {};
for (const id in EMAIL_BY_ID) {
  const e = EMAIL_BY_ID[id];
  EMAIL_COUNT[e] = (EMAIL_COUNT[e] ?? 0) + 1;
}

function seedRand(seed: number) {
  let s = seed % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function idSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const pad = (n: number) => String(n).padStart(2, '0');

const PROFILES: Record<string, MerchantProfile> = {};
for (const m of MERCHANTS) {
  const r = seedRand(idSeed(m.id));
  const email = EMAIL_BY_ID[m.id];

  // 首充时间：2023–2024 年内某天（日 1–27 规避月末溢出）。
  const fYear = 2023 + Math.floor(r() * 2); // 2023 or 2024
  const fMonth = 1 + Math.floor(r() * 12);
  const fDay = 1 + Math.floor(r() * 27);

  // 最后充值时间：贴近全局窗口末端 2026.04.16–2026.05.12。
  const lRaw = 16 + Math.floor(r() * 27); // 16..42
  const lMonth = lRaw > 30 ? 5 : 4;
  const lDay = lRaw > 30 ? lRaw - 30 : lRaw;

  PROFILES[m.id] = {
    email,
    linkedCount: Math.max(0, (EMAIL_COUNT[email] ?? 1) - 1),
    firstDepositAt: `${fYear}.${pad(fMonth)}.${pad(fDay)}`,
    lastDepositAt: `2026.${pad(lMonth)}.${pad(lDay)}`,
    depositFeeRate: +(0.3 + r() * 1.2).toFixed(2), // 0.30% – 1.50%
    riskTxnCount: Math.floor(r() * 43), // 0 – 42
  };
}

const EMPTY: MerchantProfile = {
  email: '—',
  linkedCount: 0,
  firstDepositAt: '—',
  lastDepositAt: '—',
  depositFeeRate: 0,
  riskTxnCount: 0,
};

/** Look up a merchant's static profile by id. */
export function merchantProfile(id: string): MerchantProfile {
  return PROFILES[id] ?? EMPTY;
}
