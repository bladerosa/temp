import { observer } from 'mobx-react-lite';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  HelpOutlineRounded,
  MenuRounded,
  NotificationsNoneRounded,
  SearchRounded,
  SettingsRounded,
} from '@mui/icons-material';
import { useStores } from '@/stores';

// Sticky AppBar atop the dashboard column. The hamburger label flips
// between expand/collapse vs open/close depending on whether the viewport
// is in mobile mode — copy from the original Layout.tsx so screenreader
// behavior matches.

const DashboardHeader = observer(function DashboardHeader() {
  const { ui } = useStores();

  const hamburgerLabel = ui.isMobile
    ? ui.drawerOpen
      ? '关闭侧栏'
      : '打开侧栏'
    : ui.collapsed
    ? '展开侧栏'
    : '折叠侧栏';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 64 },
          gap: 2,
          px: { xs: 2, md: 4 },
        }}
      >
        <IconButton
          onClick={ui.toggleSidebar}
          aria-label={hamburgerLabel}
          title={hamburgerLabel}
          edge="start"
        >
          <MenuRounded />
        </IconButton>

        <TextField
          size="small"
          placeholder="搜索任务、地址、订单…"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: 0, sm: 240, md: 320 },
            display: { xs: 'none', sm: 'block' },
            '& .MuiOutlinedInput-root': { backgroundColor: 'background.paper' },
          }}
        />

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="设置">
            <IconButton size="medium">
              <SettingsRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="帮助">
            <IconButton size="medium" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              <HelpOutlineRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="通知">
            <IconButton size="medium">
              <Badge variant="dot" color="error">
                <NotificationsNoneRounded sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.5,
              ml: 1.5,
              pl: 2,
              borderLeft: 1,
              borderColor: 'divider',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
              CC
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                CCPay 运营
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Operations · Admin
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
});

export default DashboardHeader;
