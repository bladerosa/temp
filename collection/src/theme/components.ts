// Per-component MUI overrides — strict refactor against the CCPayment Design
// System ui_kit (preview/components/*.html). Every recipe here points back to
// the named DS spec frame so future audits can re-verify in one read.

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

  // -------- buttons (preview/buttons.html) --------
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 700,
        boxShadow: 'none',
        transition: 'background 120ms ease-out, box-shadow 120ms ease-out',
      },
      sizeSmall:  { padding: '4px 12px',  fontSize: 12, lineHeight: '22px' },
      sizeMedium: { padding: '9px 20px',  fontSize: 14, lineHeight: '22px' },
      sizeLarge:  { padding: '11px 24px', fontSize: 16, lineHeight: '26px' },
      // Contained primary keeps the colored shadow at rest (per DS).
      containedPrimary: {
        boxShadow: brandShadows.primary,
        '&:hover': { boxShadow: brandShadows.primary, backgroundColor: '#1E3EB0' },
        '&.Mui-disabled': { boxShadow: 'none', backgroundColor: '#CACFD8', color: '#71757E' },
      },
      containedSuccess: { boxShadow: brandShadows.success, '&:hover': { boxShadow: brandShadows.success } },
      containedWarning: { boxShadow: brandShadows.warning, color: '#1F2025', '&:hover': { boxShadow: brandShadows.warning, color: '#fff' } },
      containedError:   { boxShadow: brandShadows.error,   '&:hover': { boxShadow: brandShadows.error } },
      // Outlined uses inset box-shadow, not a normal border (DS pattern keeps height stable).
      outlined: {
        border: 0,
        boxShadow: 'inset 0 0 0 1px #CACFD8',
        color: '#1F2025',
        '&:hover': { backgroundColor: 'rgba(60,111,245,0.04)', boxShadow: 'inset 0 0 0 1px #3C6FF5', border: 0 },
      },
      outlinedPrimary: {
        boxShadow: 'inset 0 0 0 1px #3C6FF5',
        color: '#3C6FF5',
        '&:hover': { backgroundColor: 'rgba(60,111,245,0.08)', boxShadow: 'inset 0 0 0 1px #3C6FF5' },
      },
      text: {
        '&:hover': { backgroundColor: 'rgba(145,158,171,0.08)' },
      },
      textPrimary: {
        '&:hover': { backgroundColor: 'rgba(60,111,245,0.08)' },
      },
    },
  },

  // -------- icon button (preview/appbar.html: 36px circle) --------
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '50%',
        '&:hover': { backgroundColor: 'rgba(145,158,171,0.08)' },
      },
      sizeSmall: { width: 32, height: 32 },
      sizeMedium: { width: 36, height: 36 },
      sizeLarge: { width: 40, height: 40 },
    },
  },

  // -------- card (preview/components/CardHeader.html — 16 radius, shadow-card) --------
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        boxShadow: brandShadows.card,
        backgroundImage: 'none',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 24,
        '&:last-child': { paddingBottom: 24 },
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

  // -------- AppBar (preview/appbar.html — 72h, white, bottom border) --------
  MuiAppBar: {
    defaultProps: { color: 'inherit', elevation: 0 },
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        color: '#1F2025',
        borderBottom: '1px solid #E8ECF2',
        boxShadow: 'none',
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: 72,
        '@media (min-width:600px)': { minHeight: 72 },
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E8ECF2',
        boxShadow: 'none',
      },
    },
  },

  // -------- Dialog (preview/components/Dialog.html) --------
  // Spec: confirm/form default 480 wide; header 72h pad 24/12/24/24; title
  // 18/28 700; body NO dividers (forbidden in Confirm/Acknowledge/Media);
  // footer pad 24 with gap 12.
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
        lineHeight: '28px',
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '12px 24px 8px',
        // Force-disable dividers — DS forbids body dividers in confirm/form
        // dialogs. If a use-case truly needs them (split-summary form variant)
        // pass dividers=true and override locally.
        '&.MuiDialogContent-dividers': { borderTop: 0, borderBottom: 0, padding: '12px 24px 8px' },
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: { padding: '16px 24px 24px', gap: 12 },
    },
  },

  // -------- Text fields (preview/text-fields.html) --------
  MuiTextField: {
    defaultProps: { size: 'small', variant: 'outlined' },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        transition: 'box-shadow 120ms ease-out, border-color 120ms ease-out',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8ECF2' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#A3A8B1' },
        '&.Mui-focused': {
          boxShadow: '0 0 0 3px rgba(60,111,245,0.14)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3C6FF5', borderWidth: 1 },
        },
        '&.Mui-disabled': { backgroundColor: '#F8F9FB' },
      },
      input: {
        fontSize: 14,
        padding: '10px 12px',
        '&::placeholder': { color: '#A3A8B1', opacity: 1 },
      },
      sizeSmall: {
        '& .MuiOutlinedInput-input': { padding: '8px 12px' },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: 14, color: '#71757E',
        '&.Mui-focused': { color: '#3C6FF5' },
      },
    },
  },
  MuiSelect: {
    defaultProps: { size: 'small' },
    styleOverrides: {
      select: { paddingTop: 8, paddingBottom: 8 },
    },
  },

  // -------- Menu (preview/components/Menu.html) --------
  // Spec: 38h, radius 4, padding 8 symmetric, gap 4. Selected uses cool
  // blue-grey #E8ECF2 fill with no color tint or weight bump (DS Don't
  // explicitly forbids "invent extra hover affordances / show a check /
  // colorize selected").
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        margin: '2px 6px',
        fontSize: 14,
        minHeight: 38,
        height: 38,
        fontWeight: 400,
        padding: '0 8px',
        '&:hover': { backgroundColor: 'rgba(145,158,171,0.12)' },
        '&.Mui-selected': {
          backgroundColor: '#E8ECF2',
          color: 'inherit',
          fontWeight: 400,
          '&:hover': { backgroundColor: '#DDE3EC' },
        },
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: brandShadows.dropdown,
        padding: 4,
      },
    },
  },

  // -------- Chip (preview/components/Chip.html: 26h, radius 9999, soft) --------
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 9999,
        fontWeight: 600,
        fontSize: 12,
        height: 26,
        padding: 0,
      },
      label: { padding: '0 10px' },
      sizeSmall: { height: 22, fontSize: 11, '& .MuiChip-label': { padding: '0 8px' } },
      // Soft semantic colors — text colors recalibrated to Chip.html canonical
      // (mid-darker, not the palette `darker`). `darker` is reserved for
      // filled-on-light contrast and outlined chip text.
      colorPrimary: { backgroundColor: 'rgba(60,111,245,0.16)',  color: 'rgb(38, 77, 196)' }, // brand-mid darker
      colorSuccess: { backgroundColor: 'rgba(67,190,118,0.16)',  color: 'rgb(34, 128, 79)' },
      colorWarning: { backgroundColor: 'rgba(231,178,43,0.16)',  color: 'rgb(165, 114, 15)' },
      colorError:   { backgroundColor: 'rgba(236,104,76,0.16)',  color: 'rgb(184, 68, 46)' },
      colorInfo:    { backgroundColor: 'rgba(101,174,232,0.16)', color: 'rgb(40, 114, 164)' },
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

  // -------- Table (preview/table.html) --------
  // Note: the canonical "table-wrap" recipe (single card with grey-100 toolbar
  // + grey-100 pagination strip) is composed at the page level — see
  // src/components/TableCard.tsx for the recipe.
  MuiTable: {
    styleOverrides: {
      root: { borderCollapse: 'collapse' },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottomColor: 'rgba(145,158,171,0.16)',
        fontSize: 14,
        padding: '14px 16px',
      },
      // Spec table.html: head bg = grey.100 (NOT white) so toolbar→head→body
      // colour transition is continuous; uppercase mono-ish 11/12 secondary.
      head: {
        backgroundColor: '#F8F9FB',
        color: '#71757E',
        fontWeight: 500,
        fontSize: 12,
        lineHeight: '16px',
        textTransform: 'none',
        height: 56,
        padding: '0 16px',
        borderBottom: '1px solid #E8ECF2',
        whiteSpace: 'nowrap',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background 120ms ease-out',
        '&:hover': { backgroundColor: '#F8F9FB' },
        '&:last-child td': { borderBottom: 'none' },
      },
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: {
        borderTop: '1px solid #E8ECF2',
        backgroundColor: '#F8F9FB',
        minHeight: 64,
      },
      toolbar: { minHeight: 64, paddingLeft: 16, paddingRight: 16 },
      selectLabel: { fontSize: 13, color: '#71757E' },
      displayedRows: { fontSize: 13, color: '#71757E' },
      input: { fontSize: 13 },
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
      standardSuccess: { backgroundColor: 'rgba(67,190,118,0.16)',  color: '#0C5B4C' },
      standardWarning: { backgroundColor: 'rgba(231,178,43,0.16)',  color: '#72490B' },
      standardError:   { backgroundColor: 'rgba(236,104,76,0.16)',  color: '#710E1B' },
      standardInfo:    { backgroundColor: 'rgba(101,174,232,0.16)', color: '#15326C' },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: { borderColor: 'rgba(145,158,171,0.16)' },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: 999 },
    },
  },

  // -------- Lists (used in sidebar fallback only — sidebar itself is custom now) --------
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '&.Mui-selected': {
          backgroundColor: 'rgba(60,111,245,0.08)',
          color: '#3C6FF5',
          '&:hover': { backgroundColor: 'rgba(60,111,245,0.12)' },
        },
      },
    },
  },
};
