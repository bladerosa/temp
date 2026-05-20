import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { NAV_ITEMS } from '@/data/mockData';

export function StubPage() {
  const { key = '' } = useParams<{ key: string }>();
  const label = labelForKey(key);

  return (
    <Box sx={{ pt: 2 }}>
      <Typography
        variant="h2"
        sx={{ fontSize: 22, lineHeight: 1.3, fontWeight: 700, mt: 2, mb: 5 }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
          py: 15,
          px: 6,
          textAlign: 'center',
          color: 'grey.500',
          fontSize: 14,
        }}
      >
        该模块未在此原型中实现。
      </Box>
    </Box>
  );
}

function labelForKey(key: string): string {
  for (const it of NAV_ITEMS) {
    if (it.key === key) return it.label;
    if (it.children) {
      const c = it.children.find((c) => c.key === key);
      if (c) return c.label;
    }
  }
  return '页面';
}
