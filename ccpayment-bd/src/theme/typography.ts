import type { TypographyOptions } from '@mui/material/styles/createTypography';

const fontFamily =
  '"Poppins", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const typography: TypographyOptions = {
  fontFamily,
  h1: { fontFamily, fontWeight: 700, fontSize: 40, lineHeight: '56px', letterSpacing: '-0.5px' },
  h2: { fontFamily, fontWeight: 700, fontSize: 24, lineHeight: '36px' },
  h3: { fontFamily, fontWeight: 700, fontSize: 20, lineHeight: '28px' },
  h4: { fontFamily, fontWeight: 700, fontSize: 18, lineHeight: '24px' },
  h5: { fontFamily, fontWeight: 700, fontSize: 16, lineHeight: '24px' },
  h6: { fontFamily, fontWeight: 700, fontSize: 14, lineHeight: '20px' },
  subtitle1: { fontFamily, fontWeight: 600, fontSize: 16, lineHeight: '24px' },
  subtitle2: { fontFamily, fontWeight: 600, fontSize: 14, lineHeight: '20px' },
  body1: { fontFamily, fontWeight: 400, fontSize: 16, lineHeight: '24px' },
  body2: { fontFamily, fontWeight: 400, fontSize: 14, lineHeight: '20px' },
  caption: { fontFamily, fontWeight: 400, fontSize: 12, lineHeight: '16px' },
  overline: {
    fontFamily,
    fontWeight: 600,
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: '1.1px',
    textTransform: 'uppercase',
  },
  button: {
    fontFamily,
    fontWeight: 600,
    fontSize: 14,
    lineHeight: '20px',
    textTransform: 'none',
  },
};
