import { Box, IconButton, MenuItem, Select } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  rangeLabel: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  pageSize,
  onPageSizeChange,
  rangeLabel,
  page,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '22px',
        p: '14px 20px',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fff',
        fontSize: 13,
        color: 'text.secondary',
      }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
        Rows per page:
        <Select
          size="small"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          sx={{ height: 32, fontSize: 13, '& .MuiSelect-select': { py: 0 } }}
        >
          {[50, 100, 200].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box>{rangeLabel}</Box>
      <Box sx={{ display: 'inline-flex', gap: '4px' }}>
        <IconButton
          size="small"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous"
          sx={{ width: 32, height: 32, color: 'text.primary' }}
        >
          <ChevronLeft size={16} />
        </IconButton>
        <IconButton
          size="small"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next"
          sx={{ width: 32, height: 32, color: 'text.primary' }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Box>
    </Box>
  );
}
