import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="flex-end"
      justifyContent="space-between"
      sx={{ mb: 4, gap: 3, flexWrap: 'wrap' }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h2" sx={{ fontSize: 22, lineHeight: '30px', letterSpacing: '-0.2px' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>{subtitle}</Typography>
        )}
      </Box>
      {action && (
        <Box
          data-no-print="1"
          sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}
        >
          {action}
        </Box>
      )}
    </Stack>
  );
}
