import type { Components, Theme } from '@mui/material/styles';
import { brandShadows } from './shadows';

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: { backgroundColor: '#F4F6F8' },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 700,
      },
      sizeSmall: { padding: '4px 12px' },
      sizeMedium: { padding: '11px 20px' },
      sizeLarge: { padding: '11px 24px' },
      containedPrimary: {
        boxShadow: brandShadows.primary,
        '&:hover': { boxShadow: brandShadows.primary },
      },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: brandShadows.card,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: brandShadows.dialog,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CACFD8' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#3C6FF5',
          borderWidth: 1,
          boxShadow: '0 0 0 3px rgba(60,111,245,0.14)',
        },
      },
      notchedOutline: { borderColor: 'rgba(145,158,171,0.32)' },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: { '&::placeholder': { color: '#B3B9C5', opacity: 1 } },
    },
  },
  MuiTextField: {
    defaultProps: { size: 'small' },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: '#F8F9FB',
        color: '#71757E',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      },
      body: {
        fontSize: 13,
        color: '#1F2025',
        borderBottom: '1px solid rgba(145,158,171,0.16)',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': { backgroundColor: '#F8F9FB' },
        '&:last-child td': { borderBottom: 'none' },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 999, fontWeight: 600, fontSize: 12, height: 22 },
      sizeSmall: { height: 20 },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: { backgroundColor: '#26282D', fontSize: 12 },
      arrow: { color: '#26282D' },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        padding: '8px 12px',
        '&.Mui-selected': { backgroundColor: '#E8ECF2' },
        '&.Mui-selected:hover': { backgroundColor: '#E8ECF2' },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
};
