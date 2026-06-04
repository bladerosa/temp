import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { validEmail } from '@/utils/validators';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

export default observer(function Forgot() {
  const { auth } = useStores();
  const navigate = useNavigate();
  const [email, setEmail] = useState(auth.email);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const err = touched && email.length > 0 && !validEmail(email);
  const ok = validEmail(email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok || loading) return;
    setLoading(true);
    setTimeout(() => {
      auth.setEmail(email.trim());
      navigate(paths.auth.reset);
    }, 500);
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
        Forgot your password?
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: '20px', mb: '32px' }}>
        No worries — enter the email you signed up with and we'll send a verification code to reset
        it.
      </Typography>

      <Box component="form" onSubmit={submit} noValidate>
        <Box sx={{ display: 'block', fontSize: 13, fontWeight: 500, mb: 1 }}>Email</Box>
        <TextField
          fullWidth
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={err}
          helperText={err ? 'Please enter a valid email address.' : ' '}
          sx={{ mb: '12px' }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!ok || loading}
          sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15, mt: 1 }}
        >
          {loading ? 'Sending…' : 'Send verification code'}
        </Button>
      </Box>

      <Box sx={{ mt: '32px', textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        Remembered it?
        <Box
          component={RouterLink}
          to={paths.auth.login}
          sx={{ color: 'primary.main', fontWeight: 600, ml: 0.75 }}
        >
          Back to login
        </Box>
      </Box>
    </>
  );
});
