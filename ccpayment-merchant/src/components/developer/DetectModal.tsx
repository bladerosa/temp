import Box from '@mui/material/Box';
import { ModalShell } from '@/components/ModalShell';
import { modalNextSx, modalGhostSx, statusPillSx } from './modalStyles';
import { DOC_URLS } from '@/data/guide';
import type { WebhookKind } from '@/stores/OnboardingStore';

interface DetectModalProps {
  kind: WebhookKind;
  open: boolean;
  onClose: () => void;
  /** Opens the API doc in a new tab AND simulates a passing detection. */
  onDocClick: () => void;
}

export function DetectModal({ kind, open, onClose, onDocClick }: DetectModalProps) {
  const W = kind === 'withdraw' ? 'Withdrawal' : 'Deposit';
  const docHref = kind === 'withdraw' ? DOC_URLS.withdrawalApi : DOC_URLS.depositApis;

  return (
    <ModalShell open={open} onClose={onClose} title={`Detect ${W} Webhook URL`}>
      <Box
        component="ol"
        sx={{
          m: '4px 0 0',
          pl: '22px',
          fontSize: 16,
          lineHeight: 1.7,
          color: 'text.primary',
          '& li': { pl: 1, mb: 4 },
          '& li:last-child': { mb: 0 },
        }}
      >
        <li>
          The {W} Webhook URL is{' '}
          <Box component="strong" sx={{ color: 'success.dark', fontWeight: 700 }}>
            now in effect
          </Box>
          . CCPayment will send webhook notifications from the following IP address: <strong>54.150.123.157</strong>.
          Please make sure this IP is not blocked by your server.
        </li>
        <li>
          We'll help you verify whether your webhook is handled successfully. So far we haven't detected any
          successfully processed {W} Webhook. Once you complete the {W} API integration as described in the developer
          documentation and successfully receive a webhook and reply <strong>success</strong> for the first time, this
          status will change from <Box component="span" sx={statusPillSx}>Not Detected</Box> to{' '}
          <Box component="strong" sx={{ color: 'success.dark', fontWeight: 700 }}>
            Detected
          </Box>
          .
        </li>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, mt: '30px' }}>
        <Box
          component="a"
          href={docHref}
          target="_blank"
          rel="noopener"
          onClick={onDocClick}
          sx={{
            ...modalNextSx,
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
            '&:visited': { color: '#fff' },
          }}
        >
          View {W} API Doc
        </Box>
        <Box component="button" onClick={onClose} sx={modalGhostSx}>
          Close
        </Box>
      </Box>
    </ModalShell>
  );
}
