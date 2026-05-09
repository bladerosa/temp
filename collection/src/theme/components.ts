// Per-component MUI overrides — make every primitive feel native to CCPayment.
// Anything that matters visually for the brand (button shape, card shadow,
// table row dividers, chip variants, dialog elevation) is locked here.

import type { Components, Theme } from '@mui/material';
import { brandShadows } from './shadows';

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#F4F6F8',
      },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 700,
        boxShadow: 'none',
      },
      sizeSmall: { height: 30, padding: '0 10px', fontSize: 13 },
      sizeMedium: { height: 36, padding: '0 16px' },
      sizeLarge: { height: 48, padding: '0 22px', fontSize: 15 },
      containedPrimary: {
        boxShadow: 'none',
        '&:hover': { boxShadow: brandShadows.primary, backgroundColor: '#1E3EB0' },
      },
      outlined: {
        borderColor: '#CACFD8',
        '&:hover': { borderColor: '#3C6FF5', backgroundColor: 'rgba(60,111,245,0.04)' },
      },
      text: {
        '&:hover': { backgroundColor: 'rgba(60,111,245,0.08)' },
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '&:hover': { backgroundColor: 'rgba(145,158,171,0.08)' },
      },
    },
  },

  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        boxShadow: brandShadows.card,
      },
    },
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundImage: 'none' },
      rounded: { borderRadius: 12 },
    },
  },

  MuiAppBar: {
    defaultProps: { color: 'default', elevation: 0 },
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        color: '#1F2025',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(145,158,171,0.16)',
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid rgba(145,158,171,0.16)',
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

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '20px 24px 12px',
        fontSize: 18,
        fontWeight: 700,
        lineHeight: '24px',
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '12px 24px 8px',
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px 20px',
        gap: 8,
      },
    },
  },

  MuiTextField: {
    defaultProps: { size: 'small', variant: 'outlined' },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CACFD8' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#A3A8B1' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3C6FF5', borderWidth: 1 },
      },
      input: { fontSize: 14, '&::placeholder': { color: '#A3A8B1', opacity: 1 } },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: { fontSize: 14, color: '#71757E' },
    },
  },

  MuiSelect: {
    styleOverrides: {
      select: { paddingTop: 8, paddingBottom: 8 },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '2px 6px',
        fontSize: 14,
        '&:hover': { backgroundColor: 'rgba(145,158,171,0.08)' },
        '&.Mui-selected': {
          backgroundColor: 'rgba(60,111,245,0.08)',
          color: '#3C6FF5',
          fontWeight: 600,
          '&:hover': { backgroundColor: 'rgba(60,111,245,0.12)' },
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        height: 22,
      },
      label: { padding: '0 8px' },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#26282D',
        fontSize: 12,
        fontWeight: 500,
        padding: '6px 10px',
        borderRadius: 6,
      },
      arrow: { color: '#26282D' },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottomColor: 'rgba(145,158,171,0.16)',
        fontSize: 13.5,
        padding: '14px 12px',
      },
      head: {
        backgroundColor: '#F8F9FB',
        color: '#71757E',
        fontWeight: 600,
        fontSize: 12,
        lineHeight: '16px',
        textTransform: 'none',
        padding: '12px 12px',
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

  MuiTablePagination: {
    styleOverrides: {
      root: {
        borderTop: '1px solid rgba(145,158,171,0.16)',
        backgroundColor: '#F8F9FB',
      },
      toolbar: { minHeight: 56 },
      selectLabel: { fontSize: 12, color: '#71757E' },
      displayedRows: { fontSize: 12, color: '#71757E' },
    },
  },

  MuiSwitch: {
    styleOverrides: {
      switchBase: {
        '&.Mui-checked': {
          color: '#FFFFFF',
          '& + .MuiSwitch-track': { backgroundColor: '#3C6FF5', opacity: 1 },
        },
      },
      track: { borderRadius: 999, opacity: 1, backgroundColor: '#CACFD8' },
    },
  },

  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: '#CACFD8',
        '&.Mui-checked': { color: '#3C6FF5' },
      },
    },
  },

  MuiSnackbar: {
    defaultProps: { anchorOrigin: { vertical: 'top', horizontal: 'center' } },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        fontSize: 14,
        alignItems: 'flex-start',
      },
      standardSuccess: { backgroundColor: '#DBFBDB', color: '#0C5B4C' },
      standardWarning: { backgroundColor: '#FEF7D8', color: '#72490B' },
      standardError:   { backgroundColor: '#FEECDB', color: '#710E1B' },
      standardInfo:    { backgroundColor: '#E3F7FD', color: '#15326C' },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: { borderColor: 'rgba(145,158,171,0.16)' },
    },
  },
};
