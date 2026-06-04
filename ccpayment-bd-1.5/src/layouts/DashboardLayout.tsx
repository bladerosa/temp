import { Box, Button, Stack } from '@mui/material';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ArrowRight, Download, BarChart3, Users, FileText, ArrowDownToLine, type LucideIcon } from 'lucide-react';
import { useStores } from '@/stores';
import { paths } from '@/routes/paths';

const NAV: Array<{ key: string; label: string; Icon: LucideIcon; active?: boolean }> = [
  { key: 'settlements', label: 'Referral Settlements', Icon: BarChart3, active: true },
  { key: 'merchants', label: 'Merchant List', Icon: Users },
  { key: 'commissions', label: 'Commission Record', Icon: FileText },
  { key: 'withdrawals', label: 'Withdrawal Record', Icon: ArrowDownToLine },
];

export default observer(function DashboardLayout() {
  const { auth } = useStores();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const embedded = params.get('embedded') === '1';

  if (embedded) return <EmbeddedDashboard auth={auth} />;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        bgcolor: '#fff',
      }}
    >
      <Box
        component="aside"
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          p: '24px 20px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '32px' }}>
          <Box
            component="svg"
            viewBox="0 0 32 32"
            fill="none"
            sx={{ flex: 'none', width: 36, height: 36 }}
          >
            <rect x="2" y="2" width="28" height="28" rx="7" fill="#fff" />
            <path
              d="M11 8c-3 2-4 5-4 8s1 6 4 8V8zm10 0v16c3-2 4-5 4-8s-1-6-4-8z"
              fill="#3C6FF5"
            />
          </Box>
          <Box>
            <Box sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              ccpayment
            </Box>
            <Box sx={{ fontSize: 12, opacity: 0.85, mt: '2px' }}>Referral Dashboard</Box>
          </Box>
        </Box>

        <Stack component="nav" spacing={0.5} sx={{ flex: 1 }}>
          {NAV.map(({ key, label, Icon, active }) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                p: '13px 14px',
                borderRadius: '10px',
                color: '#fff',
                fontSize: 14.5,
                fontWeight: active ? 600 : 500,
                opacity: active ? 1 : 0.88,
                cursor: 'pointer',
                bgcolor: active ? 'rgba(255,255,255,0.20)' : 'transparent',
                transition: 'background .12s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.10)', opacity: 1 },
              }}
            >
              <Icon size={20} />
              {label}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: '24px', bgcolor: 'secondary.main', color: 'text.primary', borderRadius: '14px', p: '18px' }}>
          <Box sx={{ fontSize: 14, fontWeight: 700, lineHeight: '20px', mb: '14px' }}>
            Share the Affiliate Program and Earn More Commission.
          </Box>
          <Button
            startIcon={<Download size={16} />}
            sx={{
              bgcolor: 'grey.900',
              color: '#fff',
              p: '10px 14px',
              borderRadius: '10px',
              fontSize: 13,
              fontWeight: 600,
              '&:hover': { bgcolor: 'grey.800' },
            }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: '#fff' }}>
        <Box
          component="header"
          sx={{
            p: '16px 32px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '14px',
            minHeight: 76,
          }}
        >
          <HeaderLink onClick={() => navigate(paths.merchant.bd)}>
            模拟ccpayment商户后台
            <ArrowRight size={14} />
          </HeaderLink>
          <HeaderLink onClick={() => navigate(paths.console.withdrawals)}>
            模拟运营后台
            <ArrowRight size={14} />
          </HeaderLink>
          <Box
            component="button"
            type="button"
            onClick={() => {
              auth.logout();
              navigate(paths.auth.login);
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              p: '6px 16px 6px 6px',
              bgcolor: 'primary.lighter',
              border: 0,
              borderRadius: 9999,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              color: 'text.primary',
              fontWeight: 500,
              '&:hover': { bgcolor: 'rgba(60,111,245,0.16)' },
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 32 32"
              sx={{ width: 32, height: 32, borderRadius: '50%', flex: 'none' }}
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
            <span>{auth.maskedEmail() || 'you@example.com'}</span>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: '16px 32px 40px', bgcolor: 'grey.100' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
});

function HeaderLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        bgcolor: 'transparent',
        border: 0,
        fontFamily: 'inherit',
        fontSize: 13,
        color: 'text.secondary',
        cursor: 'pointer',
        p: '8px 14px',
        borderRadius: '8px',
        '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' },
      }}
    >
      {children}
    </Box>
  );
}

const EmbeddedDashboard = observer(function EmbeddedDashboard({
  auth,
}: {
  auth: ReturnType<typeof useStores>['auth'];
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.100',
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          p: '12px 24px',
          bgcolor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 64,
          flex: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 'none' }}>
          <Box
            component="svg"
            viewBox="0 0 32 32"
            fill="none"
            sx={{ flex: 'none', width: 28, height: 28 }}
          >
            <rect x="2" y="2" width="28" height="28" rx="7" fill="#3C6FF5" />
            <path
              d="M11 8c-3 2-4 5-4 8s1 6 4 8V8zm10 0v16c3-2 4-5 4-8s-1-6-4-8z"
              fill="#fff"
            />
          </Box>
          <Box sx={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            ccpayment
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ flex: 1, overflowX: 'auto' }}>
          {NAV.map(({ key, label, Icon, active }) => (
            <Box
              key={key}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                p: '8px 14px',
                borderRadius: '8px',
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'primary.lighter' : 'transparent',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                '&:hover': { bgcolor: active ? 'primary.lighter' : 'grey.100', color: active ? 'primary.main' : 'text.primary' },
              }}
            >
              <Icon size={16} />
              {label}
            </Box>
          ))}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 'none' }}>
          <Box
            component="button"
            type="button"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              p: '6px 14px 6px 6px',
              bgcolor: 'primary.lighter',
              border: 0,
              borderRadius: 9999,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              color: 'text.primary',
              fontWeight: 500,
              flex: 'none',
              '&:hover': { bgcolor: 'rgba(60,111,245,0.16)' },
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 32 32"
              sx={{ width: 28, height: 28, borderRadius: '50%', flex: 'none' }}
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
            {auth.maskedEmail() || 'you@example.com'}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, p: '16px 24px 40px' }}>
        <Outlet />
      </Box>
    </Box>
  );
});
