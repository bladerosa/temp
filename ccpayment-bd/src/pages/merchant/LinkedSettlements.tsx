import {
  Box,
  Button,
  IconButton,
  InputAdornment,
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
import { ArrowRight, Copy, Link2 } from 'lucide-react';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

const BALANCE = '100.123456';
const INVITE_LINK = 'https://22f704ccbeta-admin.ccpayment.com/register?ref=Yuu-CP12345';

// 佣金结算记录：每行为一天的汇总结果，向前模拟多天
const SETTLEMENTS = [
  { date: '2026-02-04', merchants: 1, commBase: '0.9', rate: '20.00%', commission: '0.18' },
  { date: '2026-02-03', merchants: 3, commBase: '12.50', rate: '20.00%', commission: '2.50' },
  { date: '2026-02-02', merchants: 2, commBase: '8.00', rate: '18.00%', commission: '1.44' },
  { date: '2026-02-01', merchants: 4, commBase: '24.30', rate: '20.00%', commission: '4.86' },
  { date: '2026-01-31', merchants: 2, commBase: '6.75', rate: '15.00%', commission: '1.01' },
  { date: '2026-01-30', merchants: 5, commBase: '40.00', rate: '20.00%', commission: '8.00' },
  { date: '2026-01-29', merchants: 1, commBase: '3.20', rate: '25.00%', commission: '0.80' },
  { date: '2026-01-28', merchants: 3, commBase: '15.60', rate: '20.00%', commission: '3.12' },
  { date: '2026-01-27', merchants: 2, commBase: '9.90', rate: '18.00%', commission: '1.78' },
  { date: '2026-01-26', merchants: 4, commBase: '28.40', rate: '20.00%', commission: '5.68' },
  { date: '2026-01-25', merchants: 1, commBase: '2.10', rate: '20.00%', commission: '0.42' },
  { date: '2026-01-24', merchants: 3, commBase: '17.80', rate: '15.00%', commission: '2.67' },
];

export const LinkedSettlements = observer(function LinkedSettlements({ email }: { email: string }) {
  const { toast } = useStores();

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
    } catch {
      /* noop */
    }
    toast.show({ tone: 'success', title: 'Invite link copied' });
  };

  // 前往推广计划后台进行佣金提现或查看更多详情：新开 tab 打开推广者计划后台登录页
  const gotoPromoterBackend = () =>
    window.open(paths.auth.login, '_blank', 'noopener,noreferrer');

  return (
    <Box sx={{ p: '16px 32px 40px' }}>
      <Stack direction="row" alignItems="center" gap="14px" flexWrap="wrap" sx={{ mb: '24px' }}>
        <Typography component="h1" sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px' }}>
          Referral Settlements
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            p: '6px 12px',
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          <Link2 size={14} />
          关联推广计划账号：
          <Box component="b" sx={{ fontWeight: 700, color: 'primary.darker' }}>
            {email}
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={gotoPromoterBackend}
          endIcon={<ArrowRight size={16} />}
          sx={{ height: 40, px: '18px', borderRadius: '10px', fontSize: 13, fontWeight: 600 }}
        >
          前往推广计划后台进行佣金提现或查看更多详情
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: '20px',
          mb: '24px',
        }}
      >
        <Box sx={{ bgcolor: 'primary.lighter', borderRadius: '16px', p: '24px 28px' }}>
          <Box sx={{ pb: '22px', borderBottom: '1px solid rgba(60,111,245,0.18)' }}>
            <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>Available balance</Box>
            <Box
              sx={{
                fontSize: 36,
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: '-0.6px',
                lineHeight: 1.1,
              }}
            >
              {BALANCE}{' '}
              <Box component="small" sx={{ fontSize: 18, fontWeight: 600, ml: 0.5 }}>
                USDT
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, pt: '20px' }}>
            <Stat label="Total commission" value="100.123456" />
            <Stat label="Total withdrawn" value="0.000000 USDT" />
            <Stat label="Referred merchants" value="1 Merchants" />
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: 'secondary.lighter',
            borderRadius: '16px',
            p: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ fontSize: 18, fontWeight: 700, lineHeight: '24px', mb: '24px', letterSpacing: '-0.2px' }}>
            Share Invitation Link to Get More Commissions!
          </Box>
          <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>Invite Link</Box>
          <TextField
            fullWidth
            value={INVITE_LINK}
            size="small"
            onClick={(e) => (e.target as HTMLInputElement).select?.()}
            InputProps={{
              readOnly: true,
              sx: { bgcolor: '#fff', fontSize: 13, pr: '50px', height: 44 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={copyInvite} aria-label="Copy link">
                    <Copy size={18} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '16px',
          p: '20px 24px',
          boxShadow: '0 0 2px 0 rgba(145,158,171,0.20), 0 12px 24px -4px rgba(145,158,171,0.12)',
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 2 }}>Commission Settlements</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Settle Date</TableCell>
              <TableCell>Merchants</TableCell>
              <TableCell>Comm. Base (USD)</TableCell>
              <TableCell>Avg. Rate</TableCell>
              <TableCell>Commission (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SETTLEMENTS.map((r) => (
              <TableRow key={r.date}>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.merchants}</TableCell>
                <TableCell>{r.commBase}</TableCell>
                <TableCell>{r.rate}</TableCell>
                <TableCell>{r.commission}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Box sx={{ fontSize: 13, color: 'text.secondary', mb: '6px' }}>{label}</Box>
      <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>{value}</Box>
    </Box>
  );
}
