/* Shared sx fragments for the Developer dialogs — prototype-faithful sizes. */

export const modalInputSx = {
  width: '100%',
  height: 64,
  px: '22px',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: 'grey.300',
  borderRadius: '12px',
  bgcolor: 'background.paper',
  fontFamily: 'inherit',
  fontSize: 18,
  color: 'text.primary',
  outline: 'none',
  transition: 'border-color 120ms ease-out',
  '&::placeholder': { color: 'grey.500', opacity: 1 },
  '&:focus': { borderColor: 'primary.main' },
} as const;

export const modalNextSx = {
  height: 64,
  border: 'none',
  borderRadius: '12px',
  bgcolor: 'primary.main',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: 19,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 120ms ease-out',
  '&:hover': { bgcolor: 'primary.dark' },
} as const;

export const modalGhostSx = {
  height: 64,
  px: 8,
  border: '1px solid',
  borderColor: 'grey.300',
  borderRadius: '12px',
  bgcolor: 'background.paper',
  color: 'text.primary',
  fontFamily: 'inherit',
  fontSize: 19,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 120ms ease-out',
  '&:hover': { bgcolor: 'grey.100' },
} as const;

export const modalIntroSx = {
  fontSize: 17,
  lineHeight: 1.5,
  color: 'text.primary',
  m: 0,
  '& a': {
    color: 'text.primary',
    fontWeight: 600,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  '& a:hover': { color: 'primary.main' },
} as const;

export const statusPillSx = {
  display: 'inline-block',
  verticalAlign: 'middle',
  px: '10px',
  py: '2px',
  borderRadius: '6px',
  bgcolor: 'warning.lighter',
  color: 'warning.darker',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.5,
} as const;
