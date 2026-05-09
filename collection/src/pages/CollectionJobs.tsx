import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowDownwardRounded,
  BoltOutlined,
  CloseRounded,
  ContentCopyRounded,
  ErrorOutlineRounded,
  LayersOutlined,
  ScaleOutlined,
  SearchRounded,
  TollOutlined,
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
import { fmtDateTime, fmtTokenAmount, numFmt, usd } from '@/utils/format';

const TRIGGER_LABEL: Record<RecordTrigger, { name: string; color: 'primary' | 'info' | 'success' | 'warning' | 'default' }> = {
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

type SortKey = 'occurredAt' | 'addressCount' | 'totalAmount' | 'totalUsd' | 'feeUsd';
type SortState = { key: SortKey; dir: 'asc' | 'desc' } | null;

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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (chainFilter !== 'all' && r.chainId !== chainFilter) return false;
        if (tokenFilter !== 'all' && r.tokenId !== tokenFilter) return false;
        if (triggerFilter !== 'all' && r.trigger !== triggerFilter) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const haystack = [
            r.triggerName ?? '',
            r.id,
            ...(r.addresses ?? []).map((a) => a.address),
            ...(r.txHashes ?? []),
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
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
      }
    };
    return [...filtered].sort((a, b) => (valueOf(a) - valueOf(b)) * dir);
  }, [filtered, sort]);

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage],
  );

  // Reset to page 1 whenever filter inputs change.
  useEffect(() => {
    setPage(0);
  }, [chainFilter, tokenFilter, triggerFilter, statusFilter, search]);

  // ===== Stats: 24h aggregates and counts by status =====
  const stats = useMemo(() => {
    const now = Date.now();
    const last24 = records.filter((r) => now - Date.parse(r.occurredAt) <= 24 * 3600 * 1000);
    const sumIf = (xs: CollectionRecord[], pick: (r: CollectionRecord) => number) =>
      xs.reduce((s, r) => s + pick(r), 0);
    return {
      pending: records.filter((r) => r.status === 'pending').length,
      running: records.filter((r) => r.status === 'running').length,
      completed: records.filter((r) => r.status === 'completed').length,
      aborted: records.filter((r) => r.status === 'aborted').length,
      totalUsd24: sumIf(last24, (r) => r.totalUsd ?? 0),
      gas24: sumIf(last24, (r) => r.feeUsd),
      trxEnergy24: sumIf(last24, (r) => (isTrxChain(r.chainId) ? r.energy ?? 0 : 0)),
    };
  }, [records]);

  const doAbort = async (r: CollectionRecord) => {
    const reason =
      r.status === 'pending'
        ? '运营人员手动终止；任务尚未开始执行，未发生归集'
        : '运营人员手动终止；任务执行中断';
    try {
      await collection.abortJob(r.id, reason);
      toast.show({ title: `任务 ${r.id} 已终止`, tone: 'info' });
    } catch {
      toast.show({ title: '终止失败，请重试', tone: 'error' });
    }
    setConfirmAbort(null);
  };

  return (
    <Container maxWidth={ui.themeStretch ? false : 'xl'} disableGutters>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            归集任务
          </Typography>
          <Typography variant="body2" color="text.secondary">
            汇总自动 / 手动归集任务，每条 token
            级原子归集独立成行；可对待执行 / 执行中任务进行终止。
          </Typography>
        </Box>

        {/* ===== 7 stat cards strip ===== */}
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard label="待执行" value={stats.pending} tone="default" icon={<LayersOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard label="执行中" value={stats.running} tone="info" icon={<ScaleOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard label="已完成" value={stats.completed} tone="success" icon={<ScaleOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard label="已终止" value={stats.aborted} tone="error" icon={<CloseRounded />} />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard
              label="24h 总归集 USD"
              value={usd(stats.totalUsd24)}
              tone="primary"
              icon={<ScaleOutlined />}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard label="24h gas" value={usd(stats.gas24)} tone="warning" icon={<TollOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg>
            <StatCard
              label="TRX 能量消耗"
              value={numFmt(stats.trxEnergy24, 0)}
              tone="info"
              icon={<BoltOutlined />}
            />
          </Grid>
        </Grid>

        {/* ===== Table ===== */}
        <Card sx={{ overflow: 'hidden' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={2}
            alignItems={{ md: 'center' }}
            sx={{ p: 4, borderBottom: 1, borderColor: 'divider' }}
          >
            <TextField
              size="small"
              placeholder="搜索任务、地址、tx"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | JobStatus)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">全部状态</MenuItem>
              {(Object.keys(JOB_STATUS_META) as JobStatus[]).map((k) => (
                <MenuItem key={k} value={k}>
                  {JOB_STATUS_META[k].name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={chainFilter}
              onChange={(e) => {
                setChainFilter(e.target.value);
                setTokenFilter('all');
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">全部 chain</MenuItem>
              {CHAINS.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">全部 token</MenuItem>
              {(chainFilter === 'all' ? TOKENS : tokensByChain(chainFilter)).map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {findChain(t.chainId)?.name} · {t.symbol}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value as 'all' | RecordTrigger)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">全部触发方式</MenuItem>
              {(Object.keys(TRIGGER_LABEL) as RecordTrigger[]).map((k) => (
                <MenuItem key={k} value={k}>
                  {TRIGGER_LABEL[k].name}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">
              共 {filtered.length} 条
            </Typography>
          </Stack>

          {filtered.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                icon={<LayersOutlined sx={{ fontSize: 36 }} />}
                title="暂无任务记录"
                desc="调整筛选条件后再试。"
              />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 170 }}>
                        <SortHeader
                          active={sort?.key === 'occurredAt'}
                          dir={sort?.key === 'occurredAt' ? sort.dir : null}
                          onClick={() => cycleSort('occurredAt')}
                        >
                          时间
                        </SortHeader>
                      </TableCell>
                      <TableCell>触发</TableCell>
                      <TableCell>chain · token</TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'addressCount'}
                          dir={sort?.key === 'addressCount' ? sort.dir : null}
                          onClick={() => cycleSort('addressCount')}
                          align="right"
                        >
                          地址数
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'totalUsd'}
                          dir={sort?.key === 'totalUsd' ? sort.dir : null}
                          onClick={() => cycleSort('totalUsd')}
                          align="right"
                        >
                          总归集 USD
                        </SortHeader>
                      </TableCell>
                      <TableCell align="right">
                        <SortHeader
                          active={sort?.key === 'totalAmount'}
                          dir={sort?.key === 'totalAmount' ? sort.dir : null}
                          onClick={() => cycleSort('totalAmount')}
                          align="right"
                        >
                          总归集数量
                        </SortHeader>
                      </TableCell>
                      <TableCell sx={{ width: 100 }}>状态</TableCell>
                      <TableCell align="right" sx={{ width: 120 }}>
                        操作
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((r) => {
                      const c = findChain(r.chainId);
                      const t = findToken(r.tokenId);
                      const canAbort = r.status === 'pending' || r.status === 'running';
                      return (
                        <TableRow key={r.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {fmtDateTime(r.occurredAt)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={TRIGGER_LABEL[r.trigger].color}
                              label={TRIGGER_LABEL[r.trigger].name}
                            />
                            {r.triggerName && r.trigger !== 'manual' && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {r.triggerName}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1}>
                              {c && (
                                <>
                                  <CryptoBadge symbol={c.id} color={c.color} size={20} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {c.name}
                                  </Typography>
                                </>
                              )}
                              {t && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    ·
                                  </Typography>
                                  <CryptoBadge symbol={t.symbol} color={t.color} size={20} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {t.symbol}
                                  </Typography>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            {r.addresses.length > 0 ? (
                              <Box
                                component="button"
                                type="button"
                                onClick={() => setDetail(r)}
                                sx={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  p: 0,
                                  '&:hover': { textDecoration: 'underline' },
                                }}
                              >
                                {r.addresses.length}
                              </Box>
                            ) : (
                              <Typography component="span" color="text.disabled">
                                0
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {r.totalUsd != null ? (
                              usd(r.totalUsd)
                            ) : (
                              <Typography component="span" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">{fmtTokenAmount(r.totalAmount)}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={STATUS_COLOR[r.status]}
                              label={JOB_STATUS_META[r.status].name}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {canAbort ? (
                              <Button
                                size="small"
                                color="error"
                                variant="text"
                                onClick={() => setConfirmAbort(r)}
                                startIcon={<CloseRounded sx={{ fontSize: 14 }} />}
                              >
                                终止任务
                              </Button>
                            ) : (
                              <Typography component="span" color="text.disabled">
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
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage="每页"
                labelDisplayedRows={({ from, to, count }) => `第 ${from}–${to} 条 / 共 ${count} 条`}
              />
            </>
          )}
        </Card>
      </Stack>

      {/* ===== Address detail modal ===== */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} fullWidth maxWidth="md">
        {detail &&
          (() => {
            const t = findToken(detail.tokenId);
            const c = findChain(detail.chainId);
            return (
              <>
                <DialogTitle>归集地址明细</DialogTitle>
                <DialogContent dividers>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={2}
                    flexWrap="wrap"
                    sx={{ mb: 3 }}
                  >
                    <Chip
                      size="small"
                      color={TRIGGER_LABEL[detail.trigger].color}
                      label={TRIGGER_LABEL[detail.trigger].name}
                    />
                    {c && (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<CryptoBadge symbol={c.id} color={c.color} size={16} />}
                        label={c.name}
                      />
                    )}
                    {t && (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<CryptoBadge symbol={t.symbol} color={t.color} size={16} />}
                        label={t.symbol}
                      />
                    )}
                    <Box sx={{ flex: 1 }} />
                    <Chip
                      size="small"
                      color={STATUS_COLOR[detail.status]}
                      label={JOB_STATUS_META[detail.status].name}
                    />
                  </Stack>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <StatCard
                        label="总 USD"
                        value={detail.totalUsd != null ? usd(detail.totalUsd) : '—'}
                        tone="success"
                        icon={<ScaleOutlined />}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        label="总数量"
                        value={fmtTokenAmount(detail.totalAmount)}
                        tone="primary"
                        icon={<LayersOutlined />}
                      />
                    </Grid>
                  </Grid>

                  {detail.status === 'aborted' && detail.abortedReason && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <b>任务已终止</b>
                      {detail.abortedAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {fmtDateTime(detail.abortedAt)}
                        </Typography>
                      )}
                      <Box sx={{ mt: 0.5 }}>{detail.abortedReason}</Box>
                    </Alert>
                  )}

                  <Stack spacing={1}>
                    {detail.addresses.map((a, i) => (
                      <Box
                        key={`${a.address}-${i}`}
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
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {usd(a.amountUsd)}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {fmtTokenAmount(a.amount)} {t?.symbol}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 18, color: 'text.secondary', display: 'flex' }}>
                          {a.isAbnormal ? (
                            <ErrorOutlineRounded sx={{ fontSize: 18, color: 'error.main' }} />
                          ) : (
                            <ArrowDownwardRounded sx={{ fontSize: 18, color: 'success.main' }} />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          title="复制地址"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(a.address);
                              toast.show({
                                title: '地址已复制到剪贴板',
                                tone: 'success',
                                duration: 3000,
                              });
                            } catch {
                              toast.show({ title: '复制失败，请手动选择地址', tone: 'error' });
                            }
                          }}
                        >
                          <ContentCopyRounded sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {detail.addresses.length === 0 && (
                      <EmptyState
                        icon={<LayersOutlined sx={{ fontSize: 36 }} />}
                        title="尚无地址"
                        desc="该任务尚未开始执行"
                      />
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions>
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
        title="终止归集任务"
        confirmText="确认终止"
        tone="error"
        dismissable={false}
        onClose={() => setConfirmAbort(null)}
        onConfirm={() => confirmAbort && doAbort(confirmAbort)}
        body={
          <Alert severity="warning">
            将终止任务 <b>{confirmAbort?.id}</b>（
            <b>
              {findChain(confirmAbort?.chainId ?? '')?.name} ·{' '}
              {findToken(confirmAbort?.tokenId ?? '')?.symbol}
            </b>
            ）。
            {confirmAbort?.status === 'running'
              ? ' 任务执行中可能已对部分地址完成归集，这部分统计信息会保留。'
              : ' 任务尚未开始执行，终止后不会发生归集。'}
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

// ============ Stat card ============
function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'default';
  icon?: React.ReactNode;
}) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Box
          sx={{
            color:
              tone === 'default' ? 'text.secondary' : `${tone}.main`,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Card>
  );
}

export default CollectionJobs;
