import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Table as TableIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Segmented } from '@/components/Segmented';
import { DateRangePicker } from '@/components/DateRangePicker';
import { LineChart } from '@/components/LineChart';
import { DonutChart } from '@/components/DonutChart';
import { RankBars } from '@/components/RankBars';
import { KpiNumberCell } from '@/components/KpiNumberCell';
import { DrillModal } from '@/components/DrillModal';
import { useStores } from '@/stores';
import {
  MAX_PERIOD_ROWS,
  buildPeriodLabels,
  expandRestPeriods,
  periodData,
  periodsInWindow,
  restData,
  totalDataFor,
} from '@/data/kpi';
import { aggTrendByUnit } from '@/data/trend';
import { regionData, countryBreakdown, type RegionCode } from '@/data/regions';
import { industryData } from '@/data/industries';
import { RANK_DATA } from '@/data/merchants';
import { PLATFORM_AGGREGATION_FEE, AGGREGATION_FEE_DETAIL } from '@/data/rate';
import { SERVICE_FEE_DETAIL } from '@/data/serviceFee';
import { SWAP_FEE_DETAIL } from '@/data/swapFee';
import type { DrillCtx, KpiRowData, PeriodUnit } from '@/data/types';
import { fmtMoney, fmtTenThousand } from '@/utils/format';
import { fmtRangeStr } from '@/utils/dateRange';
import { downloadCsv } from '@/utils/csv';
import { paths } from '@/routes/paths';

const UNIT_OPTIONS: { value: PeriodUnit; label: string }[] = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季' },
];

const UNIT_LABEL: Record<PeriodUnit, string> = {
  day: '日',
  week: '周',
  month: '月',
  quarter: '季',
};

function KpiRow({
  label,
  data,
  muted,
  onCellClick,
}: {
  label: string;
  data: KpiRowData;
  muted?: boolean;
  faded?: boolean;
  onCellClick: (metric: DrillCtx['metric']) => void;
}) {
  return (
    <TableRow
      sx={muted ? { '& td': { backgroundColor: 'rgba(60,111,245,0.03)' } } : undefined}
    >
      <TableCell
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          ...(muted && { color: 'text.primary', fontWeight: 600 }),
        }}
      >
        {label}
      </TableCell>
      <TableCell>
        <KpiNumberCell
          value={data.reg}
          suffix={data.regUsers != null ? `注册商户:${data.regUsers.toLocaleString()}` : null}
          onClick={() => onCellClick('reg')}
        />
      </TableCell>
      <TableCell>
        <KpiNumberCell
          value={data.ver}
          suffix={data.verUsers != null ? `验证商户:${data.verUsers.toLocaleString()}` : null}
          onClick={() => onCellClick('ver')}
        />
      </TableCell>
      <TableCell>
        <KpiNumberCell value={data.txn} pct={data.txnPct} onClick={() => onCellClick('txn')} />
      </TableCell>
      <TableCell>
        <KpiNumberCell value={data.idle} pct={data.idlePct} onClick={() => onCellClick('idle')} />
      </TableCell>
    </TableRow>
  );
}

// ============== KPI table card ==============
const KpiTableCard = observer(function KpiTableCard({
  onDrill,
}: {
  onDrill: (ctx: DrillCtx) => void;
}) {
  const { merchant, detail } = useStores();
  const navigate = useNavigate();
  const { unit, globalFrom, globalTo } = merchant;

  const openMerchantList = () => {
    detail.setCtx({ source: 'kpi-table' });
    navigate(paths.dashboard.merchantDetail);
  };
  // Show up to MAX_PERIOD_ROWS (10) latest periods. Windows that contain
  // fewer periods than that show only what fits — no padding with empty rows.
  const shownCount = Math.min(MAX_PERIOD_ROWS, periodsInWindow(unit, globalFrom, globalTo));
  const labels = useMemo(
    () => buildPeriodLabels(unit, globalTo, shownCount),
    [unit, globalTo, shownCount]
  );
  const hasRest = useMemo(
    () => periodsInWindow(unit, globalFrom, globalTo) > shownCount,
    [unit, globalFrom, globalTo, shownCount]
  );
  const totalRow = useMemo(
    () => totalDataFor(unit, hasRest, globalFrom, globalTo, shownCount),
    [unit, hasRest, globalFrom, globalTo, shownCount]
  );

  const exportCsv = () => {
    const header = [
      '周期',
      '新增注册量',
      '注册商户(累计)',
      '新增验证商户',
      '验证商户(累计)',
      '交易商户',
      '交易商户占比',
      '无交易商户',
      '无交易商户占比',
    ];
    const fmtRow = (label: string, d: KpiRowData) => [
      label,
      d.reg,
      d.regUsers ?? '',
      d.ver,
      d.verUsers ?? '',
      d.txn ?? '',
      d.txnPct != null ? `${d.txnPct}%` : '',
      d.idle ?? '',
      d.idlePct != null ? `${d.idlePct}%` : '',
    ];
    const rows: (string | number)[][] = [header];
    labels.forEach((lbl, i) => rows.push(fmtRow(lbl, periodData(unit, i))));
    expandRestPeriods(unit, globalFrom, globalTo, shownCount).forEach((r) => rows.push(fmtRow(r.label, r)));
    rows.push(fmtRow('累计', totalRow));
    downloadCsv(
      `商户数据_${UNIT_LABEL[unit]}_${globalFrom.replace(/\//g, '-')}_${globalTo.replace(/\//g, '-')}.csv`,
      rows
    );
  };

  return (
    <Card sx={{ p: 5, mb: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 4, gap: 4, flexWrap: 'wrap' }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>商户数据</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Segmented value={unit} options={UNIT_OPTIONS} onChange={merchant.setUnit} />
          <Button
            size="small"
            variant="outlined"
            startIcon={<TableIcon size={13} />}
            onClick={openMerchantList}
          >
            明细查看
          </Button>
          <Button size="small" variant="outlined" startIcon={<Download size={13} />} onClick={exportCsv}>
            导出 CSV
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ tableLayout: 'fixed', minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 180 }}></TableCell>
            <TableCell>新增注册量</TableCell>
            <TableCell>新增验证商户</TableCell>
            <TableCell>交易商户</TableCell>
            <TableCell>无交易商户</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {labels.map((lbl, i) => {
            const data = periodData(unit, i);
            return (
              <KpiRow
                key={lbl}
                label={lbl}
                data={data}
                onCellClick={(metric) => {
                  const count = (data[metric] ?? 0) as number;
                  if (count > 0) onDrill({ metric, label: lbl, unit, count });
                }}
              />
            );
          })}
          {hasRest && (
            <KpiRow
              label="其余时间"
              data={restData(unit)}
              faded
              onCellClick={(metric) => {
                const d = restData(unit);
                const count = (d[metric] ?? 0) as number;
                if (count > 0) onDrill({ metric, label: '其余时间', unit, count });
              }}
            />
          )}
          <KpiRow
            label="累计"
            data={totalRow}
            muted
            onCellClick={(metric) => {
              const count = (totalRow[metric] ?? 0) as number;
              if (count > 0) onDrill({ metric, label: '累计', unit, count });
            }}
          />
        </TableBody>
      </Table>
      </Box>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 2, ml: 0.5 }}>
        累计行口径：新增注册 / 新增验证按窗口列求和；交易 / 无交易按窗口去重，不随单位变化。
      </Typography>
    </Card>
  );
});

// ============== Trend card ==============
const TrendCard = observer(function TrendCard() {
  const { merchant } = useStores();
  const { unit, hiddenSeries, globalFrom, globalTo } = merchant;
  const data = useMemo(() => aggTrendByUnit(unit, globalFrom, globalTo), [unit, globalFrom, globalTo]);
  const series: { key: 'reg' | 'ver' | 'txn' | 'idle'; color: string; label: string }[] = [
    { key: 'reg', color: '#BEE072', label: '新增注册' },
    { key: 'ver', color: '#E7B22B', label: '新增验证商户' },
    { key: 'txn', color: '#3C6FF5', label: '交易商户' },
    { key: 'idle', color: '#919EAB', label: '无交易商户' },
  ];
  return (
    <Card sx={{ p: 5, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 4, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>商户数 趋势</Typography>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
          <Stack direction="row" spacing={3}>
            {series.map((s) => (
              <Box
                key={s.key}
                onClick={() => merchant.toggleSeries(s.key)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: 12,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  opacity: hiddenSeries[s.key] ? 0.4 : 1,
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                {s.label}
              </Box>
            ))}
          </Stack>
          <Segmented value={unit} options={UNIT_OPTIONS} onChange={merchant.setUnit} />
        </Stack>
      </Stack>
      <LineChart data={data} series={series} hiddenSeries={hiddenSeries} height={260} />
    </Card>
  );
});

// ============== Region pie card ==============
const REGION_METRIC_OPTIONS: { value: 'reg' | 'ver' | 'txn' | 'gmv' | 'idle'; label: string }[] = [
  { value: 'reg', label: '注册数' },
  { value: 'ver', label: '验证数' },
  { value: 'txn', label: '交易商户数' },
  { value: 'gmv', label: '交易额' },
  { value: 'idle', label: '无交易商户数' },
];

const RegionCard = observer(function RegionCard() {
  const { merchant } = useStores();
  const { regionMetric } = merchant;
  const isGmv = regionMetric === 'gmv';
  // Currently focused region — donut slice click switches this. APAC is the
  // default since it's the largest.
  const [focusedRegion, setFocusedRegion] = useState<RegionCode>('APAC');
  const regions = useMemo(() => regionData(regionMetric), [regionMetric]);
  const countries = useMemo(
    () => countryBreakdown(focusedRegion, regionMetric),
    [focusedRegion, regionMetric]
  );
  const focusedLabel = regions.find((r) => r.code === focusedRegion)?.label ?? '';
  const total = regions.reduce((s, x) => s + x.value, 0);
  const fmt = (v: number) => (isGmv ? fmtTenThousand(v) : v.toLocaleString());

  return (
    <Card sx={{ p: 5, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 4, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>商户地区分布</Typography>
        <Segmented<'reg' | 'ver' | 'txn' | 'gmv' | 'idle'>
          value={regionMetric}
          options={REGION_METRIC_OPTIONS}
          onChange={merchant.setRegionMetric}
        />
      </Stack>
      <Box
        data-print-stack="1"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(240px,280px) 1fr 1fr' },
          gap: 6,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'grid', placeItems: 'center' }}>
          <DonutChart
            data={regions.map((r) => ({ label: r.label, value: r.value, color: r.color }))}
            size={220}
            thickness={36}
            centerLabel={isGmv ? '总交易额 (USDT)' : '商户总数'}
            centerValue={isGmv ? fmtTenThousand(total) : total.toLocaleString()}
            onSliceClick={(i) => setFocusedRegion(regions[i].code)}
          />
        </Box>
        <Stack spacing={1}>
          {regions.map((r) => {
            const isFocused = r.code === focusedRegion;
            return (
              <Box
                key={r.code}
                onClick={() => setFocusedRegion(r.code)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '14px 1fr auto auto',
                  gap: 2.5,
                  alignItems: 'center',
                  px: 1.5,
                  py: 1.5,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  bgcolor: isFocused ? 'rgba(60,111,245,0.08)' : 'transparent',
                  '&:hover': { bgcolor: isFocused ? 'rgba(60,111,245,0.10)' : 'grey.100' },
                }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: 0.75, bgcolor: r.color }} />
                <Typography sx={{ fontSize: 13, fontWeight: isFocused ? 600 : 500 }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(r.value)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: 44,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {total ? ((r.value / total) * 100).toFixed(1) : '0.0'}%
                </Typography>
              </Box>
            );
          })}
        </Stack>
        <Box>
          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            {focusedLabel} 国家明细
          </Typography>
          {countries.length === 0 ? (
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>暂无明细</Typography>
          ) : (
          <Stack>
            {countries.map((c) => {
              const max = countries[0].value || 1;
              return (
                <Box
                  key={c.code}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 80px',
                    gap: 3,
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <Box sx={{ fontSize: 16 }}>{c.code}</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{c.label}</Typography>
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
                          width: `${(c.value / max) * 100}%`,
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    sx={{ fontSize: 12.5, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {fmt(c.value)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
          )}
        </Box>
      </Box>
    </Card>
  );
});

// ============== Industry pie card ==============
// Mirror of RegionCard, but reads `industryMetric` + industry data. Industries
// are a single-level field on each merchant account, so the right-side
// drilldown shows merchants inside the leading industry (instead of countries
// inside the leading region).
const IndustryCard = observer(function IndustryCard() {
  const { merchant } = useStores();
  const { industryMetric } = merchant;
  const isGmv = industryMetric === 'gmv';
  const industries = useMemo(() => industryData(industryMetric), [industryMetric]);
  const total = industries.reduce((s, x) => s + x.value, 0);
  const fmt = (v: number) => (isGmv ? fmtTenThousand(v) : v.toLocaleString());

  return (
    <Card sx={{ p: 5, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 4, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>商户行业分布</Typography>
        <Segmented<'reg' | 'ver' | 'txn' | 'gmv' | 'idle'>
          value={industryMetric}
          options={REGION_METRIC_OPTIONS}
          onChange={merchant.setIndustryMetric}
        />
      </Stack>
      {/* 2-column layout — industries are flat, no second-level drilldown.
       *  Legend gets the extra width that the regional drilldown was using. */}
      <Box
        data-print-stack="1"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(240px,280px) 1fr' },
          gap: 6,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'grid', placeItems: 'center' }}>
          <DonutChart
            data={industries.map((r) => ({ label: r.label, value: r.value, color: r.color }))}
            size={220}
            thickness={36}
            centerLabel={isGmv ? '总交易额 (USDT)' : '商户总数'}
            centerValue={isGmv ? fmtTenThousand(total) : total.toLocaleString()}
          />
        </Box>
        <Stack spacing={1}>
          {industries.map((r) => (
            <Box
              key={r.code}
              sx={{
                display: 'grid',
                gridTemplateColumns: '14px 1fr auto auto',
                gap: 2.5,
                alignItems: 'center',
                px: 1.5,
                py: 1.5,
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: 0.75, bgcolor: r.color }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{r.label}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(r.value)}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 44,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {total ? ((r.value / total) * 100).toFixed(1) : '0.0'}%
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
});

// ============== Rank cards ==============
const RankCard = observer(function RankCard({
  title,
  metric,
  unit,
  topN,
  setTopN,
}: {
  title: string;
  metric: 'deposit' | 'exchange';
  unit: string;
  topN: number;
  setTopN: (n: number) => void;
}) {
  const items = useMemo(
    () =>
      RANK_DATA['30d'].slice(0, topN).map((m) => ({
        id: m.id,
        name: m.name,
        value: m[metric],
        unit,
      })),
    [metric, topN, unit]
  );
  return (
    <Card sx={{ p: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{title}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            size="small"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            sx={{ height: 32, minWidth: 88 }}
          >
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </Stack>
      </Stack>
      <RankBars items={items} />
    </Card>
  );
});

// ============== Service-fee ranking ==============
// Sibling of AggFeeCard — same anatomy, different cost line (service fee vs
// platform network fee cost). Replaced the old 收币费率 trend chart.
function ServiceFeeRankCard() {
  const navigate = useNavigate();
  return (
    <Card sx={{ p: 5, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>用户支付充值服务费排名</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          顺差 (红色) = 充值服务费 &gt; 平台网络 fee 成本，我们挣钱；逆差 (绿色) = 我们亏钱。
        </Typography>
      </Stack>
      <Table size="small" sx={{ '& th, & td': { fontSize: 12 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Display ID</TableCell>
            <TableCell align="right">用户支付充值服务费用</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {SERVICE_FEE_DETAIL.slice()
            .sort((a, b) => b.serviceFee - a.serviceFee)
            .map((r) => {
              const zero = r.rateDiff === 0;
              const profit = r.rateDiff > 0;
              const rateColor = zero ? 'text.secondary' : profit ? 'error.main' : 'success.dark';
              const rateSign = profit ? '+' : '';
              return (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontFamily: 'var(--font-mono)', color: 'text.primary' }}>
                    {r.id}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}
                    >
                      {fmtMoney(r.serviceFee, 2)}
                    </Box>
                    {!zero && (
                      <Box component="span" sx={{ ml: 0.5, fontSize: 11, color: rateColor, fontWeight: 600 }}>
                        ({rateSign}
                        {r.rateDiff.toFixed(2)}%)
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <Box data-no-print="1" sx={{ textAlign: 'center', mt: 'auto', pt: 3 }}>
        <Typography
          onClick={() => navigate(paths.dashboard.serviceFeeDetail)}
          sx={{ color: 'primary.main', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-block' }}
        >
          查看全部 →
        </Typography>
      </Box>
    </Card>
  );
}

// ============== Swap-fee ranking ==============
// Same anatomy as ServiceFeeRankCard / AggFeeCard — different cost line
// (swap network fee vs swap service fee from the merchant).
function SwapFeeRankCard() {
  const navigate = useNavigate();
  return (
    <Card sx={{ p: 5, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>用户支付换币服务费排名</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          顺差 (红色) = 换币服务费 &gt; 平台换币成本 fee，我们挣钱；逆差 (绿色) = 我们亏钱。
        </Typography>
      </Stack>
      <Table size="small" sx={{ '& th, & td': { fontSize: 12 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Display ID</TableCell>
            <TableCell align="right">用户支付换币服务费用</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {SWAP_FEE_DETAIL.slice()
            .sort((a, b) => b.swapFee - a.swapFee)
            .map((r) => {
              const zero = r.rateDiff === 0;
              const profit = r.rateDiff > 0;
              const rateColor = zero ? 'text.secondary' : profit ? 'error.main' : 'success.dark';
              const rateSign = profit ? '+' : '';
              return (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontFamily: 'var(--font-mono)', color: 'text.primary' }}>
                    {r.id}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}
                    >
                      {fmtMoney(r.swapFee, 2)}
                    </Box>
                    {!zero && (
                      <Box component="span" sx={{ ml: 0.5, fontSize: 11, color: rateColor, fontWeight: 600 }}>
                        ({rateSign}
                        {r.rateDiff.toFixed(2)}%)
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <Box data-no-print="1" sx={{ textAlign: 'center', mt: 'auto', pt: 3 }}>
        <Typography
          onClick={() => navigate(paths.dashboard.swapFeeDetail)}
          sx={{ color: 'primary.main', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-block' }}
        >
          查看全部 →
        </Typography>
      </Box>
    </Card>
  );
}

// ============== Aggregation fee ranking ==============
function AggFeeCard() {
  const navigate = useNavigate();
  return (
    <Card sx={{ p: 5, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>用户支付归集费排名</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          平台归集费率：{PLATFORM_AGGREGATION_FEE}%
        </Typography>
      </Stack>
      <Table size="small" sx={{ '& th, & td': { fontSize: 12 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Display ID</TableCell>
            <TableCell align="right">用户支付归集费用</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {AGGREGATION_FEE_DETAIL.slice()
            .sort((a, b) => b.userFee - a.userFee)
            .map((r) => {
              const zero = r.rateDiff === 0;
              const profit = r.rateDiff > 0;
              const rateColor = zero ? 'text.secondary' : profit ? 'error.main' : 'success.dark';
              const rateSign = profit ? '+' : '';
              return (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontFamily: 'var(--font-mono)', color: 'text.primary' }}>
                    {r.id}
                  </TableCell>
                  <TableCell align="right">
                    {/* Amount in black, profit-rate diff colored (red 顺差 / green 逆差). */}
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}
                    >
                      {fmtMoney(r.userFee, 2)}
                    </Box>
                    {!zero && (
                      <Box component="span" sx={{ ml: 0.5, fontSize: 11, color: rateColor, fontWeight: 600 }}>
                        ({rateSign}
                        {r.rateDiff.toFixed(2)}%)
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <Box data-no-print="1" sx={{ textAlign: 'center', mt: 'auto', pt: 3 }}>
        <Typography
          onClick={() => navigate(paths.dashboard.aggregationFeeDetail)}
          sx={{ color: 'primary.main', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-block' }}
        >
          查看全部 →
        </Typography>
      </Box>
    </Card>
  );
}

// ============== Page ==============
const MerchantPage = observer(function MerchantPage() {
  const { merchant } = useStores();
  const [drillCtx, setDrillCtx] = useState<DrillCtx | null>(null);

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader
        title="商户数据"
        subtitle="商户注册、验证及活跃度的多维分析与长周期对比"
        action={
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileText size={13} />}
              onClick={() => window.print()}
            >
              生成 PDF
            </Button>
            <DateRangePicker
              from={merchant.globalFrom}
              to={merchant.globalTo}
              onChange={(preset) => merchant.applyPreset(preset)}
            />
          </>
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
        <Typography sx={{ fontSize: 12.5 }}>
          当前筛选区间：
          <Box component="strong" sx={{ color: 'primary.main', mx: 0.5 }}>
            {merchant.globalPreset}
          </Box>
          ({fmtRangeStr(merchant.globalFrom, merchant.globalTo)}) — 全板块数据已按此区间统一过滤
        </Typography>
      </Card>

      <KpiTableCard onDrill={setDrillCtx} />
      <TrendCard />
      <RegionCard />
      <IndustryCard />

      <Box data-print-stack="1" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, mb: 4 }}>
        <RankCard
          title="充值排行"
          metric="deposit"
          unit="USDT"
          topN={merchant.depositTopN}
          setTopN={merchant.setDepositTopN}
        />
        <RankCard
          title="换币排行"
          metric="exchange"
          unit="USDT"
          topN={merchant.exchangeTopN}
          setTopN={merchant.setExchangeTopN}
        />
      </Box>

      <Box data-print-stack="1" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 4 }}>
        <ServiceFeeRankCard />
        <SwapFeeRankCard />
        <AggFeeCard />
      </Box>

      <DrillModal ctx={drillCtx} onClose={() => setDrillCtx(null)} />
    </Container>
  );
});

export default MerchantPage;
