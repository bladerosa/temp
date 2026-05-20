import { Box, Stack, Typography } from '@mui/material';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@/data/mockData';
import { useStores } from '@/stores';
import { PATHS, stubPath } from '@/routes/paths';

const SIDEBAR_WIDTH = 220;

function pathForKey(key: string): string {
  if (key === 'sell-usdt') return PATHS.sellUsdt;
  if (key === 'merchant-list') return PATHS.merchantDetail;
  return stubPath(key);
}

function keyForPath(pathname: string): string {
  if (pathname.startsWith(PATHS.sellUsdt)) return 'sell-usdt';
  if (pathname.startsWith(PATHS.merchantDetail)) return 'merchant-list';
  const m = pathname.match(/^\/dashboard\/stub\/(.+)$/);
  return m ? m[1] : '';
}

export const DashboardSidebar = observer(function DashboardSidebar() {
  const { ui } = useStores();
  const location = useLocation();
  const navigate = useNavigate();
  const current = keyForPath(location.pathname);

  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        pb: 6,
        overflowY: 'auto',
        height: '100vh',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.08)',
          borderRadius: 4,
        },
      }}
    >
      <Box
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          px: 5,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="/logo.svg"
          alt="CCPayment"
          sx={{ height: 24, display: 'block' }}
        />
      </Box>

      {NAV_ITEMS.map((it) => {
        if (it.children) {
          const isOpen = ui.isGroupExpanded(it.key);
          const childActive = it.children.some((c) => c.key === current);
          return (
            <Box key={it.key}>
              <NavRow
                label={it.label}
                active={childActive && !isOpen}
                onClick={() => ui.toggleGroup(it.key)}
                trailing={isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              />
              {isOpen && (
                <Stack sx={{ py: 1 }}>
                  {it.children.map((c) => {
                    const isActive = current === c.key;
                    return (
                      <Box
                        key={c.key}
                        onClick={() => navigate(pathForKey(c.key))}
                        sx={{
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2.5,
                          pl: 9,
                          pr: 5,
                          color: isActive ? 'primary.main' : 'grey.700',
                          fontWeight: isActive ? 500 : 400,
                          fontSize: 13,
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'background 120ms ease-out, color 120ms ease-out',
                          '&:hover': { bgcolor: '#F4F6FA' },
                        }}
                      >
                        <Box
                          sx={{
                            width: isActive ? 8 : 6,
                            height: isActive ? 8 : 6,
                            borderRadius: isActive ? '1.5px' : '50%',
                            bgcolor: isActive ? 'primary.main' : 'grey.400',
                            transform: isActive ? 'rotate(45deg)' : 'none',
                            flexShrink: 0,
                          }}
                        />
                        <span>{c.label}</span>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          );
        }
        return (
          <NavRow
            key={it.key}
            label={it.label}
            active={current === it.key}
            onClick={() => navigate(pathForKey(it.key))}
            trailing={it.hasChev ? <ChevronRight size={16} /> : null}
          />
        );
      })}
    </Box>
  );
});

function NavRow(props: {
  label: string;
  active?: boolean;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) {
  const { label, active, trailing, onClick } = props;
  return (
    <Box
      onClick={onClick}
      sx={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 5,
        color: active ? 'primary.main' : 'grey.700',
        fontWeight: active ? 500 : 400,
        bgcolor: active ? 'rgba(60,111,245,0.08)' : 'transparent',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 120ms ease-out, color 120ms ease-out',
        '&:hover': { bgcolor: active ? 'rgba(60,111,245,0.08)' : '#F4F6FA' },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: 13,
          fontWeight: 'inherit',
          color: 'inherit',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Typography>
      {trailing && (
        <Box
          sx={{
            display: 'inline-flex',
            color: active ? 'primary.main' : 'grey.400',
            opacity: active ? 0.6 : 1,
            ml: 2,
            flexShrink: 0,
          }}
        >
          {trailing}
        </Box>
      )}
    </Box>
  );
}
