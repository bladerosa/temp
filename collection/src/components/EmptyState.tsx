import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

// Centered empty-state block. Renders directly on the parent surface (paper)
// — no tinted background block (that competes with the table chrome).
// 64×64 illustration slot, subtitle1 700 title, optional CTA.

export type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  desc?: ReactNode;
  action?: ReactNode;
};

export default function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 16, // 64
        px: 4,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ maxWidth: 360, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64, height: 64, borderRadius: '50%',
            bgcolor: 'grey.100', color: 'text.secondary',
            display: 'grid', placeItems: 'center',
            mb: 1,
            '& svg': { fontSize: 32 },
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {desc && (
          <Typography variant="body2" color="text.secondary">
            {desc}
          </Typography>
        )}
        {action && <Box sx={{ mt: 1 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}
