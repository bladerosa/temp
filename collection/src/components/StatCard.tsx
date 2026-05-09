import { Box, Stack, Typography, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { brandShadows } from '@/theme';

// Stat / KPI card. Strict implementation of preview/components/Stat (+ ui_kit).
// Anatomy:
//   - Card surface 16 radius, padding 20 22, shadow-card (or shadow-primary on accent)
//   - Label   = caption (12 / 16 / Medium) secondary color
//   - Value   = 26 / 1.1 / Bold / -0.2 letter-spacing  (NOT h2)
//   - Delta   = caption / SemiBold, success.main (up) or error.main (down)
//   - Accent  = brand-blue gradient surface, white text, shadow-primary

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'info' | 'error' | 'accent';

const toneAccent: Record<Tone, { color: string; bg: string } | null> = {
  default: null,
  primary: { color: '#3C6FF5', bg: 'rgba(60,111,245,0.10)' },
  success: { color: '#218861', bg: 'rgba(67,190,118,0.12)' },
  warning: { color: '#AC7C1F', bg: 'rgba(231,178,43,0.14)' },
  info:    { color: '#3767A3', bg: 'rgba(101,174,232,0.14)' },
  error:   { color: '#A92926', bg: 'rgba(236,104,76,0.12)' },
  accent:  null, // accent is the full-bleed gradient handled below
};

export type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  delta?: { dir: 'up' | 'down'; text: ReactNode };
  icon?: ReactNode;
  tone?: Tone;
  sx?: SxProps;
};

export default function StatCard({
  label, value, hint, delta, icon, tone = 'default', sx,
}: StatCardProps) {
  const accent = tone !== 'accent' ? toneAccent[tone] : null;
  const isAccent = tone === 'accent';

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: isAccent ? 'transparent' : 'background.paper',
        background: isAccent ? 'linear-gradient(135deg, #3C6FF5 0%, #5A88F8 100%)' : undefined,
        color: isAccent ? '#FFFFFF' : 'text.primary',
        borderRadius: 4, // 16
        boxShadow: isAccent ? brandShadows.primary : brandShadows.card,
        p: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minHeight: 96,
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography
          sx={{
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 500,
            color: isAccent ? 'rgba(255,255,255,0.85)' : 'text.secondary',
          }}
        >
          {label}
        </Typography>
        {icon && (
          <Box
            sx={{
              width: 28, height: 28,
              borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              bgcolor: accent?.bg ?? (isAccent ? 'rgba(255,255,255,0.16)' : 'rgba(145,158,171,0.10)'),
              color: accent?.color ?? (isAccent ? '#FFFFFF' : 'text.secondary'),
              flexShrink: 0,
              '& svg': { fontSize: 16 },
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>

      <Typography
        sx={{
          fontSize: 26, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.2px',
          color: 'inherit',
        }}
      >
        {value}
      </Typography>

      {(hint || delta) && (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {delta && (
            <Typography
              sx={{
                fontSize: 12, lineHeight: '16px', fontWeight: 600,
                color: isAccent
                  ? 'rgba(255,255,255,0.92)'
                  : delta.dir === 'up' ? 'success.main' : 'error.main',
              }}
            >
              {delta.dir === 'up' ? '↑ ' : '↓ '}{delta.text}
            </Typography>
          )}
          {hint && (
            <Typography
              sx={{
                fontSize: 12, lineHeight: '16px',
                color: isAccent ? 'rgba(255,255,255,0.85)' : 'text.secondary',
              }}
            >
              {hint}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
