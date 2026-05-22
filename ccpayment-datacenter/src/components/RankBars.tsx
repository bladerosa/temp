import { Box, Stack, Typography } from '@mui/material';

export interface RankItem {
  id: string;
  name: string;
  value: number;
  unit?: string;
}

export interface RankBarsProps {
  items: RankItem[];
  color?: string;
}

export function RankBars({ items, color = '#3C6FF5' }: RankBarsProps) {
  const max = Math.max(...items.map((it) => it.value), 1);
  return (
    <Stack spacing={0}>
      {items.map((it, i) => {
        const top = i < 3;
        return (
          <Box
            key={it.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              gap: 3,
              alignItems: 'center',
              px: 2,
              py: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.5,
                bgcolor: top ? 'primary.main' : 'grey.100',
                color: top ? '#fff' : 'text.secondary',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {i + 1}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }} noWrap>
                {it.name}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontFamily: 'var(--font-mono)' }}>
                {it.id}
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  height: 4,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  mt: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: '0 auto 0 0',
                    width: `${(it.value / max) * 100}%`,
                    bgcolor: color,
                    borderRadius: 1,
                  }}
                />
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'right',
              }}
            >
              {it.value.toLocaleString()}
              {it.unit && (
                <Box
                  component="span"
                  sx={{ ml: 0.5, fontSize: 11, fontWeight: 500, color: 'text.secondary' }}
                >
                  {it.unit}
                </Box>
              )}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
