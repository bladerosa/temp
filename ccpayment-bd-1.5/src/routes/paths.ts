export const paths = {
  root: '/',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    forgot: '/auth/forgot',
    reset: '/auth/reset',
    success: '/auth/success',
    verifySignup: '/auth/verify-signup',
    setPassword: '/auth/set-password',
  },
  promoter: {
    settlements: '/referral/settlements',
  },
  console: {
    promoters: '/console/promoters',
    withdrawals: '/console/withdrawals',
  },
  merchant: {
    bd: '/merchant/bd',
  },
} as const;
