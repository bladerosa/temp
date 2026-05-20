import { Box, Button, Dialog, IconButton, Stack } from '@mui/material';
import { X } from 'lucide-react';
import type { SellOrderRaw, FeeConfig } from '@/data/types';
import { OrderDetailContent } from './OrderDetailContent';

export type DetailStatusSection = {
  title: string;       // e.g. "已发送Lark消息" / "已通过审核"
  timeLabel: string;   // e.g. "标记时间" / "过审时间"
  time: string;
  operator: string;
};

export type CwalletTransferSection = {
  amount: string;
  id: string;
  time: string;        // empty when status === '转账中'
  status: '转账中' | '已完成';
  showRepush?: boolean;
  onRepush?: () => void;
};

export type PaymentSection = {
  proofId: string;
  completedAt: string;
  operator: string;
};

export function OrderDetailModal({
  open,
  row,
  fee,
  onClose,
  title = '付款单信息',
  statusSection,
  cwalletSection,
  paymentSection,
}: {
  open: boolean;
  row: SellOrderRaw | null;
  fee: FeeConfig;
  onClose: () => void;
  title?: string;
  statusSection?: DetailStatusSection;
  cwalletSection?: CwalletTransferSection;
  paymentSection?: PaymentSection;
}) {
  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px 24px 12px' }}>
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
          gap: 4.5,
          maxHeight: '72vh',
          overflowY: 'auto',
        }}
      >
        <OrderDetailContent row={row} fee={fee} />
        {statusSection && <StatusSection section={statusSection} />}
        {cwalletSection && <CwalletSection section={cwalletSection} />}
        {paymentSection && <PaymentSectionView section={paymentSection} />}
      </Box>

      <Stack direction="row" justifyContent="center" sx={{ p: '16px 24px 20px' }}>
        <Button variant="contained" sx={{ height: 36, px: 4 }}>
          复制信息
        </Button>
      </Stack>
    </Dialog>
  );
}

function StatusSection({ section }: { section: DetailStatusSection }) {
  return (
    <CardShell>
      <CardHeader title={section.title} />
      <DetailRow k={section.timeLabel} v={section.time} />
      <DetailRow k="操作人" v={section.operator} />
    </CardShell>
  );
}

function CwalletSection({ section }: { section: CwalletTransferSection }) {
  return (
    <CardShell>
      <CardHeader
        title="向Cwallet运营账户转账"
        trailing={
          section.showRepush ? (
            <Button
              variant="outlined"
              onClick={section.onRepush}
              sx={{ height: 28, minHeight: 28, px: 2.5, fontSize: 13, fontWeight: 600 }}
            >
              重推
            </Button>
          ) : null
        }
      />
      <DetailRow k="转账金额" v={section.amount} />
      <DetailRow k="转账ID" v={section.id} />
      <DetailRow k="转账时间" v={section.time} />
      <DetailRow
        k="转账状态"
        v={section.status}
        valueColor={section.status === '已完成' ? 'success.dark' : 'warning.dark'}
      />
    </CardShell>
  );
}

function PaymentSectionView({ section }: { section: PaymentSection }) {
  return (
    <CardShell>
      <CardHeader title="已付款" />
      <DetailRow k="付款凭证ID" v={section.proofId} />
      <DetailRow k="完成时间" v={section.completedAt} />
      <DetailRow k="操作人" v={section.operator} />
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </Box>
  );
}

function CardHeader({ title, trailing }: { title: string; trailing?: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1,
        minHeight: 32,
      }}
    >
      <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>{title}</Box>
      {trailing}
    </Box>
  );
}

function DetailRow({
  k,
  v,
  valueColor,
}: {
  k: string;
  v: string;
  valueColor?: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <Box component="span" sx={{ flex: '0 0 44%', color: 'grey.600', fontSize: 14 }}>
        {k}
      </Box>
      <Box
        component="span"
        sx={{
          flex: 1,
          textAlign: 'right',
          color: valueColor ?? 'text.primary',
          fontWeight: valueColor ? 600 : 400,
          fontSize: 14,
          wordBreak: 'break-all',
        }}
      >
        {v}
      </Box>
    </Box>
  );
}
