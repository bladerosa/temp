import { Box, Stack } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import type { ToastTone } from '@/stores/ToastStore';
import { useStores } from '@/stores';

const ICON: Record<ToastTone, { Icon: typeof CheckCircle2; bg: string; fg: string }> = {
  success: { Icon: CheckCircle2, bg: 'rgba(67,190,118,0.16)', fg: '#218861' },
  info: { Icon: Info, bg: 'rgba(101,174,232,0.16)', fg: '#3767A3' },
  warning: { Icon: AlertTriangle, bg: 'rgba(231,178,43,0.16)', fg: '#AC7C1F' },
  error: { Icon: XCircle, bg: 'rgba(236,104,76,0.16)', fg: '#A92926' },
};

export const ToastHost = observer(function ToastHost() {
  const { toast } = useStores();
  return (
    <Stack
      spacing="12px"
      sx={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1500,
        pointerEvents: 'none',
      }}
    >
      {toast.toasts.map((t) => {
        const c = ICON[t.tone];
        return (
          <Box
            key={t.id}
            sx={{
              width: 420,
              maxWidth: 'calc(100vw - 32px)',
              minHeight: 64,
              borderRadius: '8px',
              p: '12px',
              gap: '12px',
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#fff',
              boxShadow: '0 8px 16px 0 rgba(145,158,171,0.16)',
              pointerEvents: 'auto',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: c.bg,
                color: c.fg,
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <c.Icon size={20} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 700, lineHeight: '22px' }}>
                {t.title}
              </Box>
              {t.desc && (
                <Box sx={{ fontSize: 13, lineHeight: '18px', color: 'text.secondary', mt: '2px' }}>
                  {t.desc}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
});
