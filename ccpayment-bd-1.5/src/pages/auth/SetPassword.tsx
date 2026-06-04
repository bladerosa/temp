import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

export default observer(function SetPassword() {
  const { auth } = useStores();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const embeddedSuffix = params.get('embedded') === '1' ? '?embedded=1' : '';

  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [cpTouched, setCpTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwOk = pw.length >= 8;
  const match = !!confirmPw && pw === confirmPw;
  const canSubmit = pwOk && match;
  const pwErr = pwTouched && pw.length > 0 && !pwOk;
  const cpErr = cpTouched && confirmPw.length > 0 && pw !== confirmPw;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setTimeout(() => navigate(paths.promoter.settlements + embeddedSuffix), 700);
  };

  return (
    <>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '14px',
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          mb: '20px',
        }}
      >
        <ShieldCheck size={28} />
      </Box>
      <Typography component="h1" sx={{ fontSize: 28, fontWeight: 700, mb: 1 }}>
        Set up your password
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: '20px', mb: '32px' }}>
        Welcome,{' '}
        <Box component="b" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {auth.email || 'your account'}
        </Box>
        . This is a new account — set a password to finish setting up your CCPayment Referral
        account.
      </Typography>

      <Box component="form" onSubmit={submit} noValidate>
        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>New password</Box>
        <TextField
          fullWidth
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onBlur={() => setPwTouched(true)}
          error={pwErr}
          helperText={pwErr ? 'Password must be at least 8 characters.' : ' '}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small">
                  {showPw ? <Eye size={18} /> : <EyeOff size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: '12px' }}
        />

        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>Confirm password</Box>
        <TextField
          fullWidth
          type={showCp ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          onBlur={() => setCpTouched(true)}
          error={cpErr}
          helperText={cpErr ? 'Passwords do not match.' : ' '}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCp((v) => !v)} edge="end" size="small">
                  {showCp ? <Eye size={18} /> : <EyeOff size={18} />}
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
          sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15, mt: 1 }}
        >
          {loading ? 'Setting up…' : 'Set password & continue'}
        </Button>
      </Box>
    </>
  );
});
