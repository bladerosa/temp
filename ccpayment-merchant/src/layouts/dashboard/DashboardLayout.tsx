import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { TelegramFab } from '@/components/TelegramFab';

export function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', minWidth: 1280, bgcolor: 'background.paper' }}>
      <DashboardSidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <DashboardHeader />
        <Box component="main" sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
      </Box>
      <TelegramFab />
    </Box>
  );
}
