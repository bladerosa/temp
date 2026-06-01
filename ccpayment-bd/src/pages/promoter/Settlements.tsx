import {
  Box,
  Button,
  Dialog,
  DialogContent,
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
import { Check, ChevronRight, Copy, Info, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStores } from '@/stores';
import { fmtUsdt } from '@/utils/validators';

const WD_BALANCE = 100.123456;
const WD_MIN = 50;
const MERCHANT_ID = 'CP12345';

export default observer(function Settlements() {
  const { toast } = useStores();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const inviteLink = `https://22f704ccbeta-admin.ccpayment.com/register?ref=Yuu-${MERCHANT_ID}`;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      /* noop */
    }
    toast.show({ tone: 'success', title: 'Invite link copied' });
  };

  return (
    <>
      <Stack direction="row" alignItems="center" gap="14px" flexWrap="wrap" sx={{ mb: '24px' }}>
        <Typography
          component="h1"
          sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px' }}
        >
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
          <ShieldCheck size={14} />
          此推广者账户由商户{' '}
          <Box component="b" sx={{ fontWeight: 700, color: 'primary.darker' }}>
            {MERCHANT_ID}
          </Box>{' '}
          使用
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              pb: '22px',
              borderBottom: '1px solid rgba(60,111,245,0.18)',
            }}
          >
            <Box>
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
                {WD_BALANCE}{' '}
                <Box component="small" sx={{ fontSize: 18, fontWeight: 600, ml: 0.5 }}>
                  USDT
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              onClick={() => setWithdrawOpen(true)}
              sx={{ p: '12px 22px', borderRadius: '10px', fontSize: 14, fontWeight: 600 }}
            >
              Withdrawal
            </Button>
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
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              value={inviteLink}
              size="small"
              onClick={(e) => (e.target as HTMLInputElement).select?.()}
              InputProps={{
                readOnly: true,
                sx: {
                  bgcolor: '#fff',
                  fontSize: 13,
                  pr: '50px',
                  height: 44,
                },
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
      </Box>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '16px',
          p: '20px 24px',
          boxShadow: '0 0 2px 0 rgba(145,158,171,0.20), 0 12px 24px -4px rgba(145,158,171,0.12)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Commission Settlements</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: 13,
              color: 'text.secondary',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer',
            }}
          >
            View More <ChevronRight size={14} />
          </Box>
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Settle Date</TableCell>
              <TableCell>Merchants</TableCell>
              <TableCell>Comm. Base (USD)</TableCell>
              <TableCell>Avg. Rate</TableCell>
              <TableCell>Commission (USD)</TableCell>
              <TableCell align="right">Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>2026-02-04</TableCell>
              <TableCell>1</TableCell>
              <TableCell>0.9</TableCell>
              <TableCell>20.00%</TableCell>
              <TableCell>0.18</TableCell>
              <TableCell align="right">
                <Box sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}>Details</Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </>
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

function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [twofa, setTwofa] = useState('');
  const [phase, setPhase] = useState<'form' | 'success'>('form');

  useEffect(() => {
    if (!open) {
      setAmount('');
      setTwofa('');
      setPhase('form');
    }
  }, [open]);

  const parsed = amount === '' ? NaN : Number(amount);
  const amountValid =
    !Number.isNaN(parsed) && parsed >= WD_MIN && parsed <= WD_BALANCE;
  const has2fa = twofa.length === 6;
  const canSubmit = amountValid && has2fa;

  let helperText: React.ReactNode = (
    <>
      可提现金额：<Box component="b" sx={{ fontWeight: 600, color: 'text.primary' }}>{WD_BALANCE} USDT</Box>
    </>
  );
  let helperErr = false;
  if (amount !== '' && !Number.isNaN(parsed)) {
    if (parsed < WD_MIN) {
      helperText = `提现金额不可小于 ${WD_MIN} USDT`;
      helperErr = true;
    } else if (parsed > WD_BALANCE) {
      helperText = '超出可提现金额';
      helperErr = true;
    }
  }

  const estimate = amountValid ? fmtUsdt(parsed) : '0';

  const submit = () => {
    if (!canSubmit) return;
    setPhase('success');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 480, maxWidth: 'calc(100vw - 32px)', borderRadius: '16px' } }}
    >
      <Box
        sx={{
          p: '18px 20px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ fontSize: 16, fontWeight: 600 }}>Withdraw</Box>
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <X size={18} />
        </IconButton>
      </Box>

      {phase === 'form' ? (
        <>
          <DialogContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Box sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>提现金额</Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  height: 56,
                  px: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 4px rgba(60,111,245,0.10)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: '#26A17B',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    flex: 'none',
                  }}
                >
                  ₮
                </Box>
                <Box
                  component="input"
                  inputMode="decimal"
                  placeholder="不少于 50"
                  value={amount}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .replace(/[^0-9.]/g, '')
                      .replace(/(\..*)\./g, '$1');
                    setAmount(cleaned);
                  }}
                  sx={{
                    flex: 1,
                    height: '100%',
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    fontFamily: 'inherit',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'text.primary',
                    letterSpacing: '-0.2px',
                    minWidth: 0,
                  }}
                />
                <Box
                  component="button"
                  type="button"
                  onClick={() => setAmount(fmtUsdt(WD_BALANCE))}
                  sx={{
                    border: 0,
                    background: 'transparent',
                    color: 'primary.main',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    p: '4px 6px',
                    '&:hover': { color: 'primary.dark' },
                  }}
                >
                  Max
                </Box>
              </Box>
              <Box sx={{ fontSize: 12, color: helperErr ? 'error.main' : 'text.secondary' }}>
                {helperText}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                p: '12px 14px',
                bgcolor: 'rgba(0,184,217,0.08)',
                borderRadius: '10px',
                fontSize: 13,
                lineHeight: '20px',
                color: 'info.darker',
              }}
            >
              <Box sx={{ color: 'info.dark', flex: 'none', mt: '1px' }}>
                <Info size={18} />
              </Box>
              <span>提现申请通过后将提现到 ccpayment 商户后台的 USDT 钱包余额中，届时请注意查收。</span>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Box sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
                Google Authenticator
              </Box>
              <Box
                component="input"
                placeholder="Google Authenticator"
                inputMode="numeric"
                maxLength={6}
                value={twofa}
                onChange={(e) => setTwofa(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                sx={{
                  width: '100%',
                  height: 48,
                  px: '14px',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '10px',
                  bgcolor: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: 'text.primary',
                  outline: 'none',
                  letterSpacing: '0.5px',
                  '&:focus': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 4px rgba(60,111,245,0.10)',
                  },
                }}
              />
              <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                Enter a 6-digit Google verification code
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', pt: '16px', borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 13, color: 'text.secondary' }}>
                Estimated amount received <Info size={14} />
              </Box>
              <Box sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.2px' }}>
                {estimate} USDT
              </Box>
            </Box>
          </DialogContent>
          <Box sx={{ p: '16px 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              disabled={!canSubmit}
              onClick={submit}
              sx={{ height: 44, px: '28px', fontSize: 14 }}
            >
              Confirm withdraw
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ p: '28px 24px 24px', textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              color: 'success.dark',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Check size={28} strokeWidth={2.5} />
          </Box>
          <Box sx={{ fontSize: 18, fontWeight: 700, mb: '6px' }}>Withdrawal request submitted</Box>
          <Box sx={{ fontSize: 13, color: 'text.secondary', lineHeight: '20px' }}>
            您的提现申请已提交，审核通过后将到账至商户{' '}
            <Box component="b" sx={{ fontWeight: 600, color: 'text.primary' }}>{MERCHANT_ID}</Box>{' '}
            的 USDT 钱包余额。
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: '20px' }}>
            <Button variant="contained" onClick={onClose} sx={{ height: 44, px: '28px', fontSize: 14 }}>
              Done
            </Button>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
