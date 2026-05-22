import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { LineChart } from '@/components/LineChart';
import { FinancePie } from '@/components/FinancePie';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Segmented } from '@/components/Segmented';
import { useStores } from '@/stores';
import {
  PLATFORM_ASSETS,
  costTrend,
  expenseTrend,
  healthTrend,
  incomeTrend,
  liquidityTrend,
  profitTrend,
} from '@/data/finance';
import type { FinancePreset } from '@/stores/FinanceStore';

const PRESETS: { value: FinancePreset; label: FinancePreset }[] = [
  { value: '今日', label: '今日' },
  { value: '本周', label: '本周' },
  { value: '本月上旬', label: '本月上旬' },
  { value: '本月中旬', label: '本月中旬' },
  { value: '本月', label: '本月' },
  { value: '上月', label: '上月' },
  { value: '本季度', label: '本季度' },
  { value: '今年至今', label: '今年至今' },
];

function KpiCard({
  label,
  value,
  unit = 'USD',
  tone = 'blue',
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: 'blue' | 'green' | 'amber' | 'grey';
  sub?: { name: string; value: string }[];
}) {
  const borderColor =
    tone === 'blue'
      ? 'primary.main'
      : tone === 'green'
        ? 'success.main'
        : tone === 'amber'
          ? 'warning.main'
          : 'grey.500';
  return (
    <Card
      sx={{
        p: 4,
        borderLeft: '3px solid',
        borderColor,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1.5 }}>{label}</Typography>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }}>{unit}</Typography>
      </Stack>
      {sub && sub.length > 0 && (
        <Stack
          spacing={1}
          sx={{
            mt: 3,
            pt: 2.5,
            borderTop: '1px dashed',
            borderColor: 'divider',
            fontSize: 11.5,
          }}
        >
          {sub.map((s) => (
            <Stack key={s.name} direction="row" justifyContent="space-between" spacing={3}>
              <Box sx={{ color: 'text.secondary' }}>{s.name}</Box>
              <Box sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.value}</Box>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}

function TokenRow({ token }: { token: (typeof PLATFORM_ASSETS)[number] }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}
    >
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: token.color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {token.symbol[0]}
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{token.name}</Typography>
      </Stack>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {token.amount}{' '}
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 11 }}>
            {token.symbol}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          ≈ {token.usd} USD
        </Typography>
      </Box>
    </Stack>
  );
}

const FinancePage = observer(function FinancePage() {
  const { finance } = useStores();

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader
        title="财务看板"
        subtitle="支持自定义时间区间 (Custom Range)，实现精准的阶段利润核算与资金流动性监控。"
        action={
          <Button variant="outlined" startIcon={<Download size={14} />}>
            导出报表
          </Button>
        }
      />

      {/* Custom range filter bar */}
      <Card
        sx={{
          p: '12px 16px',
          mb: 5,
          border: '1px solid rgba(60,111,245,0.18)',
          background: 'linear-gradient(180deg, rgba(60,111,245,0.04), #FFFFFF)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap">
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: 'primary.main',
              pr: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            时间区间
          </Typography>
          <Segmented<FinancePreset>
            value={finance.preset === '自定义' ? PRESETS[0].value : (finance.preset as FinancePreset)}
            options={PRESETS}
            onChange={(v) => finance.applyPreset(v)}
          />
          <Box sx={{ flex: 1 }} />
          <DateRangePicker
            from={finance.from}
            to={finance.to}
            presets={[]}
            onChange={(_preset, from, to) => {
              if (from && to) finance.applyCustom(from, to);
            }}
          />
        </Stack>
      </Card>

      {/* Section 1 — 利润表 */}
      <Typography variant="h3" sx={{ fontSize: 18, mb: 3, mt: 2 }}>
        1. 利润表
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 4, mb: 4 }}>
        <Stack spacing={3}>
          <KpiCard
            label="总收入"
            value="13.39"
            sub={[
              { name: '充值手续费', value: '0.00 USD' },
              { name: '提现手续费', value: '13.09 USD' },
              { name: '换币盈利', value: '0.28 USD' },
              { name: '商家归集费', value: '0.00 USD' },
              { name: '上币/其他收益', value: '—' },
            ]}
          />
          <KpiCard
            label="总成本"
            value="0.62"
            tone="amber"
            sub={[
              { name: '商家提现', value: '0.12 USD' },
              { name: '系统调度', value: '0.09 USD' },
              { name: '系统归集', value: '0.39 USD' },
              { name: '系统撮合', value: '0.00 USD' },
            ]}
          />
          <KpiCard label="毛利润" value="12.77" tone="green" />
          <KpiCard label="毛利率" value="95.37" unit="%" tone="green" />
          <KpiCard
            label="总费用"
            value="0.00"
            tone="grey"
            sub={[
              { name: '人力成本', value: '—' },
              { name: '兼职工资', value: '—' },
              { name: '市场费用', value: '—' },
              { name: '测试费用', value: '—' },
              { name: '现金项目经费', value: '—' },
              { name: 'BD佣金', value: '—' },
              { name: '行政费用', value: '—' },
              { name: '其他', value: '—' },
            ]}
          />
          <KpiCard label="净利润" value="12.77" tone="green" />
          <KpiCard label="净利率" value="95.37" unit="%" tone="green" />
        </Stack>

        <Stack spacing={3}>
          <Card sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>净利润趋势图</Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ fontSize: 12, color: 'text.secondary' }}>
                {[
                  { color: '#3C6FF5', label: '收入' },
                  { color: '#1A1F2C', label: '成本' },
                  { color: '#9098A8', label: '费用' },
                  { color: '#EC684C', label: '净利润' },
                ].map((s) => (
                  <Stack key={s.label} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                    {s.label}
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <LineChart
              data={profitTrend}
              series={[
                { key: 'income', color: '#3C6FF5', label: '收入', kind: 'bar' },
                { key: 'cost', color: '#1A1F2C', label: '成本', kind: 'bar' },
                { key: 'expense', color: '#9098A8', label: '费用', kind: 'bar' },
                { key: 'net', color: '#EC684C', label: '净利润' },
              ]}
              height={180}
              yMax={15}
            />
          </Card>
          <Card sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>成本趋势图</Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ fontSize: 12, color: 'text.secondary' }}>
                {[
                  { color: '#3C6FF5', label: '商家提现' },
                  { color: '#1A1F2C', label: '系统调度' },
                  { color: '#C6CBD6', label: '系统归集' },
                  { color: '#7C90F8', label: '系统撮合' },
                  { color: '#EC684C', label: '总成本' },
                ].map((s) => (
                  <Stack key={s.label} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                    {s.label}
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <LineChart
              data={costTrend}
              series={[
                { key: 'merchant', color: '#3C6FF5', label: '商家提现', kind: 'bar' },
                { key: 'sysAdjust', color: '#1A1F2C', label: '系统调度', kind: 'bar' },
                { key: 'sysAggreg', color: '#C6CBD6', label: '系统归集', kind: 'bar' },
                { key: 'sysSettle', color: '#7C90F8', label: '系统撮合', kind: 'bar' },
                { key: 'total', color: '#EC684C', label: '总成本' },
              ]}
              height={180}
              yMax={0.8}
            />
          </Card>
          <Card sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>费用</Typography>
            </Stack>
            <LineChart
              data={expenseTrend}
              series={[{ key: 'total', color: '#EC684C', label: '总费用' }]}
              height={180}
              yMax={1}
            />
          </Card>
        </Stack>
      </Box>

      {/* Pie charts row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 6 }}>
        <Card sx={{ p: 4 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 3 }}>收入饼状图</Typography>
          <FinancePie
            data={[
              { label: '充值手续费', value: 0.05, color: '#3C6FF5' },
              { label: '提现手续费', value: 97.77, color: '#1A1F2C' },
              { label: '换币手续费', value: 2.13, color: '#7C90F8' },
              { label: '商家归集费', value: 0.05, color: '#C6CBD6' },
              { label: '上币/其他收益', value: 0.0, color: '#EC684C' },
            ]}
          />
        </Card>
        <Card sx={{ p: 4 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 3 }}>成本饼状图</Typography>
          <FinancePie
            data={[
              { label: '商家提现', value: 20.11, color: '#3C6FF5' },
              { label: '系统调度', value: 15.3, color: '#1A1F2C' },
              { label: '系统归集', value: 64.02, color: '#C6CBD6' },
              { label: '系统撮合', value: 0.56, color: '#7C90F8' },
            ]}
          />
        </Card>
        <Card sx={{ p: 4 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 3 }}>费用饼状图</Typography>
          <FinancePie
            data={[
              { label: '人力成本', value: 0, color: '#3C6FF5' },
              { label: '兼职工资', value: 0, color: '#1A1F2C' },
              { label: '市场费用', value: 0, color: '#7C90F8' },
              { label: '测试费用', value: 0, color: '#C6CBD6' },
              { label: '现金项目经费', value: 0, color: '#43BE76' },
              { label: 'BD佣金', value: 0, color: '#FFAB00' },
              { label: '行政费用', value: 0, color: '#00B8D9' },
              { label: '其他', value: 0, color: '#9098A8' },
            ]}
          />
        </Card>
      </Box>

      {/* Section 2 — 收入统计 */}
      <Typography variant="h3" sx={{ fontSize: 18, mb: 3 }}>
        2. 收入统计{' '}
        <Box component="span" sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 500 }}>
          (USD)
        </Box>
      </Typography>

      <Card sx={{ p: 0, mb: 4, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>项目</TableCell>
              <TableCell>合计</TableCell>
              <TableCell>冲提业务</TableCell>
              <TableCell>自动提现</TableCell>
              <TableCell>风险充值</TableCell>
              <TableCell>换币业务</TableCell>
              <TableCell>上币</TableCell>
              <TableCell>归集费</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['充值服务费', '0.00', '0.00', '-', '0.00', '-', '-', '-'],
              ['提现手续费', '13.09', '13.09', '0.00', '0.00', '-', '-', '-'],
              ['商家归集费', '-', '-', '-', '-', '-', '-', '0.00'],
              ['换币盈利', '0.28', '-', '-', '-', '0.28', '-', '-'],
              ['上币/其他收益', '0.00', '-', '-', '-', '-', '0.00', '-'],
            ].map((row, i) => (
              <TableRow key={i}>
                {row.map((c, j) => (
                  <TableCell key={j} sx={{ fontWeight: j === 0 ? 600 : 500, color: j === 0 ? 'text.secondary' : 'text.primary' }}>
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { bgcolor: 'rgba(60,111,245,0.06)', fontWeight: 700, color: 'primary.dark' } }}>
              {['收入总额', '13.39', '13.10', '0.00', '0.00', '0.28', '0.00', '0.00'].map((c, j) => (
                <TableCell key={j}>{c}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Card sx={{ p: 4, mb: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>收入</Typography>
        </Stack>
        <LineChart
          data={incomeTrend}
          series={[
            { key: 'deposit', color: '#3C6FF5', label: '充值手续费', kind: 'bar' },
            { key: 'withdraw', color: '#1A1F2C', label: '提现手续费', kind: 'bar' },
            { key: 'swap', color: '#7C90F8', label: '换币盈利', kind: 'bar' },
            { key: 'total', color: '#EC684C', label: '总收入' },
          ]}
          height={200}
          yMax={15}
        />
      </Card>

      {/* Section 3 — 平台流动性 */}
      <Typography variant="h3" sx={{ fontSize: 18, mb: 3 }}>
        3. 平台流动性{' '}
        <Box component="span" sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 500 }}>
          (USD)
        </Box>
      </Typography>

      <Card sx={{ p: 0, mb: 4, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>期初值</TableCell>
              <TableCell colSpan={2}>0.00</TableCell>
              <TableCell colSpan={5}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>项目</TableCell>
              <TableCell>合计</TableCell>
              <TableCell>商家充提行为</TableCell>
              <TableCell>风险交易</TableCell>
              <TableCell>系统换币行为</TableCell>
              <TableCell>Cwallet结算</TableCell>
              <TableCell>支出</TableCell>
              <TableCell>TRX质押（平台）</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['充值', '+111.82', '+111.62', '+0.20', '-', '-', '-', '-'],
              ['换币进', '0.00', '-', '-', '0.00', '-', '-', '-'],
              ['质押赎回', '-', '-', '-', '-', '-', '-', '0.00'],
              ['提现', '-1.91', '-1.41', '-0.50', '-', '-', '-', '-'],
              ['换币出', '-10.00', '-', '-', '-10.00', '-', '-', '-'],
              ['结算', '-0.81', '-', '-', '-', '0.00', '-0.81', '-'],
              ['质押转出', '-', '-', '-', '-', '-', '-', '0.00'],
            ].map((row, i) => (
              <TableRow key={i}>
                {row.map((c, j) => {
                  const neg = typeof c === 'string' && c.startsWith('-') && c !== '-';
                  const pos = typeof c === 'string' && c.startsWith('+');
                  return (
                    <TableCell
                      key={j}
                      sx={{
                        fontWeight: j === 0 ? 600 : pos || neg ? 600 : 500,
                        color: j === 0 ? 'text.secondary' : pos ? 'success.dark' : neg ? 'error.main' : 'text.primary',
                      }}
                    >
                      {c}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { bgcolor: 'rgba(60,111,245,0.06)', fontWeight: 700 } }}>
              {['当期发生额', '+99.09', '+110.21', '-0.30', '-10.00', '0.00', '-0.81', '0.00'].map((c, j) => {
                const pos = c.startsWith('+');
                const neg = c.startsWith('-') && c !== '-';
                return (
                  <TableCell
                    key={j}
                    sx={{
                      color: j === 0 ? 'primary.dark' : pos ? 'success.dark' : neg ? 'error.main' : 'text.primary',
                    }}
                  >
                    {c}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow sx={{ '& td': { bgcolor: 'grey.100', fontWeight: 700 } }}>
              <TableCell>期末值</TableCell>
              <TableCell sx={{ color: 'success.dark' }}>+99.09</TableCell>
              <TableCell colSpan={6}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 4, mb: 4 }}>
        <Card sx={{ p: 4 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>当前平台资产</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, my: 1, fontVariantNumeric: 'tabular-nums' }}>
            699.90{' '}
            <Box component="span" sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>
              USD
            </Box>
          </Typography>
          <Stack spacing={1}>
            {PLATFORM_ASSETS.map((t) => (
              <TokenRow key={t.symbol} token={t} />
            ))}
          </Stack>
        </Card>
        <Card sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>平台资产健康图</Typography>
            <Stack direction="row" spacing={3} sx={{ fontSize: 12, color: 'text.secondary' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#43BE76' }} /> 系统宗额
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3C6FF5' }} /> 商户宗额
              </Stack>
            </Stack>
          </Stack>
          <LineChart
            data={healthTrend}
            series={[
              { key: 'sys', color: '#43BE76', label: '系统宗额' },
              { key: 'mer', color: '#3C6FF5', label: '商户宗额' },
            ]}
            height={210}
            yMax={1}
          />
        </Card>
      </Box>

      <Card sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>流水走势图</Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ fontSize: 12, color: 'text.secondary' }}>
            {[
              { color: '#3C6FF5', label: '商家净提现行为' },
              { color: '#1A1F2C', label: '系统换币行为' },
              { color: '#7C90F8', label: '风险交易' },
              { color: '#C6CBD6', label: 'Cwallet结算' },
              { color: '#EC684C', label: '净值' },
            ].map((s) => (
              <Stack key={s.label} direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                {s.label}
              </Stack>
            ))}
          </Stack>
        </Stack>
        <LineChart
          data={liquidityTrend}
          series={[
            { key: 'merchant', color: '#3C6FF5', label: '商家净提现', kind: 'bar' },
            { key: 'system', color: '#1A1F2C', label: '系统换币', kind: 'bar' },
            { key: 'risk', color: '#7C90F8', label: '风险交易', kind: 'bar' },
            { key: 'cwallet', color: '#C6CBD6', label: 'Cwallet结算', kind: 'bar' },
            { key: 'net', color: '#EC684C', label: '净值' },
          ]}
          height={240}
          yMax={120}
          yMin={-20}
        />
      </Card>
    </Container>
  );
});

export default FinancePage;
