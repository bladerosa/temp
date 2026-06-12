/* Beginner's guide content — two-tone brand icons ported from the prototype. */

export const GUIDE_ICONS: Record<string, string> = {
  shop: '<svg viewBox="0 0 40 40" fill="none"><path d="M8 14h24l-2-6H10l-2 6Z" fill="#3C6FF5"/><path d="M8 14h24v3a4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-8 0v-3Z" fill="#8FCB3A"/><path d="M10 19v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V19" stroke="#3C6FF5" stroke-width="2.4"/><rect x="16" y="24" width="8" height="9" rx="1" fill="#3C6FF5"/></svg>',
  integration: '<svg viewBox="0 0 40 40" fill="none"><rect x="7" y="15" width="26" height="16" rx="2.5" fill="#3C6FF5"/><path d="M15 15v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" stroke="#3C6FF5" stroke-width="2.4"/><rect x="7" y="20" width="26" height="4" fill="#8FCB3A"/><rect x="17.5" y="20" width="5" height="4" rx="1" fill="#3C6FF5"/></svg>',
  security: '<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="17" width="20" height="15" rx="2.5" fill="#8FCB3A"/><path d="M14 17v-3a6 6 0 0 1 12 0v3" stroke="#3C6FF5" stroke-width="2.6"/><circle cx="26" cy="27" r="5" fill="#3C6FF5"/><path d="M26 24v6M23 27h6" stroke="#fff" stroke-width="1.8"/></svg>',
  support: '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="15" r="5.5" fill="#3C6FF5"/><path d="M9 32c0-6 5-10 11-10s11 4 11 10v1H9v-1Z" fill="#8FCB3A"/></svg>',
};

export interface QuickStartItem {
  icon: keyof typeof GUIDE_ICONS;
  title: string;
  desc: string;
}

export const QUICK_START: QuickStartItem[] = [
  { icon: 'shop', title: 'Simple Setting', desc: 'Configure tokens for your business' },
  {
    icon: 'integration',
    title: 'Integration Setting',
    desc: 'Verify your website and add Webhook URL to receive transaction notification',
  },
  {
    icon: 'security',
    title: 'Account Security',
    desc: 'Level up your account security by setting payment password and 2FA',
  },
  { icon: 'support', title: 'Support', desc: 'Contact your dedicated account manager' },
];

export const FAQ_ITEMS: string[] = [
  'How CCPayment collects service fees?',
  'How to handle orders with partial payments?',
  'What tokens does CCPayment accept for payment?',
  'How long does it take to process a withdrawal?',
  'How to convert cryptocurrency to USD?',
];

export const DOC_URLS = {
  introduction: 'https://ccpayment.com/api/doc?en#introduction',
  depositApis: 'https://ccpayment.com/api/doc?en#deposit-apis',
  withdrawalApi: 'https://ccpayment.com/api/doc?en#withdrawal-api',
  notifyUrlWebhook: 'https://ccpayment.com/api/doc?en#use-notifyurl-webhook',
  support: 'https://ccpayment.com/api/doc?en#support',
  sdk: 'https://github.com/cctip/ccpayment-sdk',
  wooCommerce: 'https://wordpress.org/plugins/ccpayment-crypto-gateway-for-woocommerce/',
  telegram: 'https://t.me/CCPaymentSupportBot',
} as const;
