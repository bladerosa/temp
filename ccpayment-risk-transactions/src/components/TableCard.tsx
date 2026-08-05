import type { ReactNode } from 'react';
import { Box, Card } from '@mui/material';

/**
 * DS 的单卡片表格容器：Tab / 筛选区 / 表格 / 分页共用一个 Card，
 * 而不是拆成多个独立卡片。
 */
export function TableCard({ children }: { children: ReactNode }) {
  return <Card sx={{ overflow: 'hidden' }}>{children}</Card>;
}

export interface TableToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
}

/**
 * 筛选区。原型里这一条位于白色卡面上、表头（grey.200）之上，
 * 因此这里不套灰底。
 */
export function TableToolbar({ left, right }: TableToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
        px: 6,
        pt: 5,
        pb: 4,
      }}
    >
      <Box
        sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}
      >
        {left}
      </Box>
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {right}
      </Box>
    </Box>
  );
}

export function TableFooter({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 6,
      }}
    >
      {children}
    </Box>
  );
}
