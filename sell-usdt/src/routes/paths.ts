export const PATHS = {
  root: '/',
  sellUsdt: '/dashboard/sell-usdt',
  merchantDetail: '/dashboard/merchant/list/detail',
  hotWallet: '/dashboard/hot-wallet/assets',
  stub: '/dashboard/stub/:key',
} as const;

export function stubPath(key: string): string {
  return `/dashboard/stub/${key}`;
}
