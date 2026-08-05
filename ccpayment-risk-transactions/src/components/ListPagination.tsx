import { useState } from 'react';
import { Box, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export interface ListPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const arrowSx = (disabled: boolean) =>
  ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: disabled ? 'text.disabled' : 'text.primary',
    cursor: disabled ? 'not-allowed' : 'pointer',
    '&:hover': disabled ? undefined : { bgcolor: 'rgba(145,158,171,0.08)' },
  }) as const;

/** 原型的列表页脚：每頁數量 + `起 ~ 迄 / 總數` + 前後翻頁。 */
export function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: ListPaginationProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ gap: 7, py: 5 }}>
      <Stack direction="row" alignItems="center" sx={{ gap: 2, fontSize: 14 }}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>每頁數量:</Typography>
        <Stack
          direction="row"
          alignItems="center"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ gap: 0.5, cursor: 'pointer', userSelect: 'none' }}
        >
          <Typography sx={{ fontSize: 14 }}>{pageSize}</Typography>
          <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
            <ChevronDown size={18} strokeWidth={1.7} />
          </Box>
        </Stack>
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          slotProps={{ paper: { sx: { minWidth: 88 } } }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem
              key={n}
              selected={n === pageSize}
              onClick={() => {
                onPageSizeChange(n);
                setAnchor(null);
              }}
              sx={{ fontSize: 14 }}
            >
              {n}
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      <Typography sx={{ fontSize: 14 }}>
        {start} ~ {end} / {total}
      </Typography>

      <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
        <Box
          role="button"
          aria-label="上一頁"
          sx={arrowSx(page <= 1)}
          onClick={() => page > 1 && onPageChange(page - 1)}
        >
          <ChevronLeft size={20} strokeWidth={1.8} />
        </Box>
        <Box
          role="button"
          aria-label="下一頁"
          sx={arrowSx(page >= totalPages)}
          onClick={() => page < totalPages && onPageChange(page + 1)}
        >
          <ChevronRight size={20} strokeWidth={1.8} />
        </Box>
      </Stack>
    </Stack>
  );
}
