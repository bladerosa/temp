import { Box, Button, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';

export default function Success() {
  const navigate = useNavigate();
  return (
    <>
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          bgcolor: 'success.lighter',
          color: 'success.dark',
          display: 'grid',
          placeItems: 'center',
          m: '16px auto 24px',
          position: 'relative',
          '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            border: '1.5px dashed',
            borderColor: 'success.light',
            animation: 'spin 14s linear infinite',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Check size={44} strokeWidth={3} />
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center', mb: '28px' }}>
        <Typography component="h2" sx={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', mb: 1 }}>
          Password reset successfully
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
          Your password has been updated. You can now sign in with your new password.
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={() => navigate(paths.auth.login)}
        sx={{ width: '100%', height: 52, borderRadius: '12px', fontSize: 15 }}
      >
        Back to login
      </Button>
    </>
  );
}
