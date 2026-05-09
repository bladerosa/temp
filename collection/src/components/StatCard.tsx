import { Box, Stack, Typography, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { brandShadows } from '@/theme';

// StatCard — strict implementation of preview/card.html §05A.
// Anatomy:
//   - 24px padding (no exception)
//   - Label    = 13/secondary regular           (Poppins)
//   - Value    = 32 / bold / -0.2 letter-spacing (Poppins, NOT 26)
//   - Sub line = 12 / font-mono / semantic-darker (success-dark / warning-dark / secondary)
//                Use deltaDir 'up'/'down' for ▲ +N / ▼ -N format,
//                or pass `hint` as plain string for "— 3 awaiting verification" style.
// Card surface stays WHITE — DS Don't (§06): "Don't recolor the card surface".
// The "lead" emphasis is achieved by adding a subtle 3px primary left rail
// (`tone="lead"`), NOT by tinting the surface. This is the DS-compliant
// alternative to the prior accent-gradient.

export type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  /** Plain hint copy under value (12 mono, secondary). e.g. "73 个地址 · 平均 $848" */
  hint?: ReactNode;
  /** Optional delta with ▲/▼ glyph and semantic color. Renders before hint. */
  delta?: { dir: 'up' | 'down'; text: ReactNode };
  /** "lead" adds a 3px primary left rail (DS-allowed accent treatment). */
  tone?: 'default' | 'lead';
  sx?: SxProps;
};

const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace';

export default function StatCard({
  label, value, hint, delta, tone = 'default', sx,
}: StatCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 4,                              // 16
        boxShadow: brandShadows.card,
        p: 6,                                         // 24 all sides per spec
        // Lead rail — single allowed accent treatment per DS card.html §06.
        ...(tone === 'lead' && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0, top: 16, bottom: 16,
            width: 3,
            borderRadius: 2,
            bgcolor: 'primary.main',
          },
        }),
        ...sx,
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: '20px',
            fontWeight: 400,
            color: 'text.secondary',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 32,
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '-0.4px',
            color: 'text.primary',
            // Allow long-format numbers like "$1,234,567.89" to ellipsize gracefully
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
        {(delta || hint) && (
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
