import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { shadows, brandShadows } from './shadows';
import { components } from './components';

export const ccpaymentTheme = createTheme({
  palette,
  typography,
  shadows,
  shape: { borderRadius: 8 },
  spacing: 4,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1280, xl: 1440 },
  },
  components,
});

export { brandShadows };
