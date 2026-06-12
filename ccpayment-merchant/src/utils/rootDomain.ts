/* Normalize any URL/domain string down to its root domain.
   Mirrors the prototype behavior, including common two-level TLDs. */
const TWO_LEVEL_TLDS = [
  'co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.cn', 'net.cn', 'org.cn',
  'com.hk', 'com.tw', 'com.au', 'net.au', 'org.au', 'co.jp', 'co.kr',
  'com.sg', 'com.br',
];

export function rootDomain(str: string): string {
  if (!str) return '';
  let s = String(str).trim().toLowerCase();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // strip protocol
  s = s.split('@').pop() ?? '';                 // strip userinfo
  s = s.split('/')[0].split('?')[0].split('#')[0]; // strip path/query/hash
  s = s.split(':')[0];                          // strip port
  const parts = s.split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const last2 = parts.slice(-2).join('.');
  if (TWO_LEVEL_TLDS.includes(last2)) return parts.slice(-3).join('.');
  return last2;
}
