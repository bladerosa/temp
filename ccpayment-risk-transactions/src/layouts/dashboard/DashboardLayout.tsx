import { useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { useStores } from '@/stores';

export function DashboardLayout() {
  const { risk } = useStores();

  useEffect(() => {
    void risk.loadAll();
  }, [risk]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardSidebar />
      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
        <DashboardHeader />
        <Box sx={{ flex: 1, pt: 2, px: 8, pb: 12, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
