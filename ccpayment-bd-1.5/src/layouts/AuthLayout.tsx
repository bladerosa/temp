import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { BrandPanel } from '@/components/BrandPanel';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        minHeight: '100vh',
      }}
    >
      <BrandPanel />
      <Box
        component="section"
        sx={{
          display: 'grid',
          placeItems: 'center',
          p: { xs: 4, md: '48px' },
          bgcolor: '#fff',
          position: 'relative',
          overflowY: 'auto',
          maxHeight: { md: '100vh' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
