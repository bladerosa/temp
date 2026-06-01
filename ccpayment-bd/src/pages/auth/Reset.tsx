import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { OtpInput } from '@/components/OtpInput';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

export default observer(function Reset() {
  const { auth } = useStores();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const otpOk = otp.length === 6;
  const pwOk = newPw.length >= 8;
  const match = newPw && newPw === confirmPw;
  const canSubmit = otpOk && pwOk && match;
  const confirmError = confirmTouched && confirmPw.length > 0 && newPw !== confirmPw;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setTimeout(() => navigate(paths.auth.success), 700);
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(60);
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => navigate(-1)}
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
        Reset your password
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
        <Box sx={{ fontSize: 13, lineHeight: '19px', color: 'text.primary' }}>
          We sent a 6-digit code to{' '}
          <Box component="b" sx={{ fontWeight: 600 }}>
            {auth.email || 'you@example.com'}
          </Box>
          . Enter it below and choose a new password.
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
            onClick={resend}
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

        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>New password</Box>
        <TextField
          fullWidth
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNew((v) => !v)} edge="end" size="small">
                  {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: '20px' }}
        />

        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>Confirm new password</Box>
        <TextField
          fullWidth
          type={showCon ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter new password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          onBlur={() => setConfirmTouched(true)}
          error={confirmError}
          helperText={confirmError ? 'Passwords do not match.' : ' '}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCon((v) => !v)} edge="end" size="small">
                  {showCon ? <Eye size={18} /> : <EyeOff size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: '12px' }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15 }}
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </Box>
    </>
  );
});
