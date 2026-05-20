import { useEffect, useState } from 'react';
import { Box, Button, Dialog, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { AlertTriangle, Plus, X } from 'lucide-react';

export type ConfirmActionModalProps = {
  open: boolean;
  /** Pseudo-key to reset internal form state when the same modal reopens for a different row. */
  rowKey?: string;
  title: string;
  subtitle: string;
  cardTitle: string;
  cardRows: Array<{ k: string; v: string }>;
  uploadHint: string;
  uploadRequired: boolean;
  proofLabel: string;
  amountLabel: string;
  amountSuffix: string;
  warning?: string;
  onClose: () => void;
  onConfirm: () => void;
};

function sanitizeAmountInput(raw: string): string {
  let s = raw.replace(/[^\d.]/g, '');
  const i = s.indexOf('.');
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
  }
  return s;
}

export function ConfirmActionModal(props: ConfirmActionModalProps) {
  const {
    open,
    rowKey,
    title,
    subtitle,
    cardTitle,
    cardRows,
    uploadHint,
    uploadRequired,
    proofLabel,
    amountLabel,
    amountSuffix,
    warning,
    onClose,
    onConfirm,
  } = props;

  const [proofId, setProofId] = useState('');
  const [amount, setAmount] = useState('');
  const [uploadCount, setUploadCount] = useState(0);

  // Reset form whenever the modal is reopened (or opened for a different row).
  useEffect(() => {
    if (open) {
      setProofId('');
      setAmount('');
      setUploadCount(0);
    }
  }, [open, rowKey]);

  const canConfirm =
    proofId.trim() !== '' &&
    amount.trim() !== '' &&
    (!uploadRequired || uploadCount > 0);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 480, maxWidth: 'calc(100vw - 32px)' } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px 8px',
        }}
      >
        <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>{title}</Box>
        <IconButton onClick={onClose} sx={{ width: 32, height: 32, color: 'grey.600', borderRadius: 1.5 }}>
          <X size={20} />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: '4px 24px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxHeight: '72vh',
          overflowY: 'auto',
        }}
      >
        <Typography sx={{ fontSize: 13, color: 'grey.700', lineHeight: 1.6, mt: 0.5 }}>
          {subtitle}
        </Typography>

        {/* Info card */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: '18px 20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>{cardTitle}</Box>
          {cardRows.map((r) => (
            <Box key={r.k} sx={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <Box component="span" sx={{ flex: '0 0 44%', color: 'grey.600', fontSize: 14 }}>
                {r.k}
              </Box>
              <Box
                component="span"
                sx={{
                  flex: 1,
                  textAlign: 'right',
                  color: 'text.primary',
                  fontSize: 14,
                  wordBreak: 'break-all',
                }}
              >
                {r.v}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Upload area */}
        <Box>
          <Typography sx={{ fontSize: 13, color: 'grey.700', mb: 2 }}>{uploadHint}</Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
            {Array.from({ length: uploadCount }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 11, color: 'grey.500' }}>截图 {i + 1}</Typography>
                <IconButton
                  onClick={() => setUploadCount((c) => Math.max(0, c - 1))}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 18,
                    height: 18,
                    color: 'grey.600',
                    bgcolor: 'rgba(255,255,255,0.85)',
                    p: 0,
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                  }}
                  aria-label="移除"
                >
                  <X size={12} />
                </IconButton>
              </Box>
            ))}
            {uploadCount < 5 && (
              <Box
                onClick={() => setUploadCount((c) => c + 1)}
                role="button"
                tabIndex={0}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'grey.300',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: 'grey.500',
                  transition: 'border-color 120ms, color 120ms',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
              >
                <Plus size={20} strokeWidth={1.8} />
              </Box>
            )}
          </Stack>
        </Box>

        {/* Inputs */}
        <OutlinedTextInput
          placeholder={proofLabel}
          value={proofId}
          onChange={setProofId}
        />
        <OutlinedTextInput
          placeholder={amountLabel}
          value={amount}
          onChange={(v) => setAmount(sanitizeAmountInput(v))}
          suffix={amountSuffix}
          inputMode="decimal"
        />

        {warning && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              p: '12px 14px',
              borderRadius: 2,
              bgcolor: 'rgba(231,178,43,0.10)',
              border: '1px solid',
              borderColor: 'rgba(231,178,43,0.32)',
            }}
          >
            <Box sx={{ display: 'inline-flex', color: 'warning.main', mt: '2px', flexShrink: 0 }}>
              <AlertTriangle size={16} strokeWidth={2} />
            </Box>
            <Box sx={{ fontSize: 13, lineHeight: '20px', color: 'warning.darker', fontWeight: 500 }}>
              {warning}
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ p: '16px 24px 20px' }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!canConfirm}
          onClick={handleConfirm}
          sx={{
            height: 44,
            fontSize: 14,
            '&.Mui-disabled': {
              bgcolor: 'grey.200',
              color: 'grey.400',
            },
          }}
        >
          确认
        </Button>
      </Box>
    </Dialog>
  );
}

function OutlinedTextInput({
  placeholder,
  value,
  onChange,
  suffix,
  inputMode,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  inputMode?: 'text' | 'decimal' | 'numeric';
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 3.5,
        bgcolor: 'background.paper',
        transition: 'border-color 120ms, box-shadow 120ms',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 3px rgba(60,111,245,0.12)',
        },
      }}
    >
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={inputMode ? { inputMode } : undefined}
        sx={{ flex: 1, fontSize: 14, color: 'text.primary', height: '100%' }}
      />
      {suffix && (
        <Box component="span" sx={{ color: 'grey.500', fontSize: 14, ml: 2 }}>
          {suffix}
        </Box>
      )}
    </Box>
  );
}
