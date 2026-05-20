import type { TypographyOptions } from '@mui/material/styles/createTypography';

const FONT_SANS =
  '"Poppins", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const typography: TypographyOptions = {
  fontFamily: FONT_SANS,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  h1: { fontSize: 40, lineHeight: '56px', fontWeight: 700, letterSpacing: '-0.5px' },
  h2: { fontSize: 24, lineHeight: '36px', fontWeight: 700 },
  h3: { fontSize: 20, lineHeight: '28px', fontWeight: 700 },
  h4: { fontSize: 18, lineHeight: '24px', fontWeight: 700 },
  h5: { fontSize: 16, lineHeight: '24px', fontWeight: 700 },
  h6: { fontSize: 14, lineHeight: '20px', fontWeight: 700 },
  subtitle1: { fontSize: 16, lineHeight: '24px', fontWeight: 600 },
  subtitle2: { fontSize: 14, lineHeight: '20px', fontWeight: 600 },
  body1: { fontSize: 16, lineHeight: '24px', fontWeight: 400 },
  body2: { fontSize: 14, lineHeight: '20px', fontWeight: 400 },
  caption: { fontSize: 12, lineHeight: '16px', fontWeight: 400 },
  overline: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    letterSpacing: '1.1px',
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 700,
    textTransform: 'none',
  },
};
