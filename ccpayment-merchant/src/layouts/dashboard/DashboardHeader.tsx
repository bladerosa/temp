import { useLocation } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Bell, BookOpen, Globe, PanelLeftClose, Settings, Volume2 } from 'lucide-react';
import { PATHS } from '@/routes/paths';

function AppbarIconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <IconButton aria-label={label} sx={{ width: 40, height: 40, color: 'grey.700' }}>
      {children}
    </IconButton>
  );
}

export function DashboardHeader() {
  const { pathname } = useLocation();
  const isDeveloper = pathname.startsWith(PATHS.developer);

  return (
    <Box
      component="header"
      sx={{
        height: 96,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        p: '0 40px 0 4px',
        gap: '14px',
      }}
    >
      <IconButton
        aria-label="Collapse"
        sx={{
          width: 38,
          height: 38,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'grey.600',
          flexShrink: 0,
        }}
      >
        <PanelLeftClose size={20} strokeWidth={1.8} />
      </IconButton>

      <Box sx={{ flex: 1 }} />

      <AppbarIconButton label="Settings">
        <Settings size={24} strokeWidth={1.7} />
      </AppbarIconButton>

      <AppbarIconButton label="Notifications">
        <Badge
          badgeContent={1}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: 'error.main',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              border: '2px solid #fff',
              top: 2,
              right: 2,
            },
          }}
        >
          <Bell size={24} strokeWidth={1.7} />
        </Badge>
      </AppbarIconButton>

      {isDeveloper && (
        <AppbarIconButton label="Announcements">
          <Volume2 size={24} strokeWidth={1.7} />
        </AppbarIconButton>
      )}

      <AppbarIconButton label="Language">
        <Globe size={24} strokeWidth={1.7} />
      </AppbarIconButton>

      {isDeveloper && (
        <AppbarIconButton label="Docs">
          <BookOpen size={24} strokeWidth={1.7} />
        </AppbarIconButton>
      )}

      {/* Account chip */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          height: 56,
          p: '6px 22px 6px 8px',
          borderRadius: '30px',
          bgcolor: 'primary.lighter',
          cursor: 'pointer',
          ml: 2,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 26, height: 26, fill: 'none' }}>
            <circle cx="9" cy="10" r="1.4" fill="#fff" />
            <circle cx="15" cy="10" r="1.4" fill="#fff" />
            <path d="M8.5 14.5c1 1.2 2 1.8 3.5 1.8s2.5-.6 3.5-1.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2, color: 'text.primary' }}>
            San***gmail.com
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'grey.600', mt: '3px' }}>Role: Owner</Typography>
        </Box>
      </Box>
    </Box>
  );
}
