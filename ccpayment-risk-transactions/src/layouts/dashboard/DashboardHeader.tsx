import { Box, IconButton, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Bell, Globe, Menu as MenuIcon, PanelLeft, Smile, Volume2 } from 'lucide-react';
import { useStores } from '@/stores';

export const DashboardHeader = observer(function DashboardHeader() {
  const { ui } = useStores();

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        flex: '0 0 64px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 8,
      }}
    >
      <IconButton
        aria-label="開啟選單"
        onClick={() => ui.setDrawerOpen(true)}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 'auto' }}
      >
        <MenuIcon size={20} />
      </IconButton>

      <Box
        role="button"
        aria-label="收合側邊欄"
        onClick={ui.toggleSidebar}
        sx={{
          display: { xs: 'none', md: 'grid' },
          placeItems: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.secondary',
          cursor: 'pointer',
          mr: 'auto',
        }}
      >
        <PanelLeft size={18} strokeWidth={1.7} />
      </Box>

      <IconButton aria-label="語言" sx={{ color: 'text.primary' }}>
        <Globe size={22} strokeWidth={1.6} />
      </IconButton>
      <IconButton aria-label="通知" sx={{ color: 'text.primary' }}>
        <Bell size={22} strokeWidth={1.6} />
      </IconButton>
      <IconButton aria-label="公告" sx={{ color: 'text.primary', mr: 2 }}>
        <Volume2 size={22} strokeWidth={1.6} />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          pl: 1.5,
          pr: 3.5,
          py: 1.25,
          borderRadius: 999,
          bgcolor: 'primary.lighter',
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
          }}
        >
          <Smile size={20} strokeWidth={1.7} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: '17px' }}>6hang</Typography>
          <Typography sx={{ fontSize: 11, lineHeight: '15px', color: 'text.secondary' }}>
            職位: All
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
