import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NAV_ITEMS, type NavItem } from '@/data/nav';
import { PATHS } from '@/routes/paths';

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.path && pathname.startsWith(item.path)) return true;
  return Boolean(item.children?.some((c) => c.path && pathname.startsWith(c.path)));
}

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand a group whose child route is active (e.g. arriving at Settings).
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((c) => c.path && pathname.startsWith(c.path))) {
        setExpanded((prev) => ({ ...prev, [item.key]: true }));
      }
    });
  }, [pathname]);

  return (
    <Box
      component="aside"
      sx={{
        width: 288,
        flexShrink: 0,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        p: '0 16px 24px',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 96,
          right: 0,
          bottom: 0,
          width: '1px',
          bgcolor: 'divider',
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ height: 88, display: 'flex', alignItems: 'center', pl: '6px', flexShrink: 0 }}>
        <Box
          component="img"
          src="/logo-withfont.svg"
          alt="ccpayment"
          sx={{ height: 30, display: 'block', cursor: 'pointer' }}
          onClick={() => navigate(PATHS.dashboard)}
        />
      </Box>

      {/* Merchant card */}
      <Box
        sx={{
          height: 72,
          borderRadius: '14px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: '14px',
          boxShadow: '0 1px 2px 0 rgba(113,117,126,0.12)',
          cursor: 'pointer',
          mb: '18px',
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', position: 'relative', flexShrink: 0 }}>
          <Box component="img" src="/avatar-merchant.svg" alt="" sx={{ width: 44, height: 44, borderRadius: '12px', display: 'block' }} />
          <Box
            sx={{
              position: 'absolute',
              right: -3,
              bottom: -3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              color: '#2F4011',
              display: 'grid',
              placeItems: 'center',
              fontSize: 10,
              fontWeight: 700,
              border: '2px solid #fff',
            }}
          >
            V
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, color: 'text.primary' }}>San***</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: '3px' }}>ID: 123456</Typography>
        </Box>
        <Box sx={{ ml: 'auto', color: 'grey.400', display: 'inline-flex' }}>
          <ChevronDown size={20} />
        </Box>
      </Box>

      {/* Nav */}
      <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item, pathname);
          const isExpanded = Boolean(item.children && (expanded[item.key] || isItemActive(item, pathname)));
          const { Icon } = item;
          return (
            <Box key={item.key}>
              <Box
                onClick={() => {
                  if (item.children) setExpanded((prev) => ({ ...prev, [item.key]: !isExpanded }));
                  else if (item.path) navigate(item.path);
                }}
                sx={{
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  px: '14px',
                  color: active ? 'primary.main' : 'grey.700',
                  bgcolor: active ? 'rgba(60,111,245,0.08)' : 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 14,
                  lineHeight: '22px',
                  fontWeight: active ? 500 : 400,
                  transition: 'background 120ms ease-out, color 120ms ease-out',
                  '&:hover': { bgcolor: active ? 'rgba(60,111,245,0.08)' : 'grey.100', color: active ? 'primary.main' : 'text.primary' },
                }}
              >
                <Box sx={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} strokeWidth={1.7} />
                </Box>
                <Box sx={{ flex: 1 }}>{item.label}</Box>
                {(item.arrow || item.children) && (
                  <Box
                    sx={{
                      color: 'grey.400',
                      display: 'inline-flex',
                      transition: 'transform 120ms ease-out',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                    }}
                  >
                    <ChevronRight size={18} />
                  </Box>
                )}
              </Box>

              {item.children && isExpanded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', p: '2px 0 6px' }}>
                  {item.children.map((child) => {
                    const childActive = Boolean(child.path && pathname.startsWith(child.path));
                    return (
                      <Box
                        key={child.key}
                        onClick={() => child.path && navigate(child.path)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          height: 42,
                          p: '0 14px 0 24px',
                          ml: '14px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          color: childActive ? 'primary.main' : 'grey.700',
                          fontSize: 14,
                          lineHeight: '22px',
                          fontWeight: childActive ? 500 : 400,
                          transition: 'background 120ms, color 120ms',
                          '&:hover': { bgcolor: 'grey.100', color: childActive ? 'primary.main' : 'text.primary' },
                        }}
                      >
                        <Box
                          sx={{
                            width: childActive ? 9 : 6,
                            height: childActive ? 9 : 6,
                            borderRadius: childActive ? '3px' : '50%',
                            bgcolor: childActive ? 'primary.main' : 'grey.300',
                            transform: childActive ? 'rotate(45deg)' : 'none',
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>{child.label}</Box>
                        {child.badge && (
                          <Box
                            sx={{
                              minWidth: 20,
                              height: 20,
                              px: '6px',
                              borderRadius: '6px',
                              bgcolor: 'secondary.lighter',
                              color: 'secondary.darker',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            {child.badge}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
