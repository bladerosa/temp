// CCPayment MUI theme — single source for any provider import.
// `palette`, `typography`, `shadows`, `components` live in their own files
// for readability; combine here.

import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { shadows, brandShadows } from './shadows';
import { components } from './components';

const baseOptions: ThemeOptions = {
  palette,
  typography,
  shadows,
  shape: { borderRadius: 8 },
  spacing: 4, // 4-pt grid
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1280, xl: 1440 },
  },
  components,
};

export const ccpaymentTheme = createTheme(baseOptions);
export { brandShadows };

// Optional palette ext: lets `sx={{ color: 'primary.lighter' }}` typecheck.
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}
