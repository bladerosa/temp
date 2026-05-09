import { useEffect, useState } from 'react';
import { Box, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';

// Pagination — strict implementation of preview/components/Pagination.html.
//   - 64h footer bar inside the table card (TableCard's TableFooter wraps us)
//   - Three modules right-justified with gap 24:
//       summary "All page n" — 14/22 secondary
//       go-to label + 64×32 r8 input
//       step ← / →  (28×28 hit, 20×20 chevron, no border, hover grey-12)
//   - Out-of-range jumps clamp to [1, totalPages] silently with a tiny shake
//   - DOES NOT include a rows-per-page selector (DS Don't)
//   - Single-page result hides go-to + disables both arrows
//   - Empty result: parent should NOT render TablePager (use EmptyState instead)

export type TablePagerProps = {
  page: number;            // 1-based current page
  totalPages: number;
  onPageChange: (next: number) => void;
};

export default function TablePager({ page, totalPages, onPageChange }: TablePagerProps) {
  const [draft, setDraft] = useState(String(page));
  const [shake, setShake] = useState(false);

  useEffect(() => { setDraft(String(page)); }, [page]);

  if (totalPages < 1) return null;
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const singlePage = totalPages === 1;

  const commit = () => {
    const n = parseInt(draft.replace(/\D/g, ''), 10);
    if (!Number.isFinite(n) || n < 1) {
      doShake(); setDraft(String(page)); return;
    }
    const clamped = Math.min(Math.max(1, n), totalPages);
    if (clamped !== n) doShake();
    if (clamped !== page) onPageChange(clamped);
    setDraft(String(clamped));
  };

  const doShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 220);
  };

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      gap={6}
      sx={{
        height: 64,
        px: { xs: 4, sm: 6 },
        pl: { xs: 4, sm: 6 },
        pr: { xs: 4, sm: 2 },
        bgcolor: 'transparent', // TableFooter already grey.100
        fontFamily: '"Poppins"',
      }}
      role="navigation"
      aria-label="分页"
    >
      <Typography sx={{ fontSize: 14, lineHeight: '22px', color: 'text.primary' }}>
        共 {totalPages} 页
      </Typography>

      {!singlePage && (
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography sx={{ fontSize: 14, lineHeight: '22px', color: 'text.primary' }}>
            前往
          </Typography>
          <Box
            sx={{
              width: 64,
              height: 32,
              border: '1px solid #919EAB',
              borderRadius: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 60ms ease-out',
              transform: shake ? 'translateX(0)' : 'translateX(0)',
              animation: shake ? 'pgshake 220ms ease-out' : 'none',
              '@keyframes pgshake': {
                '0%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(4px)' },
                '50%': { transform: 'translateX(-4px)' },
                '75%': { transform: 'translateX(2px)' },
                '100%': { transform: 'translateX(0)' },
              },
              '&:focus-within': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '-1px',
                borderColor: 'primary.main',
              },
            }}
          >
            <InputBase
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
              onBlur={commit}
              inputProps={{
                inputMode: 'numeric',
                style: {
                  textAlign: 'center', fontSize: 14, lineHeight: '22px',
                  padding: 0, color: '#212B36',
                },
              }}
              sx={{ width: '100%', height: '100%' }}
            />
          </Box>
        </Stack>
      )}

      <Stack direction="row" alignItems="center" gap={1} sx={{ px: 1 }}>
        <IconButton
          aria-label="上一页"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
          sx={{
            width: 28, height: 28, borderRadius: 1,
            color: isFirst ? '#C4CDD5' : '#212B36',
            '&:hover': { bgcolor: 'rgba(145,158,171,0.12)' },
          }}
        >
          <ChevronLeftRounded sx={{ fontSize: 20, strokeWidth: 1.75 }} />
        </IconButton>
        <IconButton
          aria-label="下一页"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          sx={{
            width: 28, height: 28, borderRadius: 1,
            color: isLast ? '#C4CDD5' : '#212B36',
            '&:hover': { bgcolor: 'rgba(145,158,171,0.12)' },
          }}
        >
          <ChevronRightRounded sx={{ fontSize: 20, strokeWidth: 1.75 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
}
