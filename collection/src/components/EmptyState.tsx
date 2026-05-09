import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

// Centered empty-state block. Used inside table bodies and card content.
// 48px vertical padding sits between two states the user already navigated
// to — visually distinct, but not loud.

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
        py: 12, // 48px (spacing=4 → 12 = 48)
        px: 4,
        backgroundColor: 'grey.100',
        borderRadius: 3,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ maxWidth: 360, textAlign: 'center' }}>
        <Box sx={{ color: 'text.secondary', fontSize: 0, lineHeight: 0 }}>{icon}</Box>
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
    </Box>
  );
}
