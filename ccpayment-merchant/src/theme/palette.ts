import type { PaletteOptions } from '@mui/material/styles';

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

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    lighter: '#D8E7FE',
    light: '#89AFFC',
    main: '#3C6FF5',
    dark: '#1E3EB0',
    darker: '#0B1C75',
    contrastText: '#FFFFFF',
  },
  secondary: {
    lighter: '#F8FDE4',
    light: '#E3F5AD',
    main: '#BEE072',
    dark: '#7AA139',
    darker: '#466B15',
    contrastText: '#1F2025',
  },
  success: {
    lighter: '#DBFBDB',
    light: '#90EBA3',
    main: '#43BE76',
    dark: '#218861',
    darker: '#0C5B4C',
    contrastText: '#FFFFFF',
  },
  info: {
    lighter: '#E3F7FD',
    light: '#AADDF6',
    main: '#65AEE8',
    dark: '#3767A3',
    darker: '#15326C',
    contrastText: '#FFFFFF',
  },
  warning: {
    lighter: '#FEF7D8',
    light: '#FAE18B',
    main: '#E7B22B',
    dark: '#AC7C1F',
    darker: '#72490B',
    contrastText: '#1F2025',
  },
  error: {
    lighter: '#FEECDB',
    light: '#F9B593',
    main: '#EC684C',
    dark: '#A92926',
    darker: '#710E1B',
    contrastText: '#FFFFFF',
  },
  grey: {
    100: '#F8F9FB',
    200: '#E8ECF2',
    300: '#CACFD8',
    400: '#A3A8B1',
    500: '#71757E',
    600: '#656872',
    700: '#494C54',
    800: '#383A3F',
    900: '#26282D',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1F2025',
    secondary: '#71757E',
    disabled: '#B3B9C5',
  },
  divider: '#E8ECF2',
};
