import { useState } from 'react';
import { Box, Button, Dialog, IconButton, InputBase, Typography } from '@mui/material';
import { Info, X } from 'lucide-react';
import { FeeSimulation } from './FeeSimulation';
import { sanitizeFeeInput, validateFee } from '@/utils/pricing';

export function FiatWithdrawFeeModal({
  open,
  initialRate,
  supplier,
  onClose,
  onSave,
}: {
  open: boolean;
  initialRate: string;
  supplier: string;
  onClose: () => void;
  onSave: (next: string) => void;
}) {
  const [rate, setRate] = useState(initialRate);
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const rateErr = submitted ? validateFee(rate) : '';
  const codeErr = submitted && code.length !== 6 ? '请输入6位谷歌验证码' : '';
  const canSubmit = !validateFee(rate) && code.length === 6;

  const submit = () => {
    setSubmitted(true);
    if (!canSubmit) return;
    onSave(rate);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px 24px 12px' }}>
        <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>法币提现平台服务费</Box>
        <IconButton onClick={onClose} sx={{ width: 32, height: 32, color: 'grey.600', borderRadius: 1.5 }}>
          <X size={20} />
        </IconButton>
      </Box>

      <Box sx={{ p: '4px 24px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <OutlinedFieldWithLegend legend="法币提现" error={!!rateErr}>
          <InputBase
            value={rate}
            onChange={(e) => setRate(sanitizeFeeInput(e.target.value))}
            inputProps={{ inputMode: 'decimal' }}
            sx={{
              flex: 1,
              fontSize: 18,
              fontWeight: 500,
              color: 'text.primary',
              height: '100%',
            }}
          />
          <Box component="span" sx={{ color: 'grey.500', fontSize: 18, ml: 2 }}>
            %
          </Box>
        </OutlinedFieldWithLegend>
        <Typography sx={{ fontSize: 12, color: rateErr ? 'error.main' : 'grey.500', mt: -2, pl: 1 }}>
          {rateErr || '允许 0–100，最多保留 2 位小数'}
        </Typography>

        <OutlinedFieldWithLegend legend={code ? '谷歌验证码' : undefined} error={!!codeErr}>
          <InputBase
            value={code}
            placeholder="谷歌验证码"
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            sx={{
              flex: 1,
              fontSize: 18,
              fontWeight: 500,
              color: 'text.primary',
              height: '100%',
              '& input::placeholder': { fontSize: 16, fontWeight: 400 },
            }}
          />
        </OutlinedFieldWithLegend>
        <Typography sx={{ fontSize: 12, color: codeErr ? 'error.main' : 'grey.500', mt: -2, pl: 1 }}>
          {codeErr || '请输入6位谷歌验证码'}
        </Typography>

        <Box
          sx={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: 'rgba(60,111,245,0.06)',
            border: '1px solid',
            borderColor: 'rgba(60,111,245,0.18)',
            borderRadius: 2,
            fontSize: 13,
            color: 'grey.700',
            mt: 1,
          }}
        >
          <Box sx={{ display: 'inline-flex', color: 'primary.main' }}>
            <Info size={14} strokeWidth={1.8} />
          </Box>
          <span>
            当前供应商汇率加点：
            <Box component="b" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {supplier}%
            </Box>
          </span>
        </Box>

        <FeeSimulation platform={rate} supplier={supplier} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: '16px 24px 20px' }}>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!canSubmit}
          sx={{
            height: 36,
            px: 4,
            '&.Mui-disabled': {
              bgcolor: 'grey.200',
              color: 'grey.400',
            },
          }}
        >
          提交
        </Button>
      </Box>
    </Dialog>
  );
}

function OutlinedFieldWithLegend({
  legend,
  error,
  children,
}: {
  legend?: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: 56,
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: 3,
        px: 4.5,
        bgcolor: 'background.paper',
        transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
        '&:focus-within': {
          borderColor: error ? 'error.main' : 'primary.main',
          boxShadow: error
            ? '0 0 0 3px rgba(236,104,76,0.16)'
            : '0 0 0 3px rgba(60,111,245,0.12)',
        },
      }}
    >
      {legend && (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: '-9px',
            left: '14px',
            px: 1.5,
            bgcolor: 'background.paper',
            fontSize: 12,
            color: error ? 'error.main' : 'grey.600',
            pointerEvents: 'none',
          }}
        >
          {legend}
        </Box>
      )}
      {children}
    </Box>
  );
}
