import { useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { PlayArrowRounded, SearchRounded, ShieldOutlined } from '@mui/icons-material';
import { findChain, findToken, isConvertible } from '@/data/tokens';
import { collectionApi } from '@/api/collection';
import type { UncollectedAddress, UncollectedQueryResult } from '@/data/mockData';
import { SingleTokenPicker } from '@/components/TokenPicker';
import CryptoBadge from '@/components/CryptoBadge';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { TOKEN_AMOUNT_STEP, fmtDateTime, fmtTokenAmount, usd } from '@/utils/format';
import { useStores } from '@/stores';

type Phase = 'idle' | 'queried' | 'submitting';

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

const meets = (a: UncollectedAddress, conv: boolean, minUsd: number, minAmount: number) =>
  conv ? (a.amountUsd ?? 0) >= minUsd : Number(a.amount) >= minAmount;

// =============================================================================
// Manual Collection — v1.1: abnormal-address table is READ-ONLY (no checkbox).
// Submit ALWAYS targets the "normal" set passing the threshold.
// =============================================================================

const ManualCollection = observer(function ManualCollection() {
  const { ui, toast } = useStores();
  const [chainId, setChainId] = useState('TRX');
  const [tokenId, setTokenId] = useState('TRX:USDT');

  const [minUsd, setMinUsd] = useState<number>(50);
  const [minAmount, setMinAmount] = useState<number>(50);

  const [phase, setPhase] = useState<Phase>('idle');
  const [query, setQuery] = useState<UncollectedQueryResult | null>(null);
  const [querying, setQuerying] = useState(false);

  const [confirm, setConfirm] = useState(false);
  const step2Ref = useRef<HTMLDivElement | null>(null);

  const chain = findChain(chainId);
  const token = findToken(tokenId);
  const conv = isConvertible(tokenId);
  const tokenSymbol = token?.symbol ?? '';

  const updateChainToken = (c: string, t: string) => {
    setChainId(c);
    setTokenId(t);
    setQuery(null);
    setPhase('idle');
  };

  const runQuery = async () => {
    if (!token) return;
    setQuerying(true);
    setQuery(null);
    try {
      const result = await collectionApi.queryUncollected(chainId, tokenId);
      setQuery(result);
      setPhase('queried');
      requestAnimationFrame(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } finally {
      setQuerying(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return null;
    const passing = query.addresses.filter((a) => meets(a, conv, minUsd, minAmount));
    const normal = passing.filter((a) => !a.isAbnormal);
    const abnormal = passing.filter((a) => a.isAbnormal);

    const sumAmt = (xs: UncollectedAddress[]) =>
      xs.reduce((s, x) => s + Number(x.amount || 0), 0);
    const sumUsd = (xs: UncollectedAddress[]) =>
      xs.reduce((s, x) => s + (x.amountUsd ?? 0), 0);
    const total = passing.length;

    return {
      total,
      normal,
      abnormal,
      totalAmount: sumAmt(passing),
      totalUsd: conv ? sumUsd(passing) : undefined,
      normalAmount: sumAmt(normal),
      normalUsd: conv ? sumUsd(normal) : undefined,
      normalRatio: total > 0 ? normal.length / total : 0,
      abnormalAmount: sumAmt(abnormal),
      abnormalUsd: conv ? sumUsd(abnormal) : undefined,
      abnormalRatio: total > 0 ? abnormal.length / total : 0,
      hiddenAbnormalCount: query.addresses.filter(
        (a) => a.isAbnormal && !meets(a, conv, minUsd, minAmount),
      ).length,
    };
  }, [query, conv, minUsd, minAmount]);

  const resetAfterSubmit = () => {
    setQuery(null);
    setPhase('idle');
  };

  const start = async () => {
    if (!filtered) return;
    setConfirm(false);
    setPhase('submitting');
    try {
      await collectionApi.submitManualCollection({
        chainId,
        tokenId,
        minAmount: conv ? minUsd : minAmount,
        convertible: conv,
      });
      toast.show({
        title: '该次手动归集任务已提交',
        desc: '请在「归集任务」模块跟踪查询执行结果。',
        tone: 'success',
      });
      resetAfterSubmit();
    } catch (err) {
      toast.show({ title: '提交失败，请稍后重试', tone: 'error' });
      setPhase('queried');
    }
  };

  const minInputValid = conv ? minUsd > 0 : minAmount > 0;
  const canSubmit =
    phase === 'queried' && minInputValid && !!filtered && filtered.normal.length > 0;

  return (
    <Container maxWidth={ui.themeStretch ? false : 'xl'} disableGutters>
      <Stack spacing={4}>
        <PageHeader
          crumbs={[{ label: '归集系统' }, { label: '手动归集' }]}
          title="手动归集"
          subtitle={`设置最小归集${conv ? '金额' : '数量'}并查询，查看正常 / 异常资产分布，确认后提交归集。`}
        />

        {/* ===== Step 1 ===== */}
        <Card sx={{ p: 6, maxWidth: 1080 }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 4 }}>
            <Chip size="small" color="primary" label="Step 1" />
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              选择 chain · token、设置最小归集{conv ? '金额' : '数量'}并查询
            </Typography>
          </Stack>

          <SingleTokenPicker chainId={chainId} tokenId={tokenId} onChange={updateChainToken} />

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                最小归集{conv ? '金额（USD）' : `数量（${tokenSymbol}）`}
              </Typography>
              <TextField
                type="number"
                fullWidth
                value={conv ? minUsd : minAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (conv) setMinUsd(round2(v));
                  else setMinAmount(Number.isFinite(v) ? v : 0);
                }}
                inputProps={{ min: 0, step: conv ? 0.01 : TOKEN_AMOUNT_STEP }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">{conv ? 'USD' : tokenSymbol}</InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 280 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                {conv
                  ? '查询结果将仅统计余额 ≥ 此金额的地址；异常地址表也会同步过滤；最多支持 2 位小数'
                  : '该 token 无 USD 折算，按 token 数量设置；最多支持 8 位小数'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                预览
              </Typography>
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: 'grey.100',
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {token && chain ? (
                  <>
                    <CryptoBadge symbol={token.symbol} color={token.color} size={32} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {chain.name} · {token.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        最小归集 ≥{' '}
                        {conv ? usd(minUsd) : `${fmtTokenAmount(minAmount)} ${token.symbol}`}
                      </Typography>
                    </Box>
                    {!conv && <Chip size="small" color="warning" label="无 USD 折算" />}
                  </>
                ) : (
                  <Typography color="text.disabled">未选择</Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={runQuery}
              disabled={querying || !token || !minInputValid}
              startIcon={
                querying ? <CircularProgress size={14} color="inherit" /> : <SearchRounded />
              }
            >
              {querying ? '查询中…' : '查询未归集情况'}
            </Button>
          </Stack>
        </Card>

        {/* ===== Step 2 ===== */}
        {query && filtered && (
          <Card ref={step2Ref} sx={{ p: 6, maxWidth: 1080, scrollMarginTop: 16 }}>
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              flexWrap="wrap"
              sx={{ mb: 4 }}
            >
              <Chip size="small" color="primary" label="Step 2" />
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                未归集情况 — 阈值 ≥{' '}
                {conv ? usd(minUsd) : `${fmtTokenAmount(minAmount)} ${tokenSymbol}`}
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.secondary">
                查询时间 {fmtDateTime(new Date().toISOString())}
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 5,
                mb: 4,
              }}
            >
              <StatCard
                tone="lead"
                label="总未归集"
                value={`${fmtTokenAmount(filtered.totalAmount)} ${tokenSymbol}`}
                hint={
                  (filtered.totalUsd != null ? `${usd(filtered.totalUsd)} · ` : '') +
                  `${filtered.total} 个地址`
                }
              />
              <StatCard
                label="正常数量"
                value={`${fmtTokenAmount(filtered.normalAmount)} ${tokenSymbol}`}
                hint={
                  (filtered.normalUsd != null ? `${usd(filtered.normalUsd)} · ` : '') +
                  `${filtered.normal.length} 个 · 占比 ${(filtered.normalRatio * 100).toFixed(1)}%`
                }
              />
              <StatCard
                label="异常数量"
                value={`${fmtTokenAmount(filtered.abnormalAmount)} ${tokenSymbol}`}
                hint={
                  (filtered.abnormalUsd != null ? `${usd(filtered.abnormalUsd)} · ` : '') +
                  `${filtered.abnormal.length} 个 · 占比 ${(filtered.abnormalRatio * 100).toFixed(1)}%`
                }
              />
            </Box>

            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>异常金额地址表</Typography>
              <Typography variant="caption" color="text.secondary">
                · 仅供参考，不会被归集
              </Typography>
            </Stack>

            <TableContainer
              component={Box}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>chain</TableCell>
                    <TableCell>token</TableCell>
                    <TableCell>地址</TableCell>
                    <TableCell align="right">金额（USD）</TableCell>
                    <TableCell align="right">数量</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.abnormal.map((a) => (
                    <TableRow key={a.address} hover>
                      <TableCell>
                        {chain && (
                          <Stack direction="row" alignItems="center" gap={1}>
                            <CryptoBadge symbol={chain.id} color={chain.color} size={20} />
                            <Typography variant="subtitle2">
                              {chain.name}
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {token && (
                          <Stack direction="row" alignItems="center" gap={1}>
                            <CryptoBadge symbol={token.symbol} color={token.color} size={20} />
                            <Typography variant="subtitle2">
                              {token.symbol}
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
                          fontSize: 13,
                          wordBreak: 'break-all',
                          maxWidth: 320,
                        }}
                      >
                        {a.address}
                      </TableCell>
                      <TableCell align="right">
                        {a.amountUsd != null ? (
                          usd(a.amountUsd)
                        ) : (
                          <Typography component="span" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{fmtTokenAmount(a.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.abnormal.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0 }}>
                        <EmptyState
                          icon={<ShieldOutlined sx={{ fontSize: 36 }} />}
                          title="无符合条件的异常地址"
                          desc={
                            filtered.hiddenAbnormalCount > 0
                              ? `已根据当前最小归集阈值过滤掉 ${filtered.hiddenAbnormalCount} 条不达标记录`
                              : '当前 chain · token 没有异常金额地址'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {filtered.hiddenAbnormalCount > 0 && filtered.abnormal.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                已根据当前最小归集阈值过滤掉 {filtered.hiddenAbnormalCount} 条不达标的异常地址。
              </Typography>
            )}

            <Divider sx={{ my: 4 }} />

            {filtered.normal.length === 0 ? (
              <Alert severity="warning">
                当前阈值下没有可归集的正常地址。请<b>调低最小归集{conv ? '金额' : '数量'}</b>
                后重新查询。异常金额地址不参与本次归集。
              </Alert>
            ) : (
              <Alert severity="info">
                提交后将归集 <b>该 chain · token</b> 中余额 ≥ 阈值的{' '}
                <b>{filtered.normal.length} 个正常地址</b>。
                <Box component="span" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                  异常金额地址仅作展示，不会被归集。
                </Box>
              </Alert>
            )}

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                disabled={!canSubmit}
                onClick={() => setConfirm(true)}
                startIcon={
                  phase === 'submitting' ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <PlayArrowRounded />
                  )
                }
              >
                {phase === 'submitting' ? '正在提交…' : '开始归集'}
              </Button>
            </Stack>
          </Card>
        )}
      </Stack>

      {/* ===== Confirm submit ===== */}
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={start}
        title="确认开始归集"
        confirmText="开始归集"
        body={
          <Stack spacing={2}>
            <Alert severity="warning">
              将立即对 <b>{chain?.name}</b> 上的 <b>{tokenSymbol}</b> 发起归集：
              <br />· 余额 ≥{' '}
              <b>
                {conv ? usd(minUsd) : `${fmtTokenAmount(minAmount)} ${tokenSymbol}`}
              </b>{' '}
              的 <b>{filtered?.normal.length ?? 0}</b> 个正常地址
              <Box component="span" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                · 异常金额地址不参与归集
              </Box>
            </Alert>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              · 此操作不可中途撤销，请确认配置无误。
              <br />· 提交后任务执行进度可在「归集任务」模块跟踪查询。
            </Typography>
          </Stack>
        }
      />
    </Container>
  );
});

export default ManualCollection;
