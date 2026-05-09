import { Box, Stack, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { brandShadows } from '@/theme';

// Single-card table wrapper — strict implementation of preview/table.html.
// Anatomy:
//   ┌──────────────────────────────────────────┐
//   │  72h  toolbar  bg=grey-100  bot-border   │  ← TableToolbar
//   ├──────────────────────────────────────────┤
//   │  56h  thead    bg=paper                  │  ← <Table>
//   │  76h  tbody rows                         │
//   ├──────────────────────────────────────────┤
//   │  64h  pagination  bg=grey-100  top-border│  ← TableFooter
//   └──────────────────────────────────────────┘
//
// Use this anywhere a paginated data grid lives. Compose:
//   <TableCard>
//     <TableToolbar left={...} right={...}/>
//     <TableContainer><Table>...</Table></TableContainer>
//     <TableFooter><TablePagination .../></TableFooter>
//   </TableCard>

export function TableCard({ children, sx }: { children: ReactNode; sx?: SxProps }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 4, // 16
        boxShadow: brandShadows.card,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function TableToolbar({
  left, right, sx,
}: { left?: ReactNode; right?: ReactNode; sx?: SxProps }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        height: 72,
        px: 4, // 16
        bgcolor: 'grey.100',
        borderBottom: '1px solid #E8ECF2',
        gap: 4,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" gap={4} flex={1} sx={{ minWidth: 0, flexWrap: 'wrap' }}>
        {left}
      </Stack>
      <Stack direction="row" alignItems="center" gap={1}>
        {right}
      </Stack>
    </Stack>
  );
}

export function TableFooter({ children, sx }: { children: ReactNode; sx?: SxProps }) {
  return (
    <Box
      sx={{
        bgcolor: 'grey.100',
        borderTop: '1px solid #E8ECF2',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
