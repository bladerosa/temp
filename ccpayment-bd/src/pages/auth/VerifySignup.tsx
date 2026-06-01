import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { OtpInput } from '@/components/OtpInput';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

export default observer(function VerifySignup() {
  const { auth } = useStores();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const embeddedSuffix = params.get('embedded') === '1' ? '?embedded=1' : '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const canSubmit = otp.length === 6;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setTimeout(() => navigate(paths.promoter.settlements + embeddedSuffix), 700);
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => navigate(paths.auth.signup)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          fontSize: 13,
          color: 'text.secondary',
          fontWeight: 500,
          mb: '24px',
          background: 'none',
          border: 0,
          p: 0,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <ArrowLeft size={16} /> Back
      </Box>
      <Typography component="h1" sx={{ fontSize: 28, fontWeight: 700, mb: '32px' }}>
        Verify your email
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          p: '14px 16px',
          bgcolor: 'primary.lighter',
          borderRadius: '12px',
          mb: '24px',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            flex: 'none',
          }}
        >
          <Mail size={18} />
        </Box>
        <Box sx={{ fontSize: 13, lineHeight: '19px' }}>
          We sent a 6-digit code to{' '}
          <Box component="b" sx={{ fontWeight: 600 }}>
            {auth.email || 'you@example.com'}
          </Box>
          . Enter it below to finish creating your account.
        </Box>
      </Box>

      <Box component="form" onSubmit={submit} noValidate>
        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>Verification code</Box>
        <OtpInput value={otp} onChange={setOtp} autoFocus />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            color: 'text.secondary',
            m: '14px 0 24px',
          }}
        >
          <Box>
            {seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : `Didn't get the code?`}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => seconds <= 0 && setSeconds(60)}
            disabled={seconds > 0}
            sx={{
              color: seconds > 0 ? 'text.disabled' : 'primary.main',
              fontWeight: 600,
              fontSize: 13,
              background: 'none',
              border: 0,
              p: 0,
              cursor: seconds > 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Resend code
          </Box>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15, mt: 1 }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </Box>
    </>
  );
});
