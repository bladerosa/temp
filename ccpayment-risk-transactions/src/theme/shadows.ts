import type { Shadows } from '@mui/material/styles';

const Z = [
  '0 1px 2px 0 rgba(113,117,126,0.12)',
  '0 2px 4px 0 rgba(145,158,171,0.16)',
  '0 4px 8px 0 rgba(145,158,171,0.16)',
  '0 8px 16px 0 rgba(145,158,171,0.16)',
  '0 12px 24px -4px rgba(113,117,126,0.20)',
  '0 16px 32px -4px rgba(145,158,171,0.24)',
  '0 20px 40px -4px rgba(145,158,171,0.24)',
  '0 24px 48px 0 rgba(145,158,171,0.24)',
];

// MUI requires a 25-tuple. Tile the brand z-stack across the remaining slots.
export const shadows = ['none', ...Z, ...Array(25 - 1 - Z.length).fill(Z[Z.length - 1])] as unknown as Shadows;

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
