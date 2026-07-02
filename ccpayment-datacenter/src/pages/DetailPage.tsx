import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  IconButton,
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
import { ChevronLeft, ChevronRight, Download, ExternalLink, Filter } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Spark } from '@/components/Spark';
import { AdvancedFilterDialog, type AdvancedFilterValue } from '@/components/AdvancedFilterDialog';
import { TxnDrawer, type TxnDrawerMerchant } from '@/components/TxnDrawer';
import {
  LinkedMerchantsModal,
  type LinkedMember,
  type LinkedMerchantsCtx,
} from '@/components/LinkedMerchantsModal';
import { EmptyState } from '@/components/EmptyState';
import { useStores } from '@/stores';
import { RANK_DATA, resolveRangeKey, type RankRangeKey } from '@/data/merchants';
import {
  bucketRanges,
  bucketSum,
  merchantSparklineValues,
  merchantTrailingDaily,
} from '@/data/merchantSeries';
import { merchantProfile } from '@/data/merchantProfile';
import { industryLabel } from '@/data/industries';
import { downloadCsv } from '@/utils/csv';
import { paths } from '@/routes/paths';

interface AppliedTag {
  key: string;
  label: string;
}

const DEFAULT_ADVANCED: AdvancedFilterValue = {
  keyword: '',
  regions: [],
  industries: [],
  amountMin: '',
  amountMax: '',
  countMin: '',
  countMax: '',
};

const DetailPage = observer(function DetailPage() {
  const { detail, merchant } = useStores();
  const navigate = useNavigate();
  const ctx = detail.ctx;

  const isRankSource = !!ctx?.rank;
  const rankLabel = ctx?.rank === 'deposit' ? '充值金额' : ctx?.rank === 'exchange' ? '换币金额' : null;
  const rawRange = ctx?.range ?? merchant.globalPreset;
  const range: RankRangeKey = resolveRangeKey(rawRange);
  const rangeLabel = /^(7d|30d|90d)$/.test(rawRange)
    ? ({ '7d': '近 7 天', '30d': '近 30 天', '90d': '近 90 天' } as const)[range]
    : rawRange;
  // Sparkline / 交易笔数 / TxnDrawer all derive from the GLOBAL filter window
  // via merchantSparklineValues (which caps at 365 days internally).

  // 本视图统一以「交易金额」(= deposit) 为金额口径，换币不再单列/单独排序。
  const [sortBy] = useState<'deposit'>('deposit');
  const [search, setSearch] = useState('');
  const [advOpen, setAdvOpen] = useState(false);
  const [adv, setAdv] = useState<AdvancedFilterValue>(DEFAULT_ADVANCED);
  const [appliedTags, setAppliedTags] = useState<AppliedTag[]>(() => {
    const tags: AppliedTag[] = [];
    if (ctx?.rank) tags.push({ key: 'metric', label: `排序权重：${rankLabel}` });
    if (ctx?.range) tags.push({ key: 'range', label: `时间范围：${rangeLabel}` });
    if (ctx?.topN) tags.push({ key: 'topN', label: `范围：Top ${ctx.topN}` });
    if (ctx?.period) tags.push({ key: 'period', label: `统计周期：${ctx.period}` });
    return tags;
  });

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [txnFor, setTxnFor] = useState<TxnDrawerMerchant | null>(null);
  const [linkedCtx, setLinkedCtx] = useState<LinkedMerchantsCtx | null>(null);

  const removeTag = (k: string) => {
    setAppliedTags((tags) => tags.filter((t) => t.key !== k));
    if (k === 'adv-keyword') setAdv((a) => ({ ...a, keyword: '' }));
    if (k === 'adv-regions') setAdv((a) => ({ ...a, regions: [] }));
    if (k === 'adv-industries') setAdv((a) => ({ ...a, industries: [] }));
    if (k === 'adv-amount') setAdv((a) => ({ ...a, amountMin: '', amountMax: '' }));
    if (k === 'adv-count') setAdv((a) => ({ ...a, countMin: '', countMax: '' }));
  };

  const applyAdv = (next: AdvancedFilterValue) => {
    setAdv(next);
    setAdvOpen(false);
    setPage(1);
    setAppliedTags((tags) => {
      const base = tags.filter((t) => !t.key.startsWith('adv-'));
      const extra: AppliedTag[] = [];
      if (next.keyword) extra.push({ key: 'adv-keyword', label: `关键字：${next.keyword}` });
      if (next.regions.length) extra.push({ key: 'adv-regions', label: `地区：${next.regions.join(', ')}` });
      if (next.industries.length)
        extra.push({
          key: 'adv-industries',
          label: `行业：${next.industries.map((c) => industryLabel(c)).join(', ')}`,
        });
      if (next.amountMin || next.amountMax)
        extra.push({ key: 'adv-amount', label: `金额：${next.amountMin || '0'} – ${next.amountMax || '∞'}` });
      if (next.countMin || next.countMax)
        extra.push({ key: 'adv-count', label: `笔数：${next.countMin || '0'} – ${next.countMax || '∞'}` });
      return [...base, ...extra];
    });
  };

  const enriched = useMemo(() => {
    const base = RANK_DATA[range].slice().sort((a, b) => b[sortBy] - a[sortBy]);
    // 交易笔数 cell still totals the global window (buckets shared with the
    // TxnDrawer for chart ↔ drawer alignment); the sparkline no longer uses
    // these buckets — it is a fixed 90-day daily series (see below).
    const buckets = bucketRanges(merchant.unit, merchant.globalFrom, merchant.globalTo);
    return base.map((m) => {
      const daily = merchantSparklineValues(m, merchant.globalFrom, merchant.globalTo);
      const bucketed = bucketSum(daily, buckets);
      const count = bucketed.reduce((s, v) => s + v, 0);
      // 交易笔数变化趋势 column is CAPPED to the most recent 90 days (daily),
      // independent of the global window/unit — see merchantTrailingDaily.
      const spark = merchantTrailingDaily(m, merchant.globalTo, 90);
      const profile = merchantProfile(m.id);
      const revenue = m.deposit + m.exchange; // 充值换币收入 (USDT)
      return {
        ...m,
        count,
        values: spark.values,
        labels: spark.labels,
        profile,
        revenue,
      };
    });
  }, [range, sortBy, merchant.unit, merchant.globalFrom, merchant.globalTo]);

  const filtered = useMemo(() => {
    let list = enriched;
    const q = (search || adv.keyword || '').trim().toLowerCase();
    if (q)
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.profile.email.toLowerCase().includes(q)
      );
    if (adv.regions.length) list = list.filter((m) => adv.regions.includes(m.country));
    if (adv.industries.length) list = list.filter((m) => adv.industries.includes(m.industry));
    const aMin = parseFloat(adv.amountMin);
    const aMax = parseFloat(adv.amountMax);
    if (!isNaN(aMin)) list = list.filter((m) => m[sortBy] >= aMin);
    if (!isNaN(aMax)) list = list.filter((m) => m[sortBy] <= aMax);
    const cMin = parseInt(adv.countMin, 10);
    const cMax = parseInt(adv.countMax, 10);
    if (!isNaN(cMin)) list = list.filter((m) => m.count >= cMin);
    if (!isNaN(cMax)) list = list.filter((m) => m.count <= cMax);
    return list;
  }, [enriched, search, adv, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  const toMember = (m: (typeof enriched)[number]): LinkedMember => ({
    id: m.id,
    name: m.name,
    country: m.country,
    industry: m.industry,
    deposit: m.deposit, // 交易金额 (USDT)
    count: m.count,
    firstDepositAt: m.profile.firstDepositAt,
    lastDepositAt: m.profile.lastDepositAt,
  });

  // Open the linked-merchants modal for a clicked row: gather every merchant
  // that shares the same email, with the clicked one placed first.
  const openLinked = (m: (typeof enriched)[number]) => {
    const email = m.profile.email;
    const group = enriched.filter((x) => x.profile.email === email);
    const ordered = [m, ...group.filter((x) => x.id !== m.id)];
    setLinkedCtx({ email, anchorName: m.name, members: ordered.map(toMember) });
  };

  const exportCsv = () => {
    const headers = [
      '排名',
      '商户名',
      'Display ID',
      '商户邮箱',
      '关联商户数量',
      '地区',
      '行业',
      '交易金额 (USDT)',
      '充提换收入 (USDT)',
      '交易笔数',
      '首充时间',
      '最后充值时间',
    ];
    const rows = filtered.map((m, i) => [
      i + 1,
      m.name,
      m.id,
      m.profile.email,
      m.profile.linkedCount,
      m.country,
      industryLabel(m.industry),
      m.deposit,
      m.revenue,
      m.count,
      m.profile.firstDepositAt,
      m.profile.lastDepositAt,
    ]);
    downloadCsv(`商户交易统计_${rangeLabel}.csv`, [headers, ...rows]);
  };

  const advActive =
    adv.keyword ||
    adv.regions.length ||
    adv.industries.length ||
    adv.amountMin ||
    adv.amountMax ||
    adv.countMin ||
    adv.countMax;

  const goBack = () => navigate(paths.dashboard.merchant);

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              component="span"
              onClick={goBack}
              sx={{ color: 'primary.main', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}
            >
              ←
            </Box>
            <span>查看交易统计</span>
            {isRankSource && (
              <Chip label="已携带权重" color="primary" size="small" sx={{ ml: 1.5 }} />
            )}
          </Stack>
        }
        subtitle={
          isRankSource
            ? `自 "${ctx!.rank === 'deposit' ? '充值排行' : '换币排行'}" 跳转，已自动应用排行权重，确保统计口径一致。`
            : '商户交易总览，可按金额、笔数等任意维度排序。'
        }
        action={
          <>
            <Button variant="outlined" startIcon={<Filter size={14} />} onClick={() => setAdvOpen(true)}>
              高级筛选
              {advActive ? (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    ml: 1,
                  }}
                />
              ) : null}
            </Button>
            <Button variant="outlined" startIcon={<Download size={14} />} onClick={exportCsv}>
              导出 CSV
            </Button>
          </>
        }
      />

      {appliedTags.length > 0 && (
        <Card sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>当前应用：</Typography>
          {appliedTags.map((t) => (
            <Chip
              key={t.key}
              label={t.label}
              size="small"
              onDelete={() => removeTag(t.key)}
              variant="outlined"
              sx={{
                bgcolor: 'rgba(60,111,245,0.10)',
                color: 'primary.dark',
                borderStyle: 'dashed',
                borderColor: 'rgba(60,111,245,0.35)',
              }}
            />
          ))}
          <Box sx={{ flex: 1 }} />
          <Typography
            onClick={() => {
              setAppliedTags([]);
              setAdv(DEFAULT_ADVANCED);
            }}
            sx={{ color: 'primary.main', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
          >
            清空全部
          </Typography>
        </Card>
      )}

      <Card sx={{ p: 5, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, gap: 4, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            按<Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>交易金额</Box>降序
          </Typography>
          <TextField
            size="small"
            placeholder="搜索 商户名 / Display ID / 邮箱"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ width: 220 }}
          />
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1320 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56 }}>排名</TableCell>
              <TableCell sx={{ minWidth: 240 }}>商户</TableCell>
              <TableCell align="right">关联商户数量</TableCell>
              <TableCell>地区</TableCell>
              <TableCell>行业</TableCell>
              <TableCell align="right">交易金额 (USDT)</TableCell>
              <TableCell align="right">充提换收入 (USDT)</TableCell>
              <TableCell align="right">交易笔数</TableCell>
              <TableCell>首充时间</TableCell>
              <TableCell>最后充值时间</TableCell>
              <TableCell sx={{ minWidth: 200 }}>交易笔数变化趋势（近 90 天）</TableCell>
              <TableCell align="right" sx={{ width: 60 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((m, idx) => {
              const i = (curPage - 1) * pageSize + idx;
              const top = i < 3;
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        display: 'inline-grid',
                        placeItems: 'center',
                        borderRadius: 1.5,
                        bgcolor: top ? 'rgba(60,111,245,0.16)' : 'grey.100',
                        color: top ? 'primary.dark' : 'text.secondary',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {i + 1}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2.5} alignItems="center">
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #3C6FF5, #6F8DF9)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {m.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                          {m.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 11.5, color: 'text.secondary', fontFamily: 'var(--font-mono)' }}
                          noWrap
                          title={m.profile.email}
                        >
                          {m.profile.email}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontFamily: 'var(--font-mono)' }}>
                          {m.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {m.profile.linkedCount > 0 ? (
                      <Chip
                        label={m.profile.linkedCount}
                        size="small"
                        clickable
                        onClick={() => openLinked(m)}
                        title={`查看该商户的 ${m.profile.linkedCount} 个关联商户`}
                        sx={{
                          height: 20,
                          fontSize: 11.5,
                          fontWeight: 600,
                          bgcolor: 'rgba(60,111,245,0.12)',
                          color: 'primary.dark',
                          '&:hover': { bgcolor: 'rgba(60,111,245,0.22)' },
                        }}
                      />
                    ) : (
                      <Typography component="span" sx={{ fontSize: 12.5, color: 'text.disabled' }}>
                        0
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={m.country} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12.5, color: 'text.primary' }} noWrap>
                      {industryLabel(m.industry)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {m.deposit.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {m.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {m.count.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary', fontSize: 12.5 }}>
                    {m.profile.firstDepositAt}
                  </TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary', fontSize: 12.5 }}>
                    {m.profile.lastDepositAt}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 120, height: 28 }}>
                      <Spark
                        values={m.values}
                        labels={m.labels}
                        label="交易笔数"
                        valueFormat={(v) => v.toLocaleString()}
                        color="#3C6FF5"
                        width="100%"
                        height={28}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      title="查看交易明细"
                      onClick={() => setTxnFor(m)}
                      sx={{ width: 28, height: 28, color: 'text.secondary' }}
                    >
                      <ExternalLink size={14} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </Box>
        {pageRows.length === 0 && (
          <EmptyState title="无匹配商户" desc="请调整筛选条件后重试" />
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            显示 {filtered.length === 0 ? 0 : (curPage - 1) * pageSize + 1} –{' '}
            {Math.min(curPage * pageSize, filtered.length)} 共 {filtered.length} 条
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
                  fontSize: 12.5,
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
            {totalPages > 5 && <Box>…</Box>}
            <IconButton
              size="small"
              disabled={curPage === totalPages}
              onClick={() => setPage(curPage + 1)}
              sx={{ width: 28, height: 28 }}
            >
              <ChevronRight size={14} />
            </IconButton>
          </Stack>
        </Stack>
      </Card>

      <AdvancedFilterDialog open={advOpen} value={adv} onApply={applyAdv} onClose={() => setAdvOpen(false)} />
      <TxnDrawer
        open={!!txnFor}
        merchant={txnFor}
        unit={merchant.unit}
        globalFrom={merchant.globalFrom}
        globalTo={merchant.globalTo}
        globalPreset={merchant.globalPreset}
        onClose={() => setTxnFor(null)}
      />
      <LinkedMerchantsModal ctx={linkedCtx} onClose={() => setLinkedCtx(null)} />
    </Container>
  );
});

export default DetailPage;
