import { Box, Drawer, Tooltip, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Code,
  CreditCard,
  FileText,
  LayoutGrid,
  PieChart,
  Receipt,
  Share2,
  ShieldCheck,
  Star,
  Store,
  Users,
  Wallet,
  Webhook,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

export const SIDEBAR_WIDTH = 236;
export const SIDEBAR_COLLAPSED_WIDTH = 88;

interface NavItem {
  label: string;
  Icon: LucideIcon;
  /** 有 `to` 才是本项目已实现的路由；其余为原型里的占位入口。 */
  to?: string;
  /** 原型里带右侧 `›` 的可展开分组。 */
  expandable?: boolean;
}

/** 侧边栏条目顺序与原型 `Risk Transactions.dc.html` 一致。 */
const NAV_ITEMS: NavItem[] = [
  { label: '儀表板', Icon: LayoutGrid },
  { label: '福利中心', Icon: Star },
  { label: '交易', Icon: ArrowLeftRight, to: paths.dashboard.riskTransactions },
  { label: '發票收據', Icon: Receipt },
  { label: '美元出金', Icon: CreditCard },
  { label: 'API 訂單', Icon: FileText, expandable: true },
  { label: '餘額', Icon: Wallet, expandable: true },
  { label: '用戶資產', Icon: Users, expandable: true },
  { label: '商家設定', Icon: Store, expandable: true },
  { label: '財務對帳', Icon: PieChart, expandable: true },
  { label: '開發人員', Icon: Code },
  { label: 'Webhook', Icon: Webhook },
  { label: '提款批准', Icon: ShieldCheck, expandable: true },
  { label: '聯盟計畫', Icon: Share2 },
];

function MerchantCard() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        px: 3,
        py: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        mb: 5,
        cursor: 'pointer',
      }}
    >
      <Box sx={{ position: 'relative', flex: '0 0 36px' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'grey.200',
            color: 'grey.600',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          mo
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: -1,
            bottom: -1,
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: 'success.main',
            border: '2px solid',
            borderColor: 'background.paper',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            lineHeight: 1,
          }}
        >
          V
        </Box>
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
          momo（0fee
        </Typography>
        <Typography sx={{ fontSize: 12, lineHeight: '16px', color: 'text.secondary' }}>
          ID: 27849
        </Typography>
      </Box>
      <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
        <ChevronDown size={18} />
      </Box>
    </Box>
  );
}

export const DashboardSidebar = observer(function DashboardSidebar() {
  const { ui } = useStores();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /** `collapsed` 只作用于 md+ 的常驻侧边栏；临时抽屉永远展开。 */
  const renderContent = (collapsed: boolean) => (
    <Box
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        px: 3,
        pb: 6,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Box
        onClick={() => navigate(paths.dashboard.riskTransactions)}
        sx={{
          height: 64,
          flex: '0 0 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: 2,
          cursor: 'pointer',
        }}
      >
        <Box
          component="img"
          src={collapsed ? '/logo-mark.svg' : '/logo.svg'}
          alt="ccpayment"
          sx={{ height: 26, display: 'block' }}
        />
      </Box>

      {!collapsed && <MerchantCard />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: collapsed ? 5 : 0 }}>
        {NAV_ITEMS.map(({ label, Icon, to, expandable }) => {
          const active = !!to && pathname.startsWith(to);
          const row = (
            <Box
              onClick={() => {
                if (to) {
                  navigate(to);
                  ui.setDrawerOpen(false);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 3,
                px: 3,
                py: 2.5,
                borderRadius: 2,
                cursor: 'pointer',
                color: active ? 'primary.main' : 'text.secondary',
                fontWeight: active ? 600 : 500,
                bgcolor: active ? 'primary.lighter' : 'transparent',
                '&:hover': active ? undefined : { bgcolor: 'grey.100', color: 'text.primary' },
              }}
            >
              <Box sx={{ display: 'inline-flex', flex: '0 0 22px' }}>
                <Icon size={22} strokeWidth={active ? 1.7 : 1.6} />
              </Box>
              {!collapsed && (
                <>
                  <Typography
                    sx={{ flex: 1, fontSize: 14, fontWeight: 'inherit', color: 'inherit', lineHeight: '20px' }}
                  >
                    {label}
                  </Typography>
                  {expandable && (
                    <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
                      <ChevronRight size={16} strokeWidth={2} />
                    </Box>
                  )}
                </>
              )}
            </Box>
          );

          return collapsed ? (
            <Tooltip key={label} title={label} placement="right">
              {row}
            </Tooltip>
          ) : (
            <Box key={label}>{row}</Box>
          );
        })}
      </Box>
    </Box>
  );

  const width = ui.collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'block' }, flex: `0 0 ${width}px` }}>
        <Box sx={{ position: 'sticky', top: 0 }}>{renderContent(ui.collapsed)}</Box>
      </Box>

      <Drawer
        open={ui.drawerOpen}
        onClose={() => ui.setDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: 0 } }}
      >
        {renderContent(false)}
      </Drawer>
    </>
  );
});
