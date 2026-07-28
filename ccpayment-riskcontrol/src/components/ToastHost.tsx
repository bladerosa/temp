import { Box, IconButton, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useStores } from '@/stores';
import type { ToastTone } from '@/stores/ToastStore';

const TONE_META: Record<ToastTone, { bg: string; fg: string; icon: typeof Info }> = {
  info: { bg: 'rgba(101,174,232,0.16)', fg: '#3767A3', icon: Info },
  success: { bg: 'rgba(67,190,118,0.16)', fg: '#218861', icon: CheckCircle2 },
  warning: { bg: 'rgba(231,178,43,0.16)', fg: '#AC7C1F', icon: AlertTriangle },
  error: { bg: 'rgba(236,104,76,0.16)', fg: '#A92926', icon: XCircle },
};

export const ToastHost = observer(function ToastHost() {
  const { toast } = useStores();
  if (toast.items.length === 0) return null;
  return (
    <Stack
      sx={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1500,
        gap: 1.5,
      }}
      data-no-print="1"
    >
      {toast.items.map((t) => {
        const meta = TONE_META[t.tone];
        const Icon = meta.icon;
        return (
          <Box
            key={t.id}
            sx={{
              width: 420,
              minHeight: 64,
              borderRadius: 2,
              p: 1.5,
              gap: 1.5,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper',
              boxShadow: '0 8px 16px 0 rgba(145,158,171,0.16)',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: meta.bg,
                color: meta.fg,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, lineHeight: '22px', fontWeight: 700 }}>{t.title}</Typography>
              {t.desc && (
                <Typography sx={{ fontSize: 13, lineHeight: '18px', color: 'text.secondary' }}>{t.desc}</Typography>
              )}
            </Box>
            <IconButton onClick={() => toast.dismiss(t.id)} sx={{ width: 36, height: 36 }}>
              <X size={16} />
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
});
