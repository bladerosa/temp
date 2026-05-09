// CCPayment shadow ladder — Z1..Z24 + the signature offset-left dialog/dropdown casts.
// MUI requires `shadows` to be a 25-length tuple ordered by elevation.

import type { Shadows } from '@mui/material/styles';

const Z = [
  'none',
  '0 1px 2px 0 rgba(113,117,126,0.12)',
  '0 1px 2px 0 rgba(113,117,126,0.16)',
  '0 2px 4px 0 rgba(145,158,171,0.16)',
  '0 4px 8px 0 rgba(145,158,171,0.16)',
  '0 6px 12px 0 rgba(145,158,171,0.16)',
  '0 8px 16px 0 rgba(145,158,171,0.16)',
  '0 10px 20px 0 rgba(145,158,171,0.16)',
  '0 12px 24px -4px rgba(113,117,126,0.20)',
  '0 14px 28px -4px rgba(113,117,126,0.20)',
  '0 16px 32px -4px rgba(145,158,171,0.20)',
  '0 18px 36px -4px rgba(145,158,171,0.20)',
  '0 20px 40px -4px rgba(145,158,171,0.20)',
  '0 22px 44px -4px rgba(145,158,171,0.20)',
  '0 24px 48px 0 rgba(145,158,171,0.24)',
  '0 26px 52px 0 rgba(145,158,171,0.24)',
  '0 0 2px 0 rgba(145,158,171,0.20), 0 12px 24px -4px rgba(145,158,171,0.12)', // shadow-card
  '0 0 2px 0 rgba(145,158,171,0.20), 0 16px 32px -4px rgba(145,158,171,0.16)',
  '0 0 2px 0 rgba(145,158,171,0.20), 0 20px 40px -4px rgba(145,158,171,0.20)',
  '-20px 20px 40px -4px rgba(182,184,176,0.24), 0 0 2px 0 rgba(182,184,176,0.24)', // shadow-dropdown
  '-20px 20px 40px -4px rgba(182,184,176,0.28), 0 0 2px 0 rgba(182,184,176,0.28)',
  '-30px 30px 60px -8px rgba(145,158,171,0.24)',
  '-40px 40px 80px -8px rgba(145,158,171,0.24)', // shadow-dialog
  '-40px 40px 80px -8px rgba(145,158,171,0.28)',
  '-40px 40px 80px -8px rgba(145,158,171,0.32)',
] as Shadows;

export const shadows = Z;

// Named CCPayment shadows — for explicit `boxShadow: brandShadows.card` usage in sx.
export const brandShadows = {
  card: '0 0 2px 0 rgba(145,158,171,0.20), 0 12px 24px -4px rgba(145,158,171,0.12)',
  dialog: '-40px 40px 80px -8px rgba(145,158,171,0.24)',
  dropdown: '-20px 20px 40px -4px rgba(182,184,176,0.24), 0 0 2px 0 rgba(182,184,176,0.24)',
  primary: '0 8px 16px 0 rgba(60,111,245,0.24)',
  success: '0 8px 16px 0 rgba(67,190,118,0.24)',
  warning: '0 8px 16px 0 rgba(231,178,43,0.24)',
  error: '0 8px 16px 0 rgba(236,104,76,0.24)',
};
