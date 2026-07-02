import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import type { DrillCtx } from '@/data/types';
import { downloadCsv } from '@/utils/csv';

interface DrillRow {
  id: string;
  time?: string;
  amt?: string;
  last?: string;
}

interface ColMeta {
  k: keyof DrillRow;
  label: string;
  align?: 'left' | 'right';
}

const METRIC_META: Record<
  DrillCtx['metric'],
  { title: string; cols: ColMeta[] }
> = {
  reg: { title: '新增注册商户', cols: [{ k: 'id', label: '商户ID' }, { k: 'time', label: '注册时间' }] },
  txn: { title: '交易商户', cols: [{ k: 'id', label: '商户ID' }, { k: 'amt', label: '交易金额', align: 'right' }] },
  idle: { title: '无交易商户', cols: [{ k: 'id', label: '商户ID' }, { k: 'last', label: '最后一次交易时间' }] },
};

function buildDrillRows(ctx: DrillCtx): DrillRow[] {
  const seedLabel = `${ctx.metric}-${ctx.label}-${ctx.unit}`;
  // Show all merchants — pagination lets the user page through the full set.
  const N = ctx.count;
  let seed = 0;
  for (let i = 0; i < seedLabel.length; i++) seed = (seed * 31 + seedLabel.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const baseId = 14000 + (seed % 2000);
  const pad = (n: number, w: number) => String(n).padStart(w, '0');
  const rows: DrillRow[] = [];
  for (let i = 0; i < N; i++) {
    const id = `CP${baseId + i + Math.floor(rand() * 80)}`;
    const dayBack = Math.floor(rand() * 180);
    const d = new Date(2026, 4, 12 - dayBack);
    const time = `${d.getFullYear()}/${pad(d.getMonth() + 1, 2)}/${pad(d.getDate(), 2)} ${pad(
      Math.floor(rand() * 24),
      2
    )}:${pad(Math.floor(rand() * 60), 2)}`;
    if (ctx.metric === 'reg') {
      rows.push({ id, time });
    } else if (ctx.metric === 'txn') {
      const amt = (rand() * 50000 + 50).toFixed(2);
      rows.push({ id, amt: `$${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}` });
    } else {
      const hasLast = rand() > 0.35;
      rows.push({ id, last: hasLast ? time : '-' });
    }
  }
  return rows;
}

const PAGE_SIZE = 20;

export function DrillModal({ ctx, onClose }: { ctx: DrillCtx | null; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const meta = ctx ? METRIC_META[ctx.metric] : null;
  const rows = useMemo(() => (ctx ? buildDrillRows(ctx) : []), [ctx]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageRows = rows.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  // Reset to page 1 whenever the context changes.
  useMemo(() => setPage(1), [ctx]);

  if (!ctx || !meta) return null;

  const exportCsv = () => {
    const headers = meta.cols.map((c) => c.label);
    const data = rows.map((r) => meta.cols.map((c) => r[c.k] ?? ''));
    downloadCsv(
      `${meta.title}_${ctx.label}_${ctx.unit}.csv`.replace(/[\s/]+/g, '_'),
      [headers, ...data]
    );
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 4 }}>
        <Stack sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            {meta.title} · {ctx.label}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
            共 {ctx.count.toLocaleString()} 家商户
          </Typography>
        </Stack>
        <Button size="small" variant="outlined" startIcon={<Download size={13} />} onClick={exportCsv}>
          导出 CSV
        </Button>
        <IconButton onClick={onClose} size="small">
          <X size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {meta.cols.map((c) => (
                  <TableCell key={c.k} align={c.align ?? 'left'} sx={{ pl: 5, pr: 4 }}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((r, i) => (
                <TableRow key={i}>
                  {meta.cols.map((c) => {
                    const v = r[c.k];
                    const isMono = c.k === 'id';
                    return (
                      <TableCell
                        key={c.k}
                        align={c.align ?? 'left'}
                        sx={{
                          pl: 5,
                          pr: 4,
                          color: v === '-' ? 'text.secondary' : isMono ? 'primary.main' : 'text.primary',
                          fontFamily: isMono ? 'var(--font-mono)' : undefined,
                        }}
                      >
                        {v}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 3, px: 5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}
      >
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          显示 {rows.length === 0 ? 0 : (curPage - 1) * PAGE_SIZE + 1} –{' '}
          {Math.min(curPage * PAGE_SIZE, rows.length)} 共 {rows.length} 条
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="small"
            disabled={curPage === 1}
            onClick={() => setPage(curPage - 1)}
            sx={{ width: 28, height: 28 }}
          >
            <ChevronLeft size={14} />
          </IconButton>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Window the 5 visible buttons around curPage.
            const half = 2;
            let start = Math.max(1, curPage - half);
            const end = Math.min(totalPages, start + 4);
            start = Math.max(1, end - 4);
            return start + i;
          })
            .filter((n) => n >= 1 && n <= totalPages)
            .map((n) => (
              <Box
                key={n}
                onClick={() => setPage(n)}
                sx={{
                  minWidth: 28,
                  height: 28,
                  px: 1.5,
                  display: 'inline-grid',
                  placeItems: 'center',
                  borderRadius: 1.5,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  bgcolor: n === curPage ? 'primary.main' : 'transparent',
                  color: n === curPage ? '#fff' : 'text.primary',
                  '&:hover': n === curPage ? {} : { bgcolor: 'grey.200' },
                }}
              >
                {n}
              </Box>
            ))}
          <IconButton
            size="small"
            disabled={curPage >= totalPages}
            onClick={() => setPage(curPage + 1)}
            sx={{ width: 28, height: 28 }}
          >
            <ChevronRight size={14} />
          </IconButton>
        </Stack>
      </Stack>
    </Dialog>
  );
}
