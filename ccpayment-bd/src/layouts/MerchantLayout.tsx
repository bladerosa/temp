import { Box, IconButton, Stack } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  Code2,
  FileBarChart2,
  Gift,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Menu as MenuIcon,
  Receipt,
  Settings,
  ShieldCheck,
  Smile,
  Wallet,
  Webhook,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/routes/paths';

interface NavItem {
  label: string;
  Icon: LucideIcon;
  caret?: boolean;
  active?: boolean;
}
const NAV: NavItem[] = [
  { label: '儀表板', Icon: LayoutDashboard },
  { label: '福利中心', Icon: Gift },
  { label: '交易', Icon: FileBarChart2 },
  { label: 'API 訂單', Icon: Code2 },
  { label: '發票收據', Icon: Receipt },
  { label: '餘額', Icon: Wallet, caret: true },
  { label: '用戶資產', Icon: Users, caret: true },
  { label: '商家設定', Icon: Settings, caret: true },
  { label: '開發人員', Icon: Code2 },
  { label: 'Webhook', Icon: Webhook },
  { label: '提款批准', Icon: ShieldCheck, caret: true },
  { label: 'BD推广', Icon: Megaphone, active: true },
];

export default function MerchantLayout() {
  const navigate = useNavigate();
  const onBack = () => navigate(paths.promoter.settlements);
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
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
          sx={{ p: '20px 22px 12px' }}
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
            <MenuIcon size={18} />
          </IconButton>
        </Stack>

        <Box
          sx={{
            m: '4px 16px 12px',
            p: '12px 14px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              flex: 'none',
              borderRadius: '50%',
              background:
                'conic-gradient(from -90deg, #EA4335 0% 25%, #FBBC05 25% 50%, #34A853 50% 75%, #4285F4 75% 100%)',
              display: 'grid',
              placeItems: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                width: 12,
                height: 12,
                bgcolor: '#fff',
                borderRadius: '50%',
              },
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '18px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Yuutest.Ltd
            </Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary', mt: '2px' }}>ID: 17650</Box>
          </Box>
          <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
            <ChevronDown size={16} />
          </Box>
        </Box>

        <Box
          component="nav"
          sx={{
            flex: 1,
            p: '8px 12px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { background: '#E8ECF2', borderRadius: 3 },
          }}
        >
          {NAV.map(({ label, Icon, caret, active }) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                p: '11px 14px',
                borderRadius: '10px',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                bgcolor: active ? 'primary.lighter' : 'transparent',
                color: active ? 'primary.main' : 'text.primary',
                '&:hover': { bgcolor: active ? 'primary.lighter' : 'grey.100' },
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  flex: 'none',
                  display: 'grid',
                  placeItems: 'center',
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                <Icon size={18} />
              </Box>
              <Box sx={{ flex: 1 }}>{label}</Box>
              {caret && (
                <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                  <ChevronRight size={16} />
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            p: '14px 22px 18px',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: 13,
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <HelpCircle size={16} /> 手續費查詢
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <Box
          component="header"
          sx={{
            p: '14px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#fff',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
              color: 'text.primary',
              '&:hover': { bgcolor: 'grey.100' },
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <IconButton sx={{ width: 38, height: 38, color: 'text.secondary' }} aria-label="Language">
            <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20 }} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15 15 0 0 1 0 20" />
              <path d="M12 2a15 15 0 0 0 0 20" />
            </Box>
          </IconButton>
          <Box sx={{ position: 'relative' }}>
            <IconButton sx={{ width: 38, height: 38, color: 'text.secondary' }} aria-label="Notifications">
              <Bell size={20} />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                minWidth: 18,
                height: 18,
                px: '4px',
                bgcolor: 'error.main',
                color: '#fff',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
                lineHeight: 1,
              }}
            >
              10
            </Box>
          </Box>
          <Box
            component="button"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              p: '4px 14px 4px 4px',
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: 9999,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'secondary.light',
                display: 'grid',
                placeItems: 'center',
                color: 'text.primary',
              }}
            >
              <Smile size={22} />
            </Box>
            <Box sx={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Box sx={{ fontSize: 14, fontWeight: 600 }}>yuu</Box>
              <Box sx={{ fontSize: 11, color: 'text.secondary' }}>職位: Owner</Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, bgcolor: 'grey.100' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
