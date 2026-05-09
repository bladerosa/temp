import { useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';
import { paths } from '@/routes/paths';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ py: 16 }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Typography variant="h2" sx={{ fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h6">页面不存在</Typography>
        <Typography variant="body2" color="text.secondary">
          您访问的页面不存在或已被移动。
        </Typography>
        <Button variant="contained" onClick={() => navigate(paths.dashboard.collection.auto)}>
          返回归集系统
        </Button>
      </Stack>
    </Container>
  );
}
