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
            <TableRow>
              <TableCell>2026-02-04</TableCell>
              <TableCell>1</TableCell>
              <TableCell>0.9</TableCell>
              <TableCell>20.00%</TableCell>
              <TableCell>0.18</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: '24px' }}>
        <Button
          variant="contained"
          onClick={gotoPromoterBackend}
          endIcon={<ArrowRight size={16} />}
          sx={{ height: 48, px: '24px', borderRadius: '12px', fontSize: 14, fontWeight: 600 }}
        >
          前往推广计划后台进行佣金提现或查看更多详情
        </Button>
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
