import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', px: 6 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h1" sx={{ color: 'text.disabled' }}>
          404
        </Typography>
        <Typography variant="subtitle1">找不到該頁面</Typography>
        <Typography variant="body2" color="text.secondary">
          鏈接可能已失效，或該頁面已被移除。
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(paths.dashboard.riskTransactions)}
        >
          返回風險交易列表
        </Button>
      </Stack>
    </Box>
  );
}
