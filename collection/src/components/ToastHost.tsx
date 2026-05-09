import { observer } from 'mobx-react-lite';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useStores } from '@/stores';

// Renders the toast queue from `toastStore`. The store handles auto-dismiss
// (it schedules a setTimeout when items are added). We render a stacked
// list of Snackbars anchored top-center, each with an Alert. Click the
// close X to dismiss early.

const ToastHost = observer(function ToastHost() {
  const { toast } = useStores();

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: (t) => t.zIndex.snackbar,
        pointerEvents: 'none',
        width: 'min(420px, calc(100vw - 32px))',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toast.items.map((item) => (
        <Snackbar
          key={item.id}
          open
          // Render inline at the top of the stack — disable MUI's own
          // anchor positioning since we're stacking manually.
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            position: 'static',
            transform: 'none',
            pointerEvents: 'auto',
          }}
        >
          <Alert
            severity={item.tone}
            variant="standard"
            onClose={() => toast.dismiss(item.id)}
            sx={{ width: '100%', boxShadow: 3 }}
          >
            <strong>{item.title}</strong>
            {item.desc && (
              <div style={{ marginTop: 4, fontWeight: 400 }}>{item.desc}</div>
            )}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
});

export default ToastHost;
