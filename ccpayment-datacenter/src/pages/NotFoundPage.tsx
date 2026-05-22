import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h1" sx={{ color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4">页面未找到</Typography>
        <Typography variant="body2" color="text.secondary">
          您访问的页面不存在或已被移除。
        </Typography>
        <Button variant="contained" onClick={() => navigate(paths.dashboard.merchant)}>
          返回商户数据
        </Button>
      </Stack>
    </Box>
  );
}
