import { Box, IconButton } from '@mui/material';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ total }: { total: number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        px: 6,
        py: 4,
        color: 'grey.600',
        fontSize: 13,
        borderTop: '1px solid',
        borderColor: 'rgba(145,158,171,0.24)',
      }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <span>Rows per page:</span>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          100
          <Box sx={{ display: 'inline-flex', color: 'grey.500' }}>
            <ChevronDown size={14} />
          </Box>
        </Box>
      </Box>
      <Box>1–{total} of {total}</Box>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          disabled
          aria-label="previous"
          sx={{ width: 28, height: 28, borderRadius: 1, '&.Mui-disabled': { color: 'grey.300' } }}
        >
          <ChevronLeft size={16} />
        </IconButton>
        <IconButton
          disabled
          aria-label="next"
          sx={{ width: 28, height: 28, borderRadius: 1, '&.Mui-disabled': { color: 'grey.300' } }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Box>
    </Box>
  );
}
