import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { validEmail } from '@/utils/validators';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

export default observer(function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const embeddedSuffix = params.get('embedded') === '1' ? '?embedded=1' : '';
  const { auth } = useStores();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [cpTouched, setCpTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const okEmail = validEmail(email);
  const okPw = pw.length >= 8;
  const okMatch = !!confirmPw && pw === confirmPw;
  const canSubmit = okEmail && okPw && okMatch && terms;

  const emailErr = emailTouched && email.length > 0 && !okEmail;
  const pwErr = pwTouched && pw.length > 0 && !okPw;
  const cpErr = cpTouched && confirmPw.length > 0 && pw !== confirmPw;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setTimeout(() => {
      auth.setEmail(email.trim());
      navigate(paths.auth.verifySignup + embeddedSuffix);
    }, 600);
  };

  return (
    <>
      <Box
        component={RouterLink}
        to={paths.auth.login}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          fontSize: 13,
          color: 'text.secondary',
          fontWeight: 500,
          mb: '24px',
          textDecoration: 'none',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <ArrowLeft size={16} /> Back to login
      </Box>
      <Typography component="h1" sx={{ fontSize: 28, fontWeight: 700, mb: 1 }}>
        Create your account
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: '20px', mb: '32px' }}>
        Set up your CCPayment Referral account to start earning commissions from merchants you bring
        in.
      </Typography>

      <Box component="form" onSubmit={submit} noValidate>
        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>Email</Box>
        <TextField
          fullWidth
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          error={emailErr}
          helperText={emailErr ? 'Please enter a valid email address.' : ' '}
          sx={{ mb: '12px' }}
        />

        <Box sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>Password</Box>
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

        <FormControlLabel
          sx={{ alignItems: 'flex-start', m: '4px 0 20px' }}
          control={
            <Checkbox
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              sx={{ p: 0.5, mr: 1, mt: '2px' }}
            />
          }
          label={
            <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
              I agree to the{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Terms of Service
              </Box>{' '}
              and{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Privacy Policy
              </Box>
            </Box>
          }
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15 }}
        >
          {loading ? 'Sending…' : 'Send verification code'}
        </Button>
      </Box>

      <Box sx={{ mt: '32px', textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        Already have an account?
        <Box component={RouterLink} to={paths.auth.login} sx={{ color: 'primary.main', fontWeight: 600, ml: 0.75 }}>
          Sign in
        </Box>
      </Box>
    </>
  );
});
