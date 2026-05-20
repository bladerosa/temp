import { Box, InputBase, Typography } from '@mui/material';
import { sanitizeFeeInput } from '@/utils/pricing';

export function FeeField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ fontSize: 13, color: 'grey.700', fontWeight: 500 }}>
        {label}
        <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>*</Box>
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 2,
          height: 40,
          px: 3,
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
        <InputBase
          fullWidth
          placeholder="请输入"
          value={value}
          onChange={(e) => onChange(sanitizeFeeInput(e.target.value))}
          inputProps={{ inputMode: 'decimal' }}
          sx={{ fontSize: 14, color: 'text.primary' }}
        />
        <Box component="span" sx={{ color: 'grey.500', fontSize: 14, pl: 2 }}>
          %
        </Box>
      </Box>
      <Typography sx={{ fontSize: 12, color: error ? 'error.main' : 'grey.500' }}>
        {error || '允许 0–100，最多保留 2 位小数'}
      </Typography>
    </Box>
  );
}
