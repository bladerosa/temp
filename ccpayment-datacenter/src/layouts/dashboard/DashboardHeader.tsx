import { Box, IconButton, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { HelpCircle, Menu as MenuIcon, RefreshCw, Settings } from 'lucide-react';
import { useStores } from '@/stores';

const CRUMBS: Record<string, string[]> = {
  '/dashboard/merchant': ['数据看板', '商户数据'],
  '/dashboard/merchant/detail': ['数据看板', '商户数据', '查看交易统计'],
  '/dashboard/merchant/aggregation-fee-detail': ['数据看板', '商户数据', '用户支付归集费明细'],
  '/dashboard/merchant/service-fee-detail': ['数据看板', '商户数据', '用户支付充值服务费明细'],
  '/dashboard/merchant/swap-fee-detail': ['数据看板', '商户数据', '用户支付换币服务费明细'],
  '/dashboard/finance': ['财务数据看板', '财务看板'],
  '/dashboard/system': ['数据看板', '系统数据'],
};

export const DashboardHeader = observer(function DashboardHeader() {
  const { ui } = useStores();
  const { pathname } = useLocation();
  const crumbs = CRUMBS[pathname] ?? ['数据看板'];

  return (
    <Box
      data-no-print="1"
      sx={{
        height: 56,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        px: 6,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <IconButton
        sx={{ display: { xs: 'inline-flex', md: 'none' }, width: 32, height: 32 }}
        onClick={() => ui.setDrawerOpen(true)}
      >
        <MenuIcon size={18} />
      </IconButton>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        {crumbs.map((c, i) => (
          <Stack key={i} direction="row" spacing={1.5} alignItems="center">
            {i > 0 && <span style={{ color: '#71757E', opacity: 0.5 }}>/</span>}
            <Typography
              sx={{
                fontSize: 13,
                color: i === crumbs.length - 1 ? 'text.primary' : 'text.secondary',
                fontWeight: i === crumbs.length - 1 ? 500 : 400,
              }}
            >
              {c}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <IconButton size="small" title="刷新" sx={{ width: 32, height: 32, color: 'grey.700' }}>
        <RefreshCw size={16} />
      </IconButton>
      <IconButton size="small" title="帮助" sx={{ width: 32, height: 32, color: 'grey.700' }}>
        <HelpCircle size={18} />
      </IconButton>
      <IconButton size="small" title="设置" sx={{ width: 32, height: 32, color: 'grey.700' }}>
        <Settings size={18} />
      </IconButton>

      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        YJ
      </Box>
    </Box>
  );
});
