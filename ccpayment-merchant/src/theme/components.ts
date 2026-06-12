import type { Components, Theme } from '@mui/material/styles';
import { brandShadows } from './shadows';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#FFFFFF',
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 700,
        boxShadow: 'none',
      },
      sizeSmall: { padding: '4px 12px', minHeight: 30 },
      sizeMedium: { padding: '8px 16px', minHeight: 36 },
      sizeLarge: { padding: '11px 24px', minHeight: 44 },
      containedPrimary: {
        '&:hover': {
          boxShadow: brandShadows.primary,
        },
      },
      outlined: {
        borderColor: '#3C6FF5',
        '&:hover': {
          backgroundColor: 'rgba(60,111,245,0.06)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: 'rgba(145,158,171,0.10)',
        },
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
        backgroundColor: '#FFFFFF',
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
        color: '#1F2025',
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '4px 24px 8px',
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
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E8ECF2',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#CACFD8',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#3C6FF5',
          borderWidth: 1,
        },
        '&.Mui-focused': {
          boxShadow: '0 0 0 3px rgba(60,111,245,0.14)',
        },
        '&.Mui-error.Mui-focused': {
          boxShadow: '0 0 0 3px rgba(236,104,76,0.16)',
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: 14,
        color: '#71757E',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        height: 22,
        fontWeight: 600,
        fontSize: 12,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(145,158,171,0.16)',
        fontSize: 14,
      },
      head: {
        backgroundColor: '#F4F6F9',
        color: '#71757E',
        fontSize: 13,
        fontWeight: 400,
        height: 48,
        whiteSpace: 'nowrap',
      },
      body: {
        color: '#1F2025',
        padding: '18px 16px',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background 120ms ease-out',
        '&:hover': {
          backgroundColor: '#FAFBFD',
        },
        '&:last-child td': {
          borderBottom: 'none',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#26282D',
        fontSize: 12,
        borderRadius: 6,
      },
      arrow: {
        color: '#26282D',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        minHeight: 38,
        fontSize: 14,
        '&.Mui-selected': {
          backgroundColor: '#E8ECF2',
        },
        '&.Mui-selected:hover': {
          backgroundColor: '#E8ECF2',
        },
      },
    },
  },
};
