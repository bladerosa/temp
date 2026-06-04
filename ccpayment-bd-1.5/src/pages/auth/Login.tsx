import {
  Box,
  Button,
  Dialog,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { validEmail } from '@/utils/validators';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

const ACCOUNTS = [
  { name: 'Alex Chen', email: 'alex.chen@gmail.com', color: '#1a73e8', isNew: false },
  { name: 'Maya Patel', email: 'maya.work@gmail.com', color: '#9334e6', isNew: true },
];

export default observer(function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const embeddedSuffix = params.get('embedded') === '1' ? '?embedded=1' : '';
  const { auth } = useStores();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState<string | null>(null);

  const emailError = emailTouched && email.length > 0 && !validEmail(email);
  const canSubmit = validEmail(email) && pw.length >= 1;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setTimeout(() => {
      auth.setEmail(email.trim());
      navigate(paths.promoter.settlements + embeddedSuffix);
    }, 700);
  };

  const goForgot = () => {
    if (validEmail(email)) auth.setEmail(email.trim());
    navigate(paths.auth.forgot);
  };

  const pickGoogle = (acc: (typeof ACCOUNTS)[number]) => {
    setGoogleLoading(`Signing in as ${acc.name}…`);
    setTimeout(() => {
      auth.setEmail(acc.email);
      setGoogleOpen(false);
      setGoogleLoading(null);
      // 新账户：需先设置密码再进入推广者后台
      if (acc.isNew) navigate(paths.auth.setPassword + embeddedSuffix);
      else navigate(paths.promoter.settlements + embeddedSuffix);
    }, 1100);
  };

  return (
    <>
      <Box sx={{ mb: '40px' }}>
        <Typography
          component="h1"
          sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.6px' }}
        >
          Welcome to CCPayment's Referral Platform
        </Typography>
      </Box>

      <Box component="form" onSubmit={submit} noValidate>
        <FieldLabel>Email</FieldLabel>
        <TextField
          fullWidth
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          error={emailError}
          helperText={emailError ? 'Please enter a valid email address.' : ' '}
          sx={{ mb: '12px' }}
        />

        <FieldLabel>Password</FieldLabel>
        <TextField
          fullWidth
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPw((v) => !v)}
                  edge="end"
                  size="small"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <Eye size={18} /> : <EyeOff size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: '20px' }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '24px', mt: '-4px' }}>
          <Box
            component="button"
            type="button"
            onClick={goForgot}
            sx={{
              fontSize: 13,
              color: 'primary.main',
              fontWeight: 500,
              background: 'none',
              border: 0,
              p: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              '&:hover': { color: 'primary.dark' },
            }}
          >
            Forgot password?
          </Box>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15 }}
        >
          {loading ? 'Signing in…' : 'Login'}
        </Button>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            my: '24px',
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 500,
            '&::before, &::after': {
              content: '""',
              flex: 1,
              height: '1px',
              bgcolor: 'divider',
            },
          }}
        >
          OR
        </Box>

        <Button
          type="button"
          variant="outlined"
          onClick={() => setGoogleOpen(true)}
          sx={{
            width: '100%',
            height: 52,
            borderRadius: '12px',
            fontSize: 15,
            color: 'text.primary',
            borderColor: 'divider',
            bgcolor: '#fff',
            '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.300' },
            gap: 1.25,
          }}
          startIcon={<GoogleG />}
        >
          Continue with Google
        </Button>
      </Box>

      <Box sx={{ mt: '32px', textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        Don't have an account?
        <Box
          component={RouterLink}
          to={paths.auth.signup}
          sx={{ color: 'primary.main', fontWeight: 600, ml: 0.75, textDecoration: 'none' }}
        >
          Sign Up
        </Box>
      </Box>

      <Dialog
        open={googleOpen}
        onClose={() => !googleLoading && setGoogleOpen(false)}
        PaperProps={{ sx: { width: 420, maxWidth: 'calc(100vw - 32px)', borderRadius: '16px' } }}
      >
        {googleLoading ? (
          <Stack alignItems="center" sx={{ p: '48px 24px', gap: 2.25 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '3px solid #e0e0e0',
                borderTopColor: '#1a73e8',
                '@keyframes gSpin': { to: { transform: 'rotate(360deg)' } },
                animation: 'gSpin 0.8s linear infinite',
              }}
            />
            <Box sx={{ fontSize: 14, color: '#5f6368' }}>{googleLoading}</Box>
          </Stack>
        ) : (
          <Box>
            <Box sx={{ p: '24px 24px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <GoogleWordmark />
              <Box>
                <Box sx={{ fontSize: 22, color: '#202124', lineHeight: 1.3, letterSpacing: '-0.2px' }}>
                  Choose an account
                </Box>
                <Box sx={{ mt: 0.5, fontSize: 14, color: '#5f6368' }}>
                  to continue to{' '}
                  <Box component="b" sx={{ color: '#202124', fontWeight: 500 }}>
                    referral.ccpayment.com
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ py: 1 }}>
              {ACCOUNTS.map((a) => (
                <Box
                  key={a.email}
                  component="button"
                  type="button"
                  onClick={() => pickGoogle(a)}
                  sx={googleAccountSx}
                >
                  <Box sx={{ ...gAvatar, bgcolor: a.color }}>{a.name[0]}</Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                    <Box sx={{ fontSize: 14, color: '#202124', fontWeight: 500 }}>{a.name}</Box>
                    <Box sx={{ fontSize: 13, color: '#5f6368', mt: '2px' }}>{a.email}</Box>
                  </Box>
                </Box>
              ))}
              <Box
                component="button"
                type="button"
                onClick={() => {
                  setGoogleLoading('Redirecting to Google…');
                  setTimeout(() => setGoogleLoading(null), 900);
                }}
                sx={googleAccountSx}
              >
                <Box sx={{ ...gAvatar, bgcolor: 'transparent', color: '#5f6368', border: '1px solid #dadce0' }}>+</Box>
                <Box sx={{ fontSize: 14, color: '#202124', fontWeight: 500 }}>Use another account</Box>
              </Box>
            </Box>
            <Box sx={{ p: '16px 24px 20px', fontSize: 12, color: '#5f6368', lineHeight: '18px', borderTop: '1px solid #f1f3f4' }}>
              To continue, Google will share your name, email address, language preference, and profile picture
              with referral.ccpayment.com.
            </Box>
            <Box sx={{ p: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Box
                component="button"
                type="button"
                onClick={() => setGoogleOpen(false)}
                sx={{
                  bgcolor: 'transparent',
                  color: '#1a73e8',
                  border: 0,
                  fontWeight: 500,
                  fontSize: 14,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  '&:hover': { bgcolor: 'rgba(26,115,232,0.08)' },
                }}
              >
                Cancel
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
});

const googleAccountSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  p: '12px 24px',
  cursor: 'pointer',
  border: 0,
  background: 'transparent',
  width: '100%',
  textAlign: 'left' as const,
  fontFamily: 'inherit',
  '&:hover': { bgcolor: '#f1f3f4' },
};

const gAvatar = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  fontWeight: 500,
  fontSize: 15,
  flex: 'none',
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 1 }}>
      {children}
    </Box>
  );
}

function GoogleG() {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20 }}>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.54-5.18 3.54-8.86Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.95-2.91l-3.88-3c-1.07.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.56.39-2.29V6.61H1.27a12 12 0 0 0 0 10.78l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </Box>
  );
}

function GoogleWordmark() {
  return (
    <Box component="svg" viewBox="0 0 272 92" sx={{ width: 75, height: 24 }}>
      <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
      <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
      <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" />
      <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
      <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" />
      <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" />
    </Box>
  );
}
