import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box } from '@mui/material';
import { useStores } from '@/stores';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import ToastHost from '@/components/ToastHost';

// Outer dashboard shell. The permanent Sidebar Drawer participates in the
// flex flow on md+ — no manual padding needed on the main column. On xs/sm
// the Sidebar renders as a temporary drawer (modal) and the main column
// takes the full width. All viewport state lives in `uiStore`.

const DashboardLayout = observer(function DashboardLayout() {
  const { collection } = useStores();

  // Eagerly hydrate the store on first mount so pages don't all fight to load.
  useEffect(() => {
    collection.loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardSidebar />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DashboardHeader />
        <Box
          component="main"
          sx={{
            flex: 1,
            // preview/dashboard scroll padding: 28/32/48 → MUI spacing 7/8/12
            pt: { xs: 5, md: 7 },
            pb: { xs: 8, md: 12 },
            px: { xs: 4, md: 8 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <ToastHost />
    </Box>
  );
});

export default DashboardLayout;
