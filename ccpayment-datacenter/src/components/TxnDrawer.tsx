import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Calendar, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import type { Merchant, PeriodUnit } from '@/data/types';
import { windowDays } from '@/data/kpi';
import { bucketRanges, bucketSum, merchantSparklineValues } from '@/data/merchantSeries';
import { downloadCsv } from '@/utils/csv';
import { fmtMoney } from '@/utils/format';
import { fmtRangeStr } from '@/utils/dateRange';
import { Segmented } from '@/components/Segmented';

/** Merchant + the totals the parent already shows in its table (so per-period
 *  deposit/exchange in the drawer can be split proportionally and add up to
 *  the same totals the user just clicked through from). */
export type TxnDrawerMerchant = Merchant & { deposit?: number; exchange?: number };

export interface TxnDrawerProps {
  open: boolean;
  merchant: TxnDrawerMerchant | null;
  /** Global filter from MerchantStore. */
  unit: PeriodUnit;
  globalFrom: string;
  globalTo: string;
  globalPreset: string;
  onClose: () => void;
}

const UNIT_OPTIONS: { value: PeriodUnit; label: string }[] = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季' },
];

const UNIT_LABEL: Record<PeriodUnit, string> = { day: '日', week: '周', month: '月', quarter: '季' };

interface PeriodRow {
  range: string;
  deposit: number;
  exchange: number;
  count: number;
}

/** Per-period rows = bucket the merchant's daily count series (same one the
 *  parent table's sparkline + 交易笔数 column derive from), then split the
 *  total deposit/exchange proportionally to each bucket's count share. */
function buildPeriodRows(merchant: TxnDrawerMerchant, unit: PeriodUnit, from: string, to: string): PeriodRow[] {
  const buckets = bucketRanges(unit, from, to);
  const daily = merchantSparklineValues(merchant, from, to);
  const counts = bucketSum(daily, buckets);
  const totalCount = counts.reduce((s, v) => s + v, 0) || 1;
  const totalDeposit = merchant.deposit ?? 0;
  const totalExchange = merchant.exchange ?? 0;
  return buckets.map((b, i) => {
    const count = counts[i];
    const share = count / totalCount;
    return {
      range: b.label,
      count,
      deposit: Math.round(totalDeposit * share),
      exchange: Math.round(totalExchange * share),
    };
  });
}

const PAGE_SIZE = 12;

type SortField = 'range' | 'deposit' | 'exchange' | 'count';
type SortDir = 'asc' | 'desc';

export function TxnDrawer({
  open,
  merchant,
  unit,
  globalFrom,
  globalTo,
  globalPreset,
  onClose,
}: TxnDrawerProps) {
  const [localUnit, setLocalUnit] = useState<PeriodUnit>(unit);
  const [sortField, setSortField] = useState<SortField>('range');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const effectiveUnit = localUnit;
  const rows = useMemo(
    () => (merchant ? buildPeriodRows(merchant, effectiveUnit, globalFrom, globalTo) : []),
    [merchant, effectiveUnit, globalFrom, globalTo]
  );

  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        deposit: acc.deposit + r.deposit,
        exchange: acc.exchange + r.exchange,
        count: acc.count + r.count,
      }),
      { deposit: 0, exchange: 0, count: 0 }
    );
  }, [rows]);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(f);
      setSortDir('desc');
    }
  };
  const sortIcon = (f: SortField) => (sortField !== f ? '↕' : sortDir === 'asc' ? '↑' : '↓');

  const exportCsv = () => {
    if (!merchant) return;
    const headers = ['日期', '充值金额 (USDT)', '换币金额 (USDT)', '交易笔数'];
    const out = sorted.map((r) => [r.range, r.deposit, r.exchange, r.count]);
    downloadCsv(
      `商户明细_${merchant.name}_${UNIT_LABEL[effectiveUnit]}_${globalFrom.replace(/\//g, '-')}_${globalTo.replace(/\//g, '-')}.csv`,
      [headers, ...out]
    );
  };

  if (!merchant) return null;
  const windowLen = windowDays(globalFrom, globalTo);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Stack direction="row" sx={{ p: 5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={3} sx={{ flex: 1 }} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #3C6FF5, #6F8DF9)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {merchant.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
              {merchant.name}
              <Box component="span" sx={{ ml: 1.5, fontSize: 13, fontWeight: 400, color: 'text.secondary' }}>
                {merchant.id}
              </Box>
            </Typography>
            <Stack direction="row" spacing={2} sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }} alignItems="center">
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={12} /> {globalPreset}（{fmtRangeStr(globalFrom, globalTo)}，共 {windowLen} 天）
              </Box>
              <span>·</span>
              <span>
                合计：充值 {fmtMoney(totals.deposit, 0)} · 换币 {fmtMoney(totals.exchange, 0)} · {totals.count.toLocaleString()} 笔
              </span>
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose}>
          <X size={16} />
        </IconButton>
      </Stack>

      <Stack
        direction="row"
        spacing={2.5}
        alignItems="center"
        sx={{ p: 3, px: 5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>周期粒度：</Typography>
        <Segmented<PeriodUnit>
          value={effectiveUnit}
          options={UNIT_OPTIONS}
          onChange={(v) => {
            setLocalUnit(v);
            setPage(1);
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" startIcon={<Download size={13} />} onClick={exportCsv}>
          导出 CSV
        </Button>
      </Stack>

      <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ pl: 5, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('range')}
              >
                日期{' '}
                <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                  {sortIcon('range')}
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('deposit')}
              >
                充值金额 (USDT){' '}
                <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                  {sortIcon('deposit')}
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('exchange')}
              >
                换币金额 (USDT){' '}
                <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                  {sortIcon('exchange')}
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ pr: 5, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('count')}
              >
                交易笔数{' '}
                <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                  {sortIcon('count')}
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((r) => (
              <TableRow key={r.range}>
                <TableCell sx={{ pl: 5, fontFamily: 'var(--font-mono)' }}>{r.range}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {fmtMoney(r.deposit, 0)}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>
                  {fmtMoney(r.exchange, 0)}
                </TableCell>
                <TableCell align="right" sx={{ pr: 5, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {r.count.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ p: 12, textAlign: 'center', color: 'text.secondary' }}>
                  无匹配记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 3, px: 5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}
      >
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          显示 {sorted.length === 0 ? 0 : (curPage - 1) * PAGE_SIZE + 1} –{' '}
          {Math.min(curPage * PAGE_SIZE, sorted.length)} 共 {sorted.length} 条
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
