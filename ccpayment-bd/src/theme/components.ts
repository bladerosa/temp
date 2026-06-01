import type { Components, Theme } from '@mui/material/styles';
import { brandShadows } from './shadows';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      'html, body, #root': { height: '100%' },
      body: { backgroundColor: '#F4F6F8' },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 14,
        lineHeight: '20px',
      },
      sizeMedium: { padding: '11px 20px' },
      sizeSmall: { padding: '4px 12px' },
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
      root: { borderRadius: 16, boxShadow: brandShadows.card },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 16, boxShadow: brandShadows.dialog },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8ECF2' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CACFD8' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#3C6FF5',
          borderWidth: 1,
        },
        '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(60,111,245,0.12)' },
      },
    },
  },
  MuiTextField: {
    defaultProps: { variant: 'outlined' },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: '#F8F9FB',
        color: '#71757E',
        fontSize: 13,
        fontWeight: 500,
        borderBottom: '1px solid #E8ECF2',
        whiteSpace: 'nowrap',
      },
      body: {
        fontSize: 14,
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
      root: {
        borderRadius: 6,
        height: 22,
        fontWeight: 500,
        fontSize: 12,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#26282D',
        fontSize: 12,
      },
      arrow: { color: '#26282D' },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontSize: 14,
      },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
  },
};
