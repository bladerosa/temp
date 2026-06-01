import { Box, IconButton, Stack } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronDown, Menu as MenuIcon, Settings } from 'lucide-react';
import { paths } from '@/routes/paths';

interface NavItem {
  label: string;
  hasCaret?: boolean;
}
const NAV_ITEMS: NavItem[] = [
  { label: '数据看板', hasCaret: true },
  { label: '财务数据看板', hasCaret: true },
  { label: '活动中心', hasCaret: true },
  { label: '换币业务', hasCaret: true },
  { label: '代币/网络管理', hasCaret: true },
  { label: '商户管理', hasCaret: true },
  { label: 'TRX 能量租赁' },
  { label: '交易查询', hasCaret: true },
  { label: '风控交易管理', hasCaret: true },
  { label: '归集系统', hasCaret: true },
  { label: '投放' },
];
const TAIL_ITEMS: NavItem[] = [
  { label: '对账', hasCaret: true },
  { label: 'Sell USDT 申请' },
  { label: '通知系统', hasCaret: true },
  { label: '运营系统日志' },
  { label: '封禁IP' },
  { label: '邮件验证码列表' },
];

export default function ConsoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        bgcolor: 'grey.100',
      }}
    >
      <Box
        component="aside"
        sx={{
          bgcolor: '#fff',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: '22px 24px 18px' }}
        >
          <Box
            component="svg"
            viewBox="0 0 301 53"
            xmlns="http://www.w3.org/2000/svg"
            sx={{ width: 148, height: 26, flex: 'none' }}
          >
            <g fill="#3C6FF5">
              <rect x="0" y="0" width="53" height="53" rx="12" />
              <path
                d="M19 13c-4 3-6 8-6 14s2 11 6 14V13zm15 0v28c4-3 6-8 6-14s-2-11-6-14z"
                fill="#fff"
              />
            </g>
            <g fill="#0F172A">
              <text
                x="68"
                y="36"
                fontFamily="Poppins, system-ui"
                fontWeight="700"
                fontSize="30"
                letterSpacing="-0.6"
              >
                ccpayment
              </text>
            </g>
          </Box>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MenuIcon size={20} />
          </IconButton>
        </Stack>

        <Box
          component="nav"
          sx={{
            flex: 1,
            p: '4px 12px 24px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { background: '#E8ECF2', borderRadius: 3 },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '14px 16px',
                borderRadius: '10px',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <span>推广合作</span>
              <ChevronDown size={16} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: '2px', pb: '4px' }}>
              {[
                { label: '推广者列表', path: paths.console.promoters },
                { label: '提现审批', path: paths.console.withdrawals },
              ].map(({ label, path }) => {
                const active = location.pathname === path;
                return (
                  <Box
                    key={path}
                    component="button"
                    type="button"
                    onClick={() => navigate(path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      p: '11px 16px 11px 28px',
                      fontSize: 14.5,
                      color: active ? 'text.primary' : 'text.secondary',
                      border: 0,
                      background: 'transparent',
                      borderRadius: '10px',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      '&:hover': { color: 'text.primary', bgcolor: 'grey.100' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        transform: 'rotate(45deg)',
                        bgcolor: active ? 'primary.main' : 'text.disabled',
                        flex: 'none',
                      }}
                    />
                    {label}
                  </Box>
                );
              })}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  p: '11px 16px 11px 28px',
                  fontSize: 14.5,
                  color: 'text.secondary',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderRadius: '10px',
                  '&:hover': { color: 'text.primary', bgcolor: 'grey.100' },
                }}
              >
                <Box sx={{ width: 8, height: 8, transform: 'rotate(45deg)', bgcolor: 'text.disabled', flex: 'none' }} />
                佣金结算记录
              </Box>
            </Box>
          </Box>

          {TAIL_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <Box
          component="header"
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <IconButton
            size="small"
            onClick={() => navigate(paths.promoter.settlements)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
              color: 'text.primary',
              '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.300' },
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <IconButton sx={{ width: 36, height: 36, color: 'text.secondary' }} aria-label="设置">
            <Settings size={20} />
          </IconButton>
          <Box
            component="svg"
            viewBox="0 0 32 32"
            sx={{ width: 36, height: 36, borderRadius: '50%', flex: 'none' }}
          >
            <circle cx="16" cy="16" r="16" fill="#3C6FF5" />
            <circle cx="12" cy="14" r="1.6" fill="#fff" />
            <circle cx="20" cy="14" r="1.6" fill="#fff" />
            <path
              d="M11 20c1.2 1.4 2.9 2.2 5 2.2s3.8-.8 5-2.2"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: '28px 32px 32px', minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function NavRow({ item }: { item: NavItem }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        p: '14px 16px',
        borderRadius: '10px',
        fontSize: 15,
        color: 'text.primary',
        fontWeight: 500,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'grey.100' },
      }}
    >
      <span>{item.label}</span>
      {item.hasCaret && (
        <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
          <ChevronRight size={16} />
        </Box>
      )}
    </Box>
  );
}
