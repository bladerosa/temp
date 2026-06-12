import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { ModalShell } from '@/components/ModalShell';
import { modalInputSx, modalNextSx, modalIntroSx } from './modalStyles';
import type { WebhookKind } from '@/stores/OnboardingStore';

interface WebhookEditModalProps {
  kind: WebhookKind;
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

/* Must be a real URL: http(s):// + a valid domain (PRD 5.4.3 input rule 2). */
const URL_PATTERN = /^https?:\/\/([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?([/?#].*)?$/i;

/* Add / Edit Webhook URL — copy differs per kind, no stepper region. */
export function WebhookEditModal({ kind, open, onClose, onSubmit }: WebhookEditModalProps) {
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (open) {
      setValue('');
      setInvalid(false);
    }
  }, [open]);

  const submit = () => {
    const url = value.trim();
    if (!url) return; // empty: no submit, modal stays open
    if (!URL_PATTERN.test(url)) {
      setInvalid(true); // invalid format: hint, modal stays open
      return;
    }
    onSubmit(url);
    onClose();
  };

  const isDeposit = kind === 'deposit';

  return (
    <ModalShell open={open} onClose={onClose} title={isDeposit ? 'Edit Webhook URL' : 'Add Webhook URL'}>
      {isDeposit ? (
        <>
          <Box component="p" sx={modalIntroSx}>
            CCPayment will send the following notifications to this Webhook URL:
          </Box>
          <Box
            component="ol"
            sx={{
              m: '6px 0 0',
              pl: 5,
              fontSize: 17,
              lineHeight: 1.7,
              color: 'text.primary',
              '& li': { pl: '2px' },
              '& a': { color: 'text.primary', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' },
              '& a:hover': { color: 'primary.main' },
            }}
          >
            <li>
              Notifications for deposits. <a href="#">Learn More</a>
            </li>
            <li>
              Notifications for addresses flagged as risky. <a href="#">Learn More</a>
            </li>
          </Box>
        </>
      ) : (
        <Box component="p" sx={modalIntroSx}>
          CCPayment will send the notifications for <a href="#">withdrawals</a> to this Webhook URL.
        </Box>
      )}

      <Box
        component="input"
        type="text"
        value={value}
        autoFocus
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
          setInvalid(false);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder={isDeposit ? 'Deposit Webhook URL' : 'Withdrawal Webhook URL'}
        sx={{ ...modalInputSx, mt: 7, ...(invalid && { borderColor: 'error.main', '&:focus': { borderColor: 'error.main' } }) }}
      />
      {invalid && (
        <Box sx={{ mt: '10px', fontSize: 14, color: 'error.main' }}>Please enter a valid URL</Box>
      )}
      <Box component="button" onClick={submit} sx={{ ...modalNextSx, width: '100%', mt: '26px' }}>
        Next
      </Box>
    </ModalShell>
  );
}
