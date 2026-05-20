import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

export function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <DashboardSidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#F4F6F8',
        }}
      >
        <DashboardHeader />
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 8,
            pb: 8,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
