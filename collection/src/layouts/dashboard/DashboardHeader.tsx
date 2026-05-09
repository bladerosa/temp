import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  HelpOutlineRounded,
  LanguageRounded,
  MenuRounded,
  NotificationsNoneRounded,
  SearchRounded,
  SettingsRounded,
  ChevronRightRounded,
} from '@mui/icons-material';
import { useStores } from '@/stores';

// AppBar — strict implementation of preview/appbar.html.
//   - 72h, bg-paper, bottom border default
//   - Padding 12px 40px (12 vertical via flex centering, 40 horizontal on md+)
//   - Search: bg-subtle pill, transparent border default → focus shows paper bg + primary border
//   - Icon buttons: 36px circle, hover bg `rgba(145,158,171,0.08)`
//   - Account chip: 44h pill, padding `4 16 4 6`, border-subtle, gradient avatar 32px

const DashboardHeader = observer(function DashboardHeader() {
  const { ui } = useStores();
  const [searchFocused, setSearchFocused] = useState(false);

  const hamburgerLabel = ui.isMobile
    ? (ui.drawerOpen ? '关闭侧栏' : '打开侧栏')
    : (ui.collapsed ? '展开侧栏' : '折叠侧栏');

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          minHeight: 72,
          height: 72,
          px: { xs: 4, md: 10 }, // 16 / 40
          gap: 4, // 16
        }}
      >
        <IconButton
          onClick={ui.toggleSidebar}
          aria-label={hamburgerLabel}
          title={hamburgerLabel}
          sx={{ width: 36, height: 36, color: 'grey.700' }}
        >
          <MenuRounded sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Search — bg-subtle pill, focus expands */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            flex: 1, maxWidth: 360,
            height: 40,
            px: 3, // 12
            borderRadius: 2, // 8
            bgcolor: searchFocused ? 'background.paper' : 'grey.100',
            border: '1px solid',
            borderColor: searchFocused ? 'primary.main' : 'transparent',
            transition: 'background 120ms, border-color 120ms',
          }}
        >
          <SearchRounded sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
          <InputBase
            placeholder="搜索任务、地址、订单…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              flex: 1,
              fontSize: 14,
              '& input::placeholder': { color: 'text.secondary', opacity: 1 },
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Right cluster: icon buttons (36 circle) + account chip */}
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Tooltip title="语言">
            <IconButton sx={{ width: 36, height: 36, color: 'grey.700' }}>
              <LanguageRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="帮助">
            <IconButton sx={{ width: 36, height: 36, color: 'grey.700' }}>
              <HelpOutlineRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="设置">
            <IconButton sx={{ width: 36, height: 36, color: 'grey.700' }}>
              <SettingsRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="通知">
            <IconButton sx={{ width: 36, height: 36, color: 'grey.700' }}>
              <Badge
                variant="dot"
                color="error"
                overlap="circular"
                sx={{ '& .MuiBadge-dot': { boxShadow: '0 0 0 2px #fff', width: 8, height: 8, borderRadius: '50%' } }}
              >
                <NotificationsNoneRounded sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Account chip — 44h pill */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{
              ml: 1,
              height: 44,
              pl: 1,        // 4
              pr: 4,        // 16
              borderRadius: 30,
              bgcolor: 'background.paper',
              border: '1px solid rgba(145,158,171,0.24)',
              cursor: 'pointer',
              transition: 'background 120ms ease-out',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <Avatar
              sx={{
                width: 32, height: 32, fontSize: 13, fontWeight: 700,
                background: 'radial-gradient(circle at 30% 30%, #8B5CF6, #6D28D9)',
              }}
            >
              CC
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', lineHeight: 1.1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', letterSpacing: '0.2px' }}>
                CCPay 运营
              </Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'grey.600', mt: 0.5, letterSpacing: '0.3px' }}>
                Operations · Admin
              </Typography>
            </Box>
            <ChevronRightRounded sx={{ fontSize: 14, color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }} />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
});

export default DashboardHeader;
