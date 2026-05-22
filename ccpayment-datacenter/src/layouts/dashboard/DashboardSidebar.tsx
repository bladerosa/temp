import { useState } from 'react';
import { Box, Drawer, Stack, Tooltip, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { paths } from '@/routes/paths';
import { useStores } from '@/stores';

interface SubItem {
  label: string;
  to?: string;
}
interface NavGroup {
  key: string;
  label: string;
  Icon: LucideIcon;
  subs: SubItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'data',
    label: '数据看板',
    Icon: LayoutDashboard,
    subs: [
      { label: '系统数据', to: paths.dashboard.system },
      { label: '商户数据', to: paths.dashboard.merchant },
    ],
  },
  {
    key: 'finance',
    label: '财务数据看板',
    Icon: LayoutDashboard,
    subs: [
      { label: '财务看板', to: paths.dashboard.finance },
      { label: 'TRX能量收支统计' },
    ],
  },
];

const SECONDARY_ITEMS = [
  '活动中心',
  '代币/网络管理',
  '商户管理',
  'TRX 能量租赁',
  '交易查询',
  '风控交易管理',
  '投放',
  '推广合作',
  '对账',
  'Sell USDT 申请',
  '通知系统',
];

export const SIDEBAR_WIDTH = 232;

export const DashboardSidebar = observer(function DashboardSidebar() {
  const { ui } = useStores();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ data: true, finance: true });

  const isActive = (to: string | undefined) => !!to && pathname.startsWith(to);

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const navContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100vh',
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        px: 3,
        pb: 4,
        overflowY: 'auto',
      }}
    >
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: 1 }}>
        <Box
          component="img"
          src="/logo.svg"
          alt="ccpayment"
          sx={{ height: 26, cursor: 'pointer' }}
          onClick={() => navigate(paths.dashboard.merchant)}
        />
      </Box>

      <Stack spacing={0.5}>
        {NAV_GROUPS.map((group) => {
          const open = !!openGroups[group.key];
          return (
            <Box key={group.key}>
              <Box
                onClick={() => toggleGroup(group.key)}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'grey.700',
                  userSelect: 'none',
                  '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
                }}
              >
                <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{group.label}</Typography>
                <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                  {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Box>
              </Box>
              {open && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pl: 2, my: 0.5 }}>
                  {group.subs.map((sub) => {
                    const active = isActive(sub.to);
                    return (
                      <Box
                        key={sub.label}
                        onClick={() => sub.to && navigate(sub.to)}
                        sx={{
                          height: 34,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2.5,
                          px: 3.5,
                          fontSize: 13,
                          color: active ? 'primary.main' : 'text.secondary',
                          fontWeight: active ? 600 : 400,
                          bgcolor: active ? 'rgba(60,111,245,0.08)' : 'transparent',
                          cursor: sub.to ? 'pointer' : 'default',
                          opacity: sub.to ? 1 : 0.7,
                          '&:hover': sub.to
                            ? { bgcolor: active ? 'rgba(60,111,245,0.08)' : 'grey.100', color: active ? 'primary.main' : 'text.primary' }
                            : undefined,
                        }}
                      >
                        <Box
                          sx={{
                            width: active ? 6 : 4,
                            height: active ? 6 : 4,
                            borderRadius: '50%',
                            bgcolor: 'currentColor',
                            opacity: active ? 1 : 0.55,
                            flexShrink: 0,
                          }}
                        />
                        <span>{sub.label}</span>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}

        {SECONDARY_ITEMS.map((label) => (
          <Box
            key={label}
            sx={{
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              px: 3,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: 'grey.700',
              userSelect: 'none',
              '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
            }}
          >
            <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{label}</Typography>
            <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
              <ChevronRight size={14} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  return (
    <>
      {/* md+ permanent rail */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <Tooltip title="" disableHoverListener>
          {navContent}
        </Tooltip>
      </Box>
      {/* xs/sm temporary drawer */}
      <Drawer
        anchor="left"
        open={ui.drawerOpen}
        onClose={() => ui.setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {navContent}
      </Drawer>
    </>
  );
});
