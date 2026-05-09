import { observer } from 'mobx-react-lite';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import {
  CheckCircleOutline,
  CloseRounded,
  ErrorOutline,
  InfoOutlined,
  WarningAmberRounded,
} from '@mui/icons-material';
import { useStores } from '@/stores';
import type { ToastTone } from '@/stores/ToastStore';

// Toast — strict implementation of preview/snackbar.html.
//   - 420 × 64 surface, radius 8, padding 0/12, gap 12
//   - shadow `0 8px 16px 0 rgba(145,158,171,0.16)`
//   - leading 40×40 r12 icon tile (severity bg @16% + severity-fg icon)
//   - body title: Poppins 14/22 700; desc: 13/18 secondary
//   - trailing 36×36 round close
//   - viewport anchor: top-center, items stack vertically with 12 gap
// MUI Snackbar is intentionally NOT used — it's a singleton viewport-corner
// component fighting our queue. Custom div + MobX queue is simpler and
// matches the spec exactly.

const TONE_META: Record<ToastTone, { color: string; bg: string; Icon: typeof CheckCircleOutline }> = {
  success: { color: 'rgb(34, 128, 79)',  bg: 'rgba(67,190,118,0.16)',  Icon: CheckCircleOutline },
  warning: { color: 'rgb(165, 114, 15)', bg: 'rgba(231,178,43,0.16)',  Icon: WarningAmberRounded },
  error:   { color: 'rgb(184, 68, 46)',  bg: 'rgba(236,104,76,0.16)',  Icon: ErrorOutline },
  info:    { color: 'rgb(40, 114, 164)', bg: 'rgba(101,174,232,0.16)', Icon: InfoOutlined },
};

const ToastHost = observer(function ToastHost() {
  const { toast } = useStores();
  if (toast.items.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        pointerEvents: 'none',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toast.items.map((t) => {
        const meta = TONE_META[t.tone];
        return (
          <Stack
            key={t.id}
            direction="row"
            alignItems="center"
            gap={3}
            sx={{
              width: 420,
              minHeight: 64,
              maxWidth: 'calc(100vw - 32px)',
              bgcolor: 'background.paper',
              borderRadius: 1, // 8
              boxShadow: '0 8px 16px 0 rgba(145,158,171,0.16)',
              px: 3, // 12
              py: 1.5,
              pointerEvents: 'auto',
            }}
            role="status"
          >
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 1.5,
                bgcolor: meta.bg, color: meta.color,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}
            >
              <meta.Icon sx={{ fontSize: 22 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, color: 'text.primary' }}
              >
                {t.title}
              </Typography>
              {t.desc && (
                <Typography
                  variant="body2"
                  sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary', mt: 0.25 }}
                  component="div"
                >
                  {t.desc}
                </Typography>
              )}
            </Box>

            <IconButton
              onClick={() => toast.dismiss(t.id)}
              sx={{ width: 36, height: 36, color: 'text.secondary', flexShrink: 0 }}
              aria-label="关闭"
            >
              <CloseRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        );
      })}
    </Box>
  );
});

export default ToastHost;
