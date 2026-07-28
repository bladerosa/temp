import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { BarChart3 } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={3} sx={{ py: 12 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'grey.100',
          color: 'text.secondary',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon ?? <BarChart3 size={32} />}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {desc && (
        <Typography variant="body2" color="text.secondary">
          {desc}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
