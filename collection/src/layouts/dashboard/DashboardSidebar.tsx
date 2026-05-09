import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  AdsClickRounded,
  AnnouncementOutlined,
  AssignmentOutlined,
  BarChartRounded,
  BlockRounded,
  CampaignOutlined,
  ChevronRightRounded,
  CloseRounded,
  DescriptionOutlined,
  ExpandMoreRounded,
  HandshakeOutlined,
  LayersOutlined,
  ListAltRounded,
  MailOutlineRounded,
  MonetizationOnOutlined,
  NotificationsNoneRounded,
  ReceiptLongOutlined,
  SecurityRounded,
  StoreOutlined,
  TollOutlined,
  AccountBalanceWalletOutlined,
  BoltOutlined,
} from '@mui/icons-material';
import { useStores } from '@/stores';
import { paths } from '@/routes/paths';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 88;

type SidebarKey =
  | 'dashboard' | 'finance' | 'activity' | 'token-mgmt' | 'merchant' | 'trx-rent'
  | 'tx-query' | 'risk-tx' | 'collection' | 'placement' | 'partnership'
  | 'reconcile' | 'sell-usdt' | 'notify' | 'op-log' | 'ban-ip' | 'mail-list';

type TopItem = {
  key: SidebarKey;
  label: string;
  Icon: typeof BarChartRounded;
  routes?: { label: string; to: string }[];
};

const topItems: TopItem[] = [
  { key: 'dashboard',  label: '数据看板',         Icon: BarChartRounded },
  { key: 'finance',    label: '财务数据看板',     Icon: AccountBalanceWalletOutlined },
  { key: 'activity',   label: '活动中心',         Icon: CampaignOutlined },
  { key: 'token-mgmt', label: '代币 / 网络管理',  Icon: TollOutlined },
  { key: 'merchant',   label: '商户管理',         Icon: StoreOutlined },
  { key: 'trx-rent',   label: 'TRX 能量租赁',     Icon: BoltOutlined },
  { key: 'tx-query',   label: '交易查询',         Icon: ListAltRounded },
  { key: 'risk-tx',    label: '风控交易管理',     Icon: SecurityRounded },
  {
    key: 'collection',
    label: '归集系统',
    Icon: LayersOutlined,
    routes: [
      { label: '自动归集', to: paths.dashboard.collection.auto },
      { label: '手动归集', to: paths.dashboard.collection.manual },
      { label: '归集任务', to: paths.dashboard.collection.jobs },
    ],
  },
  { key: 'placement',   label: '投放',           Icon: AdsClickRounded },
  { key: 'partnership', label: '推广合作',       Icon: HandshakeOutlined },
  { key: 'reconcile',   label: '对账',           Icon: AssignmentOutlined },
  { key: 'sell-usdt',   label: 'Sell USDT 申请', Icon: MonetizationOnOutlined },
  { key: 'notify',      label: '通知系统',       Icon: NotificationsNoneRounded },
  { key: 'op-log',      label: '运营系统日志',   Icon: DescriptionOutlined },
  { key: 'ban-ip',      label: '封禁 IP',        Icon: BlockRounded },
  { key: 'mail-list',   label: '邮件验证码列表', Icon: MailOutlineRounded },
];

// Suppress unused warning for icons we may swap later in design review.
void ReceiptLongOutlined; void AnnouncementOutlined;

const DashboardSidebar = observer(function DashboardSidebar() {
  const { ui } = useStores();
  const location = useLocation();
  const navigate = useNavigate();

  const isCollectionRoute = location.pathname.startsWith('/dashboard/collection');
  const [openKey, setOpenKey] = useState<SidebarKey | null>(
    isCollectionRoute ? 'collection' : null,
  );

  // Auto-close drawer when route changes on mobile.
  useEffect(() => {
    if (ui.isMobile) ui.closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Inside the mobile drawer the sidebar is always shown full-width; collapse
  // only applies on tablet/desktop.
  const showCollapsed = !ui.isMobile && ui.collapsed;

  const sidebarContent = (
    <Stack
      sx={{
        width: ui.isMobile ? SIDEBAR_WIDTH : showCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: '100vh',
        backgroundColor: 'background.paper',
        transition: 'width .2s ease',
      }}
    >
      {/* Brand row */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: showCollapsed ? 0 : 4,
          py: 4,
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          component="img"
          src={showCollapsed ? '/logo-mark.svg' : '/logo.svg'}
          alt="ccpayment"
          onClick={() => navigate(paths.dashboard.collection.auto)}
          sx={{
            height: showCollapsed ? 32 : 28,
            cursor: 'pointer',
            mx: showCollapsed ? 'auto' : 0,
          }}
        />
        {ui.isMobile && (
          <IconButton size="small" onClick={ui.closeDrawer} aria-label="关闭侧栏">
            <CloseRounded />
          </IconButton>
        )}
      </Stack>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List disablePadding>
          {topItems.map((it) => {
            const isExpandable = !!it.routes;
            const isOpen = openKey === it.key && !showCollapsed;
            const hasActiveChild = isExpandable && isCollectionRoute;

            const button = (
              <ListItemButton
                onClick={() => {
                  if (isExpandable) {
                    if (showCollapsed) {
                      // Collapsed → expand sidebar AND open submenu.
                      ui.toggleSidebar();
                      setOpenKey(it.key);
                    } else {
                      setOpenKey(isOpen ? null : it.key);
                    }
                  }
                  // Non-expandable items are non-interactive in the prototype.
                }}
                selected={hasActiveChild}
                sx={{
                  mx: showCollapsed ? 1 : 2,
                  borderRadius: 2,
                  minHeight: 44,
                  px: showCollapsed ? 1 : 2,
                  justifyContent: showCollapsed ? 'center' : 'flex-start',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(60,111,245,0.08)',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: showCollapsed ? 0 : 36,
                    color: hasActiveChild ? 'primary.main' : 'text.secondary',
                    justifyContent: 'center',
                  }}
                >
                  <it.Icon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                {!showCollapsed && (
                  <>
                    <ListItemText
                      primary={it.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    />
                    {isExpandable && (
                      <Box component="span" sx={{ color: 'text.secondary', display: 'flex' }}>
                        {isOpen ? <ExpandMoreRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}
                      </Box>
                    )}
                  </>
                )}
              </ListItemButton>
            );

            return (
              <Box key={it.key}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  {showCollapsed ? (
                    <Tooltip title={it.label} placement="right">
                      <span>{button}</span>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </ListItem>

                {isExpandable && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {it.routes!.map((r) => {
                        const active = location.pathname === r.to || location.pathname.startsWith(r.to + '/');
                        return (
                          <ListItemButton
                            key={r.to}
                            onClick={() => navigate(r.to)}
                            selected={active}
                            sx={{
                              mx: 2,
                              ml: 6,
                              borderRadius: 2,
                              minHeight: 36,
                              fontSize: 13,
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(60,111,245,0.08)',
                                color: 'primary.main',
                              },
                            }}
                          >
                            <ListItemText
                              primary={r.label}
                              primaryTypographyProps={{
                                fontSize: 13,
                                fontWeight: active ? 600 : 500,
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
    </Stack>
  );

  // Mobile: temporary drawer driven by drawerOpen.
  if (ui.isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={ui.drawerOpen}
        onClose={ui.closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // md+: permanent rail/drawer.
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: showCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: showCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          transition: 'width .2s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
});

export default DashboardSidebar;
export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
