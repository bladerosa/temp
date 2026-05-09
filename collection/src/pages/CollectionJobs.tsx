import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  ChevronRightRounded,
  CloseRounded,
  ContentCopyOutlined,
  LayersOutlined,
  SearchRounded,
} from '@mui/icons-material';
import {
  JOB_STATUS_META,
  type CollectionRecord,
  type JobStatus,
  type RecordTrigger,
} from '@/data/types';
import { CHAINS, TOKENS, findChain, findToken, isTrxChain, tokensByChain } from '@/data/tokens';
import { useStores } from '@/stores';
import CryptoBadge from '@/components/CryptoBadge';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { TableCard, TableToolbar, TableFooter } from '@/components/TableCard';
import TablePager from '@/components/TablePager';
import { fmtDateTime, fmtTokenAmount, numFmt, usd } from '@/utils/format';

const TRIGGER_LABEL: Record<
  RecordTrigger,
  { name: string; color: 'primary' | 'info' | 'success' | 'warning' | 'default' }
> = {
  auto_large_deposit: { name: '自动 · 大额充值检测', color: 'primary' },
  auto_inactive: { name: '自动 · 地址未活跃', color: 'info' },
  auto_balance_check: { name: '自动 · 地址余额检测', color: 'success' },
  auto_withdraw_short: { name: '自动 · 提现不足触发', color: 'warning' },
  manual: { name: '手动归集', color: 'default' },
};

const STATUS_COLOR: Record<JobStatus, 'default' | 'info' | 'success' | 'error'> = {
  pending: 'default',
  running: 'info',
  completed: 'success',
  aborted: 'error',
};

const STATUS_DOT_COLOR: Record<JobStatus, string> = {
  pending: '#71757E',
  running: '#3767A3',
  completed: '#218861',
  aborted: '#A92926',
};

type SortKey =
  | 'occurredAt'
  | 'addressCount'
  | 'totalAmount'
  | 'totalUsd'
  | 'feeUsd'
  | 'trx'
  | 'energy'
  | 'bandwidth';
type SortState = { key: SortKey; dir: 'asc' | 'desc' } | null;

const PAGE_SIZE = 20;
const ADDR_PAGE_SIZE = 10;

const CollectionJobs = observer(function CollectionJobs() {
  const { collection, ui, toast } = useStores();
  const records = collection.jobs;

  const [chainFilter, setChainFilter] = useState<'all' | string>('all');
  const [tokenFilter, setTokenFilter] = useState<'all' | string>('all');
  const [triggerFilter, setTriggerFilter] = useState<'all' | RecordTrigger>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<CollectionRecord | null>(null);
  const [confirmAbort, setConfirmAbort] = useState<CollectionRecord | null>(null);

  const [sort, setSort] = useState<SortState>({ key: 'occurredAt', dir: 'desc' });
  const cycleSort = (key: SortKey) => {
    setSort((cur) => {
      if (!cur || cur.key !== key) return { key, dir: 'desc' };
      if (cur.dir === 'desc') return { key, dir: 'asc' };
      return null;
    });
  };

  // ===== pagination — task list (1-based, fixed page size) =====
  const [page, setPage] = useState(1);

  // ===== pagination — detail modal address list =====
  const [addrPage, setAddrPage] = useState(1);
  useEffect(() => {
    setAddrPage(1);
  }, [detail?.id]);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (chainFilter !== 'all' && r.chainId !== chainFilter) return false;
        if (tokenFilter !== 'all' && r.tokenId !== tokenFilter) return false;
        if (triggerFilter !== 'all' && r.trigger !== triggerFilter) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          // Match against triggerName ONLY (per PRD §4.3.3 F10#3).
          if (!(r.triggerName ?? '').toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [records, chainFilter, tokenFilter, triggerFilter, statusFilter, search],
  );

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const valueOf = (r: CollectionRecord): number => {
      switch (sort.key) {
        case 'occurredAt':
          return Date.parse(r.occurredAt);
        case 'addressCount':
          return r.addresses.length;
        case 'totalAmount':
          return Number(r.totalAmount) || 0;
        case 'totalUsd':
          return r.totalUsd ?? -Infinity;
        case 'feeUsd':
          return r.feeUsd;
        case 'trx':
          return isTrxChain(r.chainId) ? r.trxConsumed ?? 0 : -Infinity;
        case 'energy':
          return isTrxChain(r.chainId) ? r.energy ?? 0 : -Infinity;
        case 'bandwidth':
          return isTrxChain(r.chainId) ? r.bandwidth ?? 0 : -Infinity;
      }
    };
    return [...filtered].sort((a, b) => (valueOf(a) - valueOf(b)) * dir);
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE),
    [sorted, page],
  );

  // Reset to page 1 whenever any filter input changes.
  useEffect(() => {
    setPage(1);
  }, [chainFilter, tokenFilter, triggerFilter, statusFilter, search]);

  // ===== Stats over filtered set (per PRD §4.3.1 + AC-010) =====
  const stats = useMemo(
    () => ({
      count: filtered.length,
      totalUsd: filtered.reduce((s, r) => s + (r.totalUsd ?? 0), 0),
      addresses: filtered.reduce((s, r) => s + r.addresses.length, 0),
      fee: filtered.reduce((s, r) => s + r.feeUsd, 0),
      energy: filtered.reduce(
        (s, r) => s + (isTrxChain(r.chainId) ? r.energy ?? 0 : 0),
        0,
      ),
      bandwidth: filtered.reduce(
        (s, r) => s + (isTrxChain(r.chainId) ? r.bandwidth ?? 0 : 0),
        0,
      ),
      trx: filtered.reduce(
        (s, r) => s + (isTrxChain(r.chainId) ? r.trxConsumed ?? 0 : 0),
        0,
      ),
    }),
    [filtered],
  );

  const doAbort = async (r: CollectionRecord) => {
    // AC-008 dictates the exact reason string: "运营人员手动终止" (both pending & running).
    const reason = '运营人员手动终止';
    try {
      await collection.abortJob(r.id, reason);
      toast.show({ title: '任务已终止', tone: 'success', duration: 3000 });
    } catch {
      toast.show({ title: '终止失败，请重试', tone: 'error' });
    }
    setConfirmAbort(null);
  };

  return (
    <Container maxWidth={ui.themeStretch ? false : 'xl'} disableGutters>
      <Stack spacing={4}>
        <PageHeader
          crumbs={[{ label: '归集系统' }, { label: '归集任务' }]}
          title="归集任务"
          subtitle="汇总自动 / 手动归集任务，每条 token 级原子归集独立成行；可对待执行 / 执行中任务进行终止。"
        />

        {/* ===== Strip 1: 4 KPI cards over filtered results ===== */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 5,
          }}
        >
          <StatCard tone="accent" label="任务数" value={stats.count} />
          <StatCard label="归集总额" value={usd(stats.totalUsd)} />
          <StatCard label="覆盖地址数" value={stats.addresses} />
          <StatCard label="fee 消耗" value={usd(stats.fee)} />
        </Box>

        {/* ===== Strip 2: 3 TRX-only cards ===== */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 5,
          }}
        >
          <StatCard label="能量消耗" value={numFmt(stats.energy, 0)} />
          <StatCard label="带宽消耗" value={numFmt(stats.bandwidth, 0)} />
          <StatCard label="trx 消耗" value={`${numFmt(stats.trx, 2)} TRX`} />
        </Box>

        {/* ===== Table ===== */}
        <TableCard>
          <TableToolbar
            left={
              <>
                <TextField
                  size="small"
                  placeholder="搜索任务名"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 240 }}
                />
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | JobStatus)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">全部状态</MenuItem>
                  {(Object.keys(JOB_STATUS_META) as JobStatus[]).map((k) => (
                    <MenuItem key={k} value={k}>
                      {JOB_STATUS_META[k].name}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  size="small"
                  value={chainFilter}
                  onChange={(e) => {
                    setChainFilter(e.target.value);
                    setTokenFilter('all');
                  }}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">全部 chain</MenuItem>
                  {CHAINS.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  size="small"
                  value={tokenFilter}
                  onChange={(e) => setTokenFilter(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">全部 token</MenuItem>
                  {(chainFilter === 'all' ? TOKENS : tokensByChain(chainFilter)).map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {findChain(t.chainId)?.name} · {t.symbol}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  size="small"
                  value={triggerFilter}
                  onChange={(e) => setTriggerFilter(e.target.value as 'all' | RecordTrigger)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">全部触发方式</MenuItem>
                  {(Object.keys(TRIGGER_LABEL) as RecordTrigger[]).map((k) => (
                    <MenuItem key={k} value={k}>
                      {TRIGGER_LABEL[k].name}
                    </MenuItem>
                  ))}
                </Select>
              </>
            }
            right={
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                共 {filtered.length} 条
              </Typography>
            }
          />

          {filtered.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                icon={<LayersOutlined />}
                title="暂无任务记录"
                desc="调整筛选条件后再试。"
              />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 170 }}>
                        <SortHeader
                          active={sort?.key === 'occurredAt'}
                          dir={sort?.key === 'occurredAt' ? sort.dir : null}
                          onClick={() => cycleSort('occurredAt')}
                        >
                          归集发生时间
                        </SortHeader>
                      </TableCell>
                      <TableCell>触发方式</TableCell>
                      <TableCell>chain</TableCell>
                      <TableCell>token</TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'addressCount'}
                          dir={sort?.key === 'addressCount' ? sort.dir : null}
                          onClick={() => cycleSort('addressCount')}
                          align="right"
                        >
                          归集地址数
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'totalAmount'}
                          dir={sort?.key === 'totalAmount' ? sort.dir : null}
                          onClick={() => cycleSort('totalAmount')}
                          align="right"
                        >
                          归集总数量
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'totalUsd'}
                          dir={sort?.key === 'totalUsd' ? sort.dir : null}
                          onClick={() => cycleSort('totalUsd')}
                          align="right"
                        >
                          归集总金额（USD）
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'feeUsd'}
                          dir={sort?.key === 'feeUsd' ? sort.dir : null}
                          onClick={() => cycleSort('feeUsd')}
                          align="right"
                        >
                          fee 消耗（USD）
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'trx'}
                          dir={sort?.key === 'trx' ? sort.dir : null}
                          onClick={() => cycleSort('trx')}
                          align="right"
                        >
                          trx 消耗（TRX）
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'energy'}
                          dir={sort?.key === 'energy' ? sort.dir : null}
                          onClick={() => cycleSort('energy')}
                          align="right"
                        >
                          能量消耗
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'bandwidth'}
                          dir={sort?.key === 'bandwidth' ? sort.dir : null}
                          onClick={() => cycleSort('bandwidth')}
                          align="right"
                        >
                          带宽消耗
                        </SortHeader>
                      </TableCell>
                      <TableCell sx={{ width: 110 }}>任务状态</TableCell>
                      <TableCell align="right" sx={{ width: 130 }}>
                        操作
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((r) => {
                      const c = findChain(r.chainId);
                      const t = findToken(r.tokenId);
                      const canAbort = r.status === 'pending' || r.status === 'running';
                      const trxRow = isTrxChain(r.chainId);
                      return (
                        <TableRow key={r.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {fmtDateTime(r.occurredAt)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={TRIGGER_LABEL[r.trigger].color}
                              label={
                                <Box
                                  component="span"
                                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: '50%',
                                      bgcolor: 'currentColor',
                                      display: 'inline-block',
                                      opacity: 0.9,
                                    }}
                                  />
                                  {TRIGGER_LABEL[r.trigger].name}
                                </Box>
                              }
                            />
                            {r.triggerName && r.trigger !== 'manual' && (
                              <Typography
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
                              >
                                {r.triggerName}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {c && (
                              <Stack direction="row" alignItems="center" gap={1}>
                                <CryptoBadge symbol={c.id} color={c.color} size={22} />
                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                  {c.name}
                                </Typography>
                              </Stack>
                            )}
                          </TableCell>
                          <TableCell>
                            {t && (
                              <Stack direction="row" alignItems="center" gap={1}>
                                <CryptoBadge symbol={t.symbol} color={t.color} size={22} />
                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                  {t.symbol}
                                </Typography>
                              </Stack>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ p: 0 }}>
                            {r.addresses.length > 0 ? (
                              <Box
                                component="button"
                                type="button"
                                onClick={() => setDetail(r)}
                                title="查看归集地址明细"
                                sx={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 2,
                                  py: 1.25,
                                  borderRadius: 1,
                                  transition: 'background-color 120ms ease-out',
                                  '&:hover': {
                                    bgcolor: 'rgba(60,111,245,0.08)',
                                  },
                                }}
                              >
                                {r.addresses.length}
                                <ChevronRightRounded sx={{ fontSize: 12 }} />
                              </Box>
                            ) : (
                              <Typography
                                component="span"
                                color="text.disabled"
                                sx={{ pr: 2 }}
                              >
                                0
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontFamily: 'Roboto Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {fmtTokenAmount(r.totalAmount)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {r.totalUsd != null ? (
                              usd(r.totalUsd)
                            ) : (
                              <Typography component="span" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {usd(r.feeUsd)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {trxRow ? (
                              numFmt(r.trxConsumed ?? 0, 2)
                            ) : (
                              <Typography component="span" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {trxRow ? (
                              (r.energy ?? 0).toLocaleString()
                            ) : (
                              <Typography component="span" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {trxRow ? (
                              (r.bandwidth ?? 0).toLocaleString()
                            ) : (
                              <Typography component="span" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={STATUS_COLOR[r.status]}
                              label={
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: '50%',
                                      bgcolor: STATUS_DOT_COLOR[r.status],
                                      display: 'inline-block',
                                    }}
                                  />
                                  {JOB_STATUS_META[r.status].name}
                                </Box>
                              }
                              sx={
                                r.status === 'running'
                                  ? {
                                      animation: 'jpulse 1.6s ease-in-out infinite',
                                      '@keyframes jpulse': {
                                        '0%,100%': { opacity: 1 },
                                        '50%': { opacity: 0.55 },
                                      },
                                    }
                                  : undefined
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {canAbort ? (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => setConfirmAbort(r)}
                                startIcon={<CloseRounded sx={{ fontSize: 14 }} />}
                                sx={{ color: 'error.dark' }}
                              >
                                终止任务
                              </Button>
                            ) : (
                              <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>
                                —
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TableFooter>
                <TablePager
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </TableFooter>
            </>
          )}
        </TableCard>
      </Stack>

      {/* ===== Address detail modal ===== */}
      <Dialog
        open={!!detail}
        onClose={() => setDetail(null)}
        PaperProps={{ sx: { width: 720, maxWidth: 'calc(100vw - 32px)' } }}
      >
        {detail &&
          (() => {
            const t = findToken(detail.tokenId);
            const c = findChain(detail.chainId);
            const trx = isTrxChain(detail.chainId);
            const totalAddrPages = Math.max(1, Math.ceil(detail.addresses.length / ADDR_PAGE_SIZE));
            const slice = detail.addresses.slice(
              (addrPage - 1) * ADDR_PAGE_SIZE,
              (addrPage - 1) * ADDR_PAGE_SIZE + ADDR_PAGE_SIZE,
            );
            return (
              <>
                <DialogTitle
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <span>归集地址明细</span>
                  <IconButton onClick={() => setDetail(null)} aria-label="关闭" size="small">
                    <CloseRounded />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={2}
                    flexWrap="wrap"
                    sx={{ mb: 3 }}
                  >
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                      {t && c && (
                        <>
                          <CryptoBadge symbol={t.symbol} color={t.color} size={36} />
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                              {c.name} · {t.symbol}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: 12 }}
                            >
                              记录 {detail.id} · {fmtDateTime(detail.occurredAt)}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                    <Box sx={{ flex: 1 }} />
                    <Chip
                      size="small"
                      color={TRIGGER_LABEL[detail.trigger].color}
                      label={TRIGGER_LABEL[detail.trigger].name}
                    />
                    <Chip
                      size="small"
                      color={STATUS_COLOR[detail.status]}
                      label={JOB_STATUS_META[detail.status].name}
                    />
                  </Stack>

                  {detail.status === 'aborted' && detail.abortedReason && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <b>任务已终止</b>
                      {detail.abortedAt && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1, fontSize: 11.5 }}
                        >
                          {fmtDateTime(detail.abortedAt)}
                        </Typography>
                      )}
                      <Box sx={{ mt: 0.5 }}>{detail.abortedReason}</Box>
                    </Alert>
                  )}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <StatCard label="覆盖地址数" value={detail.addresses.length} />
                    <StatCard label="归集总数量" value={fmtTokenAmount(detail.totalAmount)} />
                    <StatCard
                      label="归集总额（USD）"
                      value={detail.totalUsd != null ? usd(detail.totalUsd) : '—'}
                    />
                    <StatCard label="fee 消耗（USD）" value={usd(detail.feeUsd)} />
                  </Box>

                  {trx && (
                    <Stack direction="row" gap={2} sx={{ mb: 3 }} flexWrap="wrap">
                      <Chip
                        size="small"
                        color="primary"
                        label={`能量 ${(detail.energy ?? 0).toLocaleString()}`}
                      />
                      <Chip
                        size="small"
                        color="info"
                        label={`带宽 ${(detail.bandwidth ?? 0).toLocaleString()}`}
                      />
                      <Chip
                        size="small"
                        color="warning"
                        label={`trx ${(detail.trxConsumed ?? 0).toFixed(2)}`}
                      />
                    </Stack>
                  )}

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    地址清单
                  </Typography>
                  <Stack spacing={1}>
                    {slice.map((a, i) => (
                      <Box
                        key={`${a.address}-${(addrPage - 1) * ADDR_PAGE_SIZE + i}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 1.5,
                          px: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: 12,
                              wordBreak: 'break-all',
                            }}
                          >
                            {a.address}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          {a.amountUsd != null && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: 11.5 }}
                            >
                              {usd(a.amountUsd)}
                            </Typography>
                          )}
                          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                            {fmtTokenAmount(a.amount)}{' '}
                            <Typography
                              component="span"
                              color="text.secondary"
                              sx={{ fontWeight: 500, fontSize: 12 }}
                            >
                              {t?.symbol}
                            </Typography>
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          title="复制地址"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(a.address);
                              toast.show({
                                title: '地址已复制',
                                tone: 'success',
                                duration: 3000,
                              });
                            } catch {
                              toast.show({
                                title: '复制失败，请手动选择地址',
                                tone: 'error',
                              });
                            }
                          }}
                        >
                          <ContentCopyOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {detail.addresses.length === 0 && (
                      <EmptyState
                        icon={<LayersOutlined />}
                        title="尚无地址"
                        desc="该任务尚未开始执行"
                      />
                    )}
                  </Stack>
                  {detail.addresses.length > ADDR_PAGE_SIZE && (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                      sx={{ mt: 2 }}
                    >
                      <Button
                        size="small"
                        variant="text"
                        disabled={addrPage <= 1}
                        onClick={() => setAddrPage((p) => Math.max(1, p - 1))}
                      >
                        上一页
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        第 {addrPage} / {totalAddrPages} 页
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        disabled={addrPage >= totalAddrPages}
                        onClick={() => setAddrPage((p) => Math.min(totalAddrPages, p + 1))}
                      >
                        下一页
                      </Button>
                    </Stack>
                  )}
                </DialogContent>
                <DialogActions>
                  <Box sx={{ flex: 1 }} />
                  <Button onClick={() => setDetail(null)} color="inherit">
                    关闭
                  </Button>
                </DialogActions>
              </>
            );
          })()}
      </Dialog>

      {/* ===== Abort confirm ===== */}
      <ConfirmDialog
        open={!!confirmAbort}
        title="确认终止任务"
        confirmText="终止"
        tone="error"
        dismissable={false}
        onClose={() => setConfirmAbort(null)}
        onConfirm={() => confirmAbort && doAbort(confirmAbort)}
        body={
          <Alert severity="warning">
            {confirmAbort?.status === 'running'
              ? '该任务正在执行，可能已对部分地址完成归集，这部分统计信息会保留。'
              : '该任务尚未开始执行，终止后不会发生归集。'}
          </Alert>
        }
      />
    </Container>
  );
});

// ============ Sortable column header ============
function SortHeader({
  children,
  active,
  dir,
  onClick,
  align,
}: {
  children: React.ReactNode;
  active: boolean;
  dir: 'asc' | 'desc' | null;
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  return (
    <TableSortLabel
      active={active}
      direction={active && dir ? dir : 'asc'}
      onClick={onClick}
      sx={{
        flexDirection: align === 'right' ? 'row-reverse' : 'row',
        '&.Mui-active .MuiTableSortLabel-icon': { color: 'primary.main' },
      }}
    >
      {children}
    </TableSortLabel>
  );
}

export default CollectionJobs;
