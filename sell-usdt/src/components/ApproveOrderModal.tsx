import { Box, Button, Dialog, IconButton, Stack } from '@mui/material';
import { AlertTriangle, X } from 'lucide-react';
import type { SellOrderRaw, FeeConfig } from '@/data/types';
import { OrderDetailContent } from './OrderDetailContent';

export function ApproveOrderModal({
  open,
  row,
  fee,
  onClose,
  onApprove,
  onReject,
}: {
  open: boolean;
  row: SellOrderRaw | null;
  fee: FeeConfig;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
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
          maxHeight: '60vh',
          overflowY: 'auto',
        }}
      >
        <OrderDetailContent row={row} fee={fee} />
      </Box>

      {/* Reminder banner — sits above the action row */}
      <Box
        sx={{
          mx: 6,
          mt: 3,
          mb: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          p: '12px 14px',
          borderRadius: 2,
          bgcolor: 'rgba(236,104,76,0.08)',
          border: '1px solid',
          borderColor: 'rgba(236,104,76,0.32)',
        }}
      >
        <Box sx={{ display: 'inline-flex', color: 'error.main', mt: '2px', flexShrink: 0 }}>
          <AlertTriangle size={16} strokeWidth={2} />
        </Box>
        <Box
          sx={{
            fontSize: 13,
            lineHeight: '20px',
            color: 'error.dark',
            fontWeight: 600,
          }}
        >
          请确认已经和供应商沟通好了此笔承兑订单信息，对方愿意接受承兑再通过，否则点拒绝
        </Box>
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: '12px 24px 20px' }}>
        <Button
          onClick={onReject}
          sx={{
            height: 36,
            px: 4,
            bgcolor: '#F0563A',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#D53E22' },
          }}
        >
          拒绝
        </Button>
        <Button variant="contained" onClick={onApprove} sx={{ height: 36, px: 4 }}>
          确认通过审核并发送到lark
        </Button>
      </Stack>
    </Dialog>
  );
}
