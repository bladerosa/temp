/* Coin badge SVGs — ported verbatim from the prototype. The mainstream coin
   marks are missing from the DS crypto asset set, so these brand-styled
   stand-ins are the canonical source. */

function badge(bg: string, inner: string): string {
  return `<svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="${bg}"/>${inner}</svg>`;
}

function glyph(t: string, fg: string, size: number, dy = 0): string {
  return `<text x="18" y="${18 + dy}" text-anchor="middle" dominant-baseline="central" font-family="Poppins, sans-serif" font-weight="700" font-size="${size}" fill="${fg}">${t}</text>`;
}

export const COIN_BADGES: Record<string, string> = {
  BTC: badge('#F7931A', glyph('₿', '#fff', 20)),
  ETH: badge(
    '#ECF0F4',
    '<path d="M18 6l-6.2 10.3L18 20l6.2-3.7L18 6Z" fill="#8A93A6"/><path d="M18 6v14l6.2-3.7L18 6Z" fill="#62708A"/><path d="M11.8 17.5L18 21.4l6.2-3.9L18 30l-6.2-12.5Z" fill="#8A93A6"/>',
  ),
  LTC: badge('#BFBFBF', glyph('Ł', '#fff', 19, -0.5)),
  TRX: badge('#EF0027', glyph('T', '#fff', 18)),
  USDT: badge('#26A17B', glyph('₮', '#fff', 19)),
  BNB: badge(
    '#F3BA2F',
    '<g fill="#fff"><path d="M18 10.5l1.9 1.9L18 14.3l-1.9-1.9L18 10.5Z"/><path d="M14.3 14.2l1.9 1.9L14.3 18l-1.9-1.9 1.9-1.9Z"/><path d="M21.7 14.2l1.9 1.9L21.7 18l-1.9-1.9 1.9-1.9Z"/><path d="M18 17.9l1.9 1.9L18 21.7l-1.9-1.9 1.9-1.9Z"/><path d="M18 14.2l1.9 1.9L18 18l-1.9-1.9L18 14.2Z"/></g>',
  ),
  DOGE: badge('#C3A634', glyph('Ð', '#fff', 18)),
  SHIB: badge('#FFA409', glyph('S', '#fff', 18)),
  USDC: badge('#2775CA', glyph('$', '#fff', 18)),
  XTZ: badge('#2C7DF7', glyph('ꜩ', '#fff', 17, -0.5)),
};

export interface CoinRow {
  sym: string;
  name: string;
  amount: string;
  zero?: boolean;
}

export const COIN_ROWS: CoinRow[] = [
  { sym: 'BTC', name: 'Bitcoin', amount: '0.3849038 BTC' },
  { sym: 'ETH', name: 'Ethereum', amount: '1.28345 ETH' },
  { sym: 'LTC', name: 'Litecion', amount: '3,456.3532 LTC' },
  { sym: 'TRX', name: 'Tron', amount: '265,432.56 TRX' },
  { sym: 'USDT', name: 'Tether USD', amount: '56,475,493.35 USDT' },
  { sym: 'BNB', name: 'BNB', amount: '265,432.56 BNB' },
  { sym: 'DOGE', name: 'Dogecoin', amount: '0.00 DOGE', zero: true },
  { sym: 'SHIB', name: 'Shibe', amount: '0.00 SHIB', zero: true },
  { sym: 'TRX', name: 'Tron', amount: '0.00 TRX', zero: true },
  { sym: 'USDC', name: 'USDC', amount: '0.00 USDC', zero: true },
  { sym: 'XTZ', name: 'XTZ', amount: '0.00 XTZ', zero: true },
];

/* Settings page token chip badges (26px) — ported from the prototype. */
export const TOKEN_BADGES: Record<string, string> = {
  TETH: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="#7B61C9"/><path d="M13 4.5l-5 8.2 5 2.9 5-2.9-5-8.2Z" fill="#fff" opacity=".95"/><path d="M8 13.6l5 2.9 5-2.9-5 7-5-7Z" fill="#fff" opacity=".75"/></svg>',
  ETH: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="#6A7BC8"/><path d="M13 4.5l-5 8.2 5 2.9 5-2.9-5-8.2Z" fill="#fff" opacity=".95"/><path d="M8 13.6l5 2.9 5-2.9-5 7-5-7Z" fill="#fff" opacity=".75"/></svg>',
  BTC: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="#F7931A"/><text x="13" y="13" text-anchor="middle" dominant-baseline="central" font-family="Poppins,sans-serif" font-size="14" font-weight="800" fill="#fff">₿</text></svg>',
  USDT: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="#26A17B"/><text x="13" y="13" text-anchor="middle" dominant-baseline="central" font-family="Poppins,sans-serif" font-size="14" font-weight="800" fill="#fff">₮</text></svg>',
  USDC: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="#2775CA"/><text x="13" y="13" text-anchor="middle" dominant-baseline="central" font-family="Poppins,sans-serif" font-size="13" font-weight="800" fill="#fff">$</text></svg>',
};
