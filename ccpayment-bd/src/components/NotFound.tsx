import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'grey.100',
        p: 4,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: 40, fontWeight: 700, mb: 1 }}>404</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>找不到该页面。</Typography>
        <Button variant="contained" onClick={() => navigate(paths.auth.login)}>
          返回登录
        </Button>
      </Box>
    </Box>
  );
}

export function PageLoader() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Box sx={{ color: 'text.secondary', fontSize: 14 }}>Loading…</Box>
    </Box>
  );
}
