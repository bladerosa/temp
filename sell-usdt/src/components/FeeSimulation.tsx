import { Box, Stack } from '@mui/material';
import { deriveRow } from '@/utils/pricing';

const SELL_AMT = 50000;
const BASE_RATE = 1;

const fmt = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const fmtRate = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 6, minimumFractionDigits: 0 });

export function FeeSimulation({
  platform,
  supplier,
}: {
  platform: string;
  supplier: string;
}) {
  const d = deriveRow({ sellAmt: SELL_AMT, market: BASE_RATE }, { platform, supplier });
  const extRate =
    SELL_AMT > 0
      ? ((d.extFee / SELL_AMT) * 100).toLocaleString('en-US', { maximumFractionDigits: 4 })
      : '0';

  return (
    <Box
      sx={{
        bgcolor: '#F4F6F9',
        borderRadius: '10px',
        p: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: 'grey.600', fontWeight: 500 }}>
        <Box sx={{ width: 4, height: 12, bgcolor: 'primary.main', borderRadius: '2px' }} />
        <span>计算模拟</span>
      </Box>
      <Box
        sx={{
          fontSize: 13,
          color: 'text.primary',
          fontWeight: 500,
          pb: 2,
          borderBottom: '1px dashed',
          borderColor: 'divider',
        }}
      >
        用户 sell <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>50,000 USDT</Box> to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>USD</Box>
      </Box>
      <Stack sx={{ gap: 1.5 }}>
        <SimRow k="外显服务费" v={`${fmt(d.extFee)} USDT`} />
        <SimRow k="平台服务费" v={`${fmt(d.platFee)} USDT`} />
        <SimRow k="供应商承兑数量" v={`${fmt(d.supAmt)} USDT`} />
        <SimRow k="供应商承兑汇率" v={`1 USDT ≈ ${fmtRate(d.supRate)} USD`} />
        <SimRow k="外显服务费率" v={`${extRate}%`} highlight withSep />
        <SimRow k="用户实际到手" v={`${fmt(d.userGot)} USD`} highlight />
      </Stack>
    </Box>
  );
}

function SimRow({
  k,
  v,
  highlight,
  withSep,
}: {
  k: string;
  v: string;
  highlight?: boolean;
  withSep?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        fontSize: 13,
        pt: withSep ? 2 : 0,
        borderTop: withSep ? '1px dashed' : 'none',
        borderColor: 'divider',
      }}
    >
      <Box
        component="span"
        sx={{
          color: highlight ? 'text.primary' : 'grey.600',
          fontWeight: highlight ? 500 : 400,
        }}
      >
        {k}
      </Box>
      <Box
        component="span"
        sx={{
          color: highlight ? 'primary.main' : 'text.primary',
          fontSize: highlight ? 15 : 13,
          fontWeight: highlight ? 700 : 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {v}
      </Box>
    </Box>
  );
}
