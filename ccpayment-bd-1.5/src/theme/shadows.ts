import type { Shadows } from '@mui/material/styles';

export const brandShadows = {
  card: '0 0 2px 0 rgba(145,158,171,0.20), 0 12px 24px -4px rgba(145,158,171,0.12)',
  dialog: '-40px 40px 80px -8px rgba(145,158,171,0.24)',
  dropdown:
    '-20px 20px 40px -4px rgba(182,184,176,0.24), 0 0 2px 0 rgba(182,184,176,0.24)',
  primary: '0 8px 16px 0 rgba(60,111,245,0.24)',
  success: '0 8px 16px 0 rgba(67,190,118,0.24)',
  warning: '0 8px 16px 0 rgba(231,178,43,0.24)',
  error: '0 8px 16px 0 rgba(236,104,76,0.24)',
};

const z1 = '0 1px 2px 0 rgba(113,117,126,0.12)';
const z4 = '0 4px 8px 0 rgba(145,158,171,0.16)';
const z8 = '0 8px 16px 0 rgba(145,158,171,0.16)';
const z12 = '0 12px 24px -4px rgba(113,117,126,0.20)';
const z16 = '0 16px 32px -4px rgba(145,158,171,0.24)';
const z20 = '0 20px 40px -4px rgba(145,158,171,0.24)';
const z24 = '0 24px 48px 0 rgba(145,158,171,0.24)';

export const shadows: Shadows = [
  'none',
  z1,
  z1,
  z1,
  z4,
  z4,
  z4,
  z4,
  z8,
  z8,
  z8,
  z8,
  z12,
  z12,
  z12,
  z12,
  z16,
  z16,
  z16,
  z16,
  z20,
  z20,
  z20,
  z24,
  z24,
];
