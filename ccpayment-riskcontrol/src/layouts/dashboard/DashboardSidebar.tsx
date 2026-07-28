import { useState } from 'react';
import { Box, Drawer, Stack, Tooltip, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, HelpCircle, ShieldAlert, type LucideIcon } from 'lucide-react';
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
    key: 'risk',
    label: '风控交易管理',
    Icon: ShieldAlert,
    subs: [
      { label: '风控交易管理', to: paths.dashboard.riskControl },
      { label: '风险资产处置' },
    ],
  },
];

export const SIDEBAR_WIDTH = 232;

export const DashboardSidebar = observer(function DashboardSidebar() {
  const { ui } = useStores();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ risk: true });

  const isActive = (to: string | undefined) => !!to && pathname.startsWith(to);

  const toggleGroup = (key: string) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

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
          onClick={() => navigate(paths.dashboard.riskControl)}
        />
      </Box>

      <Stack spacing={0.5}>
        {NAV_GROUPS.map((group) => {
          const open = !!openGroups[group.key];
          const GroupIcon = group.Icon;
          return (
            <Box key={group.key}>
              <Box
                onClick={() => toggleGroup(group.key)}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  cursor: 'pointer',
                  color: 'text.primary',
                  userSelect: 'none',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>
                  <GroupIcon size={18} />
                </Box>
                <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{group.label}</Typography>
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
                          cursor: sub.to ? 'pointer' : 'not-allowed',
                          opacity: sub.to ? 1 : 0.6,
                          '&:hover': sub.to
                            ? {
                                bgcolor: active ? 'rgba(60,111,245,0.08)' : 'grey.100',
                                color: active ? 'primary.main' : 'text.primary',
                              }
                            : undefined,
                        }}
                      >
                        <Box
                          sx={{
                            width: active ? 6 : 5,
                            height: active ? 6 : 5,
                            borderRadius: active ? '2px' : '50%',
                            transform: active ? 'rotate(45deg)' : 'none',
                            bgcolor: active ? 'currentColor' : 'grey.300',
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
      </Stack>

      <Box sx={{ flex: 1 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          pt: 2,
          mt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          color: 'grey.500',
          fontSize: 13,
          cursor: 'pointer',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <HelpCircle size={16} />
        <span>帮助中心 &amp; 费用</span>
      </Box>
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
