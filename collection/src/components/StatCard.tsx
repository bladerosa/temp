import { Box, Stack, Typography, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { brandShadows } from '@/theme';

// StatCard — strict implementation of preview/card.html §05A.
// Anatomy (default density):
//   - 24px padding
//   - Label    = 13/secondary regular
//   - Value    = 32 / bold / -0.4 letter-spacing
//   - Sub line = 12 / font-mono / semantic-darker
// Compact density (for dense KPI strips like the Jobs page where >5 cards
// share a row): pad 16, label 12, value 20, no sub line — keep the same
// surface treatment + lead rail.
// Card surface stays WHITE — DS Don't (§06): "Don't recolor the card surface".
// `tone="lead"` adds a 3px primary left rail (DS-allowed accent treatment).

export type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  delta?: { dir: 'up' | 'down'; text: ReactNode };
  tone?: 'default' | 'lead';
  density?: 'default' | 'compact';
  sx?: SxProps;
};

const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace';

const DENSITY = {
  default: { padding: 6, labelSize: 13, labelLh: '20px', valueSize: 32, valueLh: 1.2, valueLs: '-0.4px', minH: 0 },
  compact: { padding: 4, labelSize: 12, labelLh: '16px', valueSize: 20, valueLh: 1.25, valueLs: '-0.2px', minH: 0 },
} as const;

export default function StatCard({
  label, value, hint, delta, tone = 'default', density = 'default', sx,
}: StatCardProps) {
  const D = DENSITY[density];

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: brandShadows.card,
        p: D.padding,
        // 3px primary left rail = DS-allowed accent treatment (preview/card.html §06).
        ...(tone === 'lead' && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: density === 'compact' ? 12 : 16,
            bottom: density === 'compact' ? 12 : 16,
            width: 3,
            borderRadius: 2,
            bgcolor: 'primary.main',
          },
        }),
        ...sx,
      }}
    >
      <Stack spacing={density === 'compact' ? 0.25 : 0.5}>
        <Typography
          sx={{
            fontSize: D.labelSize,
            lineHeight: D.labelLh,
            fontWeight: 400,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: D.valueSize,
            lineHeight: D.valueLh,
            fontWeight: 700,
            letterSpacing: D.valueLs,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
        {(delta || hint) && density === 'default' && (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ fontFamily: FONT_MONO, fontSize: 12, lineHeight: '16px' }}
          >
            {delta && (
              <Box
                component="span"
                sx={{
                  color: delta.dir === 'up' ? 'success.dark' : 'error.dark',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {delta.dir === 'up' ? '▲' : '▼'} {delta.text}
              </Box>
            )}
            {hint && (
              <Typography
                component="span"
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: 'text.secondary',
                  fontWeight: 400,
                }}
              >
                {hint}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
