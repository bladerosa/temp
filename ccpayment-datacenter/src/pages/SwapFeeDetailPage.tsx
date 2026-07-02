import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { useStores } from '@/stores';
import { SWAP_FEE_DETAIL, type SwapFeeDetailRow } from '@/data/swapFee';
import { fmtMoney } from '@/utils/format';
import { fmtRangeStr } from '@/utils/dateRange';
import { downloadCsv } from '@/utils/csv';
import { paths } from '@/routes/paths';

const PAGE_SIZE = 20;

type SortField = 'id' | 'swap' | 'swapCount' | 'swapFee';
type SortDir = 'asc' | 'desc';

const SwapFeeDetailPage = observer(function SwapFeeDetailPage() {
  const { merchant } = useStores();
  const navigate = useNavigate();
  const { globalFrom, globalTo, globalPreset } = merchant;

  const [search, setSearch] = useState('');
  const [tone, setTone] = useState<'all' | 'profit' | 'loss'>('all');
  const [sortField, setSortField] = useState<SortField>('swapFee');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list: SwapFeeDetailRow[] = SWAP_FEE_DETAIL.slice();
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.id.toLowerCase().includes(q));
    if (tone === 'profit') list = list.filter((r) => r.rateDiff > 0);
    else if (tone === 'loss') list = list.filter((r) => r.rateDiff < 0);
    list.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [search, tone, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(f);
      setSortDir('desc');
    }
  };
  const sortIcon = (f: SortField) => (sortField !== f ? '↕' : sortDir === 'asc' ? '↑' : '↓');

  const exportCsv = () => {
    const headers = [
      '商户ID',
      '换币金额 (USD)',
      '换币笔数',
      '用户支付换币服务费用 (USD)',
      '用户支付换币服务费率 (%)',
    ];
    const rows = filtered.map((r) => [
      r.id,
      r.swap,
      r.swapCount,
      r.swapFee,
      r.swapRate,
    ]);
    downloadCsv(
      `换币服务费明细_${globalFrom.replace(/\//g, '-')}_${globalTo.replace(/\//g, '-')}.csv`,
      [headers, ...rows]
    );
  };

  const renderPctCell = (amount: number, rate: number) => (
    <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {fmtMoney(amount, 2)}
      </Box>
      <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: 12 }}>
        ({rate.toFixed(2)}%)
      </Box>
    </Box>
  );

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              component="span"
              onClick={() => navigate(paths.dashboard.merchant)}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                display: 'inline-flex',
                lineHeight: 0,
              }}
            >
              <ArrowLeft size={22} />
            </Box>
            <span>用户支付换币服务费明细</span>
          </Stack>
        }
        action={
          <Button variant="outlined" startIcon={<Download size={14} />} onClick={exportCsv}>
            导出 CSV
          </Button>
        }
      />

      <Card
        sx={{
          p: '10px 14px',
          mb: 4,
          bgcolor: 'rgba(60,111,245,0.04)',
          border: '1px solid rgba(60,111,245,0.18)',
          boxShadow: 'none',
        }}
      >
        <Typography sx={{ fontSize: 13 }}>
          当前筛选区间：
          <Box component="strong" sx={{ color: 'primary.main', mx: 0.5 }}>
            {globalPreset}
          </Box>
          ({fmtRangeStr(globalFrom, globalTo)})
        </Typography>
      </Card>

      <Card sx={{ p: 5 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}
        >
          <TextField
            size="small"
            placeholder="搜索商户ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ width: 220 }}
          />
          <Select
            size="small"
            value={tone}
            onChange={(e) => {
              setTone(e.target.value as 'all' | 'profit' | 'loss');
              setPage(1);
            }}
            sx={{ height: 32, minWidth: 140 }}
          >
            <MenuItem value="all">全部 (顺差 + 逆差)</MenuItem>
            <MenuItem value="profit">仅顺差 (挣钱)</MenuItem>
            <MenuItem value="loss">仅逆差 (亏钱)</MenuItem>
          </Select>
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('id')}>
                  商户ID <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>{sortIcon('id')}</Box>
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('swap')}>
                  换币金额 (USD) <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>{sortIcon('swap')}</Box>
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('swapCount')}>
                  换币笔数 <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>{sortIcon('swapCount')}</Box>
                </TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('swapFee')}>
                  用户支付换币服务费用 <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>{sortIcon('swapFee')}</Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontFamily: 'var(--font-mono)', color: 'primary.main' }}>
                    {r.id}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {fmtMoney(r.swap, 2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {r.swapCount.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{renderPctCell(r.swapFee, r.swapRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        {pageRows.length === 0 && <EmptyState title="无匹配记录" desc="请调整筛选条件后重试" />}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            显示 {filtered.length === 0 ? 0 : (curPage - 1) * PAGE_SIZE + 1} –{' '}
            {Math.min(curPage * PAGE_SIZE, filtered.length)} 共 {filtered.length} 条
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
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
                  '&:hover': n === curPage ? {} : { bgcolor: 'grey.100' },
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
      </Card>
    </Container>
  );
});

export default SwapFeeDetailPage;
