import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AdsClickRounded,
  AssignmentOutlined,
  BarChartRounded,
  BlockRounded,
  CampaignOutlined,
  ChevronRightRounded,
  CloseRounded,
  DescriptionOutlined,
  ExpandMoreRounded,
  HandshakeOutlined,
  HelpOutlineRounded,
  LayersOutlined,
  ListAltRounded,
  MailOutlineRounded,
  MonetizationOnOutlined,
  NotificationsNoneRounded,
  SecurityRounded,
  StoreOutlined,
  TollOutlined,
  AccountBalanceWalletOutlined,
  BoltOutlined,
} from '@mui/icons-material';
import { useStores } from '@/stores';
import { paths } from '@/routes/paths';

// Sidebar — strict implementation of preview/nav.html + ui_kit Shell.jsx.
//   - 280px expanded, 88px collapsed (icon rail)
//   - Padding: 0 16px 24px (the 16-side padding wraps every row, no global pl)
//   - Logo block: 64h, 26px logo height, 12 top padding
//   - Section label: overline 12, secondary, padding 14/12/6, ALL-CAPS
//   - Nav row: 48h, radius 8, padding 0 16, icon 24, label margin-left 16
//   - Active: rgba(60,111,245,0.08) bg + primary color + medium weight
//   - Hover: #F8F9FB bg + text-primary
//   - Sub-rows: 36h, indent left, primary text when active
//   - Mobile: temporary Drawer with close button in the brand block

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 88;

type SidebarKey =
  | 'dashboard' | 'finance' | 'activity' | 'token-mgmt' | 'merchant' | 'trx-rent'
  | 'tx-query' | 'risk-tx' | 'collection' | 'placement' | 'partnership'
  | 'reconcile' | 'sell-usdt' | 'notify' | 'op-log' | 'ban-ip' | 'mail-list';

type Group = {
  label: string;
  items: TopItem[];
};
type TopItem = {
  key: SidebarKey;
  label: string;
  Icon: typeof BarChartRounded;
  routes?: { label: string; to: string }[];
  badge?: number;
};

// The console's two semantic groups, mirroring "WORKSPACE / MANAGE" in the DS.
const groups: Group[] = [
  {
    label: '工作台',
    items: [
      { key: 'dashboard',  label: '数据看板',         Icon: BarChartRounded },
      { key: 'finance',    label: '财务数据看板',     Icon: AccountBalanceWalletOutlined },
      { key: 'activity',   label: '活动中心',         Icon: CampaignOutlined },
      { key: 'tx-query',   label: '交易查询',         Icon: ListAltRounded },
      { key: 'risk-tx',    label: '风控交易管理',     Icon: SecurityRounded, badge: 4 },
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
      { key: 'reconcile',  label: '对账',            Icon: AssignmentOutlined },
    ],
  },
  {
    label: '运营管理',
    items: [
      { key: 'merchant',    label: '商户管理',         Icon: StoreOutlined },
      { key: 'token-mgmt',  label: '代币 / 网络管理',  Icon: TollOutlined },
      { key: 'trx-rent',    label: 'TRX 能量租赁',     Icon: BoltOutlined },
      { key: 'placement',   label: '投放',            Icon: AdsClickRounded },
      { key: 'partnership', label: '推广合作',         Icon: HandshakeOutlined },
      { key: 'sell-usdt',   label: 'Sell USDT 申请',  Icon: MonetizationOnOutlined },
      { key: 'notify',      label: '通知系统',         Icon: NotificationsNoneRounded },
      { key: 'op-log',      label: '运营系统日志',     Icon: DescriptionOutlined },
      { key: 'ban-ip',      label: '封禁 IP',          Icon: BlockRounded },
      { key: 'mail-list',   label: '邮件验证码列表',   Icon: MailOutlineRounded },
    ],
  },
];

const DashboardSidebar = observer(function DashboardSidebar() {
  const { ui } = useStores();
  const location = useLocation();
  const navigate = useNavigate();

  const isCollectionRoute = location.pathname.startsWith('/dashboard/collection');
  const [openKey, setOpenKey] = useState<SidebarKey | null>(
    isCollectionRoute ? 'collection' : null,
  );

  useEffect(() => {
    if (ui.isMobile) ui.closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Mobile drawer always shows full-width sidebar — collapsed only on tablet/desktop.
  const showCollapsed = !ui.isMobile && ui.collapsed;
  const widthPx = showCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const renderRow = (it: TopItem) => {
    const isExpandable = !!it.routes;
    const isCollection = it.key === 'collection';
    const hasActiveChild = isCollection && isCollectionRoute;
    const isOpen = openKey === it.key && !showCollapsed;
    const labelColor = hasActiveChild ? 'primary.main' : 'grey.700';

    const row = (
      <Box
        onClick={() => {
          if (isExpandable) {
            if (showCollapsed) {
              ui.toggleSidebar();
              setOpenKey(it.key);
            } else {
              setOpenKey(isOpen ? null : it.key);
            }
          }
        }}
        sx={{
          height: 48,
          borderRadius: 2, // 8
          mx: showCollapsed ? 1 : 0, // 4 / 0 (the parent already has 16 horizontal padding)
          px: showCollapsed ? 0 : 4, // 0 / 16
          display: 'flex',
          alignItems: 'center',
          justifyContent: showCollapsed ? 'center' : 'flex-start',
          cursor: isExpandable ? 'pointer' : 'default',
          color: labelColor,
          fontSize: 14,
          fontWeight: hasActiveChild ? 500 : 400,
          transition: 'background 120ms ease-out, color 120ms ease-out',
          bgcolor: hasActiveChild ? 'rgba(60,111,245,0.08)' : 'transparent',
          '&:hover': {
            bgcolor: hasActiveChild ? 'rgba(60,111,245,0.12)' : '#F8F9FB',
            color: hasActiveChild ? 'primary.main' : 'text.primary',
          },
          userSelect: 'none',
        }}
      >
        <it.Icon sx={{ fontSize: 22, color: 'inherit', flexShrink: 0 }} />
        {!showCollapsed && (
          <>
            <Box component="span" sx={{ ml: 4, flex: 1 }}>{it.label}</Box>
            {it.badge != null && (
              <Box
                sx={{
                  height: 24, px: 1, borderRadius: 1.5, // 6
                  bgcolor: 'rgba(60,111,245,0.16)',
                  color: 'primary.main',
                  fontSize: 12, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center',
                  ml: 1, lineHeight: 1,
                }}
              >
                {it.badge}
              </Box>
            )}
            {isExpandable && (
              <Box component="span" sx={{ color: 'text.secondary', display: 'flex', ml: 1 }}>
                {isOpen ? <ExpandMoreRounded sx={{ fontSize: 16 }} /> : <ChevronRightRounded sx={{ fontSize: 16 }} />}
              </Box>
            )}
          </>
        )}
      </Box>
    );

    return (
      <Box key={it.key}>
        {showCollapsed ? (
          <Tooltip title={it.label} placement="right" arrow>
            <span>{row}</span>
          </Tooltip>
        ) : (
          row
        )}
        {isExpandable && !showCollapsed && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Stack sx={{ mt: 0.5, mb: 0.5 }}>
              {it.routes!.map((r) => {
                const active = location.pathname === r.to || location.pathname.startsWith(r.to + '/');
                return (
                  <Box
                    key={r.to}
                    onClick={() => navigate(r.to)}
                    sx={{
                      height: 36,
                      borderRadius: 2,
                      pl: 11, // align label with parent label (16 padding + 22 icon + 16 margin = ~54px ≈ pl 11*4=44; then text indent 10)
                      pr: 4,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? 'primary.main' : 'grey.700',
                      bgcolor: active ? 'rgba(60,111,245,0.08)' : 'transparent',
                      transition: 'background 120ms',
                      position: 'relative',
                      '&:hover': {
                        bgcolor: active ? 'rgba(60,111,245,0.12)' : '#F8F9FB',
                      },
                      // small leading dot indicator
                      '&::before': {
                        content: '""',
                        width: 4, height: 4, borderRadius: '50%',
                        bgcolor: active ? 'primary.main' : 'grey.400',
                        mr: 2,
                        flexShrink: 0,
                      },
                    }}
                  >
                    {r.label}
                  </Box>
                );
              })}
            </Stack>
          </Collapse>
        )}
      </Box>
    );
  };

  const sidebarBody = (
    <Stack
      sx={{
        width: ui.isMobile ? SIDEBAR_WIDTH : widthPx,
        height: '100%',
        bgcolor: 'background.paper',
        transition: 'width .2s ease',
      }}
    >
      {/* Brand row — 64h, logo 26 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          height: 64,
          flexShrink: 0,
          px: showCollapsed ? 0 : 4, // 0 / 16
          pt: 3, // 12
        }}
      >
        <Box
          component="img"
          src={showCollapsed ? '/logo-mark.svg' : '/logo.svg'}
          alt="ccpayment"
          onClick={() => navigate(paths.dashboard.collection.auto)}
          sx={{
            height: showCollapsed ? 32 : 26,
            cursor: 'pointer',
            mx: showCollapsed ? 'auto' : 0,
          }}
        />
        {ui.isMobile && (
          <IconButton size="small" onClick={ui.closeDrawer} aria-label="关闭侧栏">
            <CloseRounded sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Stack>

      {/* Merchant card — only when expanded; mirrors nav.html */}
      {!showCollapsed && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mx: 4, mt: 2, // 16 / 8
            height: 64,
            borderRadius: 3, // 12
            bgcolor: 'grey.100',
            px: 4, // 16
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #8B5CF6, #6D28D9)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', flexShrink: 0,
                '&::after': {
                  content: '""',
                  position: 'absolute', right: -2, bottom: -2,
                  width: 16, height: 16, borderRadius: '50%',
                  bgcolor: 'success.main',
                  border: '1.5px solid #fff',
                  boxSizing: 'border-box',
                },
              }}
            >
              CC
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>CCPayment</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1, mt: 0.5 }}>m_8f2a91c</Typography>
            </Box>
          </Stack>
          <ChevronRightRounded sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
        </Stack>
      )}

      {/* Nav scrollable area */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: showCollapsed ? 0 : 4, pb: 6, pt: 1 }}>
        {groups.map((g, gi) => (
          <Box key={g.label} sx={{ mt: gi === 0 ? 1 : 2 }}>
            {!showCollapsed && (
              <Typography
                sx={{
                  fontSize: 12,
                  lineHeight: '16px',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '1.1px',
                  px: 4, // 16 to align with row
                  pt: '14px',
                  pb: '6px',
                }}
              >
                {g.label}
              </Typography>
            )}
            <Stack gap={0.5}>{g.items.map(renderRow)}</Stack>
          </Box>
        ))}
      </Box>

      {/* Bottom Help & fees row */}
      {!showCollapsed && (
        <Box
          sx={{
            mx: 4, mb: 4, mt: 1,
            px: 2, py: 1.5,
            display: 'inline-flex', alignItems: 'center', gap: 1.5,
            color: 'grey.700',
            fontSize: 13,
            cursor: 'pointer',
            borderRadius: 2,
            '&:hover': { bgcolor: '#F8F9FB' },
          }}
        >
          <HelpOutlineRounded sx={{ fontSize: 16 }} />
          帮助 & 费率
        </Box>
      )}
    </Stack>
  );

  if (ui.isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={ui.drawerOpen}
        onClose={ui.closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' } }}
      >
        {sidebarBody}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: widthPx,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: widthPx,
          boxSizing: 'border-box',
          transition: 'width .2s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {sidebarBody}
    </Drawer>
  );
});

export default DashboardSidebar;
