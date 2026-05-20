import { useState } from 'react';
import { Box, Button, Dialog, IconButton, Stack } from '@mui/material';
import { X } from 'lucide-react';
import { FeeField } from './FeeField';
import { FeeSimulation } from './FeeSimulation';
import { validateFee } from '@/utils/pricing';

export function FeeSettingsModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: { platform: string; supplier: string };
  onClose: () => void;
  onSave: (next: { platform: string; supplier: string }) => void;
}) {
  const [platform, setPlatform] = useState(initial.platform);
  const [supplier, setSupplier] = useState(initial.supplier);
  const [submitted, setSubmitted] = useState(false);

  const platformErr = submitted ? validateFee(platform) : '';
  const supplierErr = submitted ? validateFee(supplier) : '';

  const submit = () => {
    setSubmitted(true);
    if (validateFee(platform) || validateFee(supplier)) return;
    onSave({ platform, supplier });
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 480, maxWidth: 'calc(100vw - 32px)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px 24px 12px' }}>
        <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>服务费设置</Box>
        <IconButton onClick={onClose} sx={{ width: 32, height: 32, color: 'grey.600', borderRadius: 1.5 }}>
          <X size={18} />
        </IconButton>
      </Box>
      <Box sx={{ p: '4px 24px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FeeField label="模拟平台服务费率" value={platform} onChange={setPlatform} error={platformErr} />
        <FeeField label="供应商汇率加点" value={supplier} onChange={setSupplier} error={supplierErr} />
        <FeeSimulation platform={platform} supplier={supplier} />
      </Box>
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: '16px 24px 20px' }}>
        <Button variant="outlined" onClick={onClose} sx={{ height: 36, px: 4 }}>
          取消
        </Button>
        <Button variant="contained" onClick={submit} sx={{ height: 36, px: 4 }}>
          保存
        </Button>
      </Stack>
    </Dialog>
  );
}
