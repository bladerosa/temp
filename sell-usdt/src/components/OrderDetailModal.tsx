import { Box, Button, Dialog, IconButton, Stack } from '@mui/material';
import { X } from 'lucide-react';
import type { SellOrderRaw, FeeConfig } from '@/data/types';
import { OrderDetailContent } from './OrderDetailContent';

export function OrderDetailModal({
  open,
  row,
  fee,
  onClose,
}: {
  open: boolean;
  row: SellOrderRaw | null;
  fee: FeeConfig;
  onClose: () => void;
}) {
  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px 24px 12px' }}>
        <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>付款单信息</Box>
        <IconButton onClick={onClose} sx={{ width: 32, height: 32, color: 'grey.600', borderRadius: 1.5 }}>
          <X size={20} />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: '4px 24px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4.5,
          maxHeight: '72vh',
          overflowY: 'auto',
        }}
      >
        <OrderDetailContent row={row} fee={fee} />
      </Box>

      <Stack direction="row" justifyContent="center" sx={{ p: '16px 24px 20px' }}>
        <Button variant="contained" sx={{ height: 36, px: 4 }}>
          复制信息
        </Button>
      </Stack>
    </Dialog>
  );
}
