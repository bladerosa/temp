import { Box, Button, Dialog, IconButton, Stack } from '@mui/material';
import { X } from 'lucide-react';
import type { SellOrderRaw, FeeConfig } from '@/data/types';
import { deriveRow, fmtFiat, fmtMarketRate, fmtUSDT } from '@/utils/pricing';

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
  const d = deriveRow(row, fee);

  const recipient = {
    bank: row.bank,
    holder: 'Jasee',
    swift: '000009527',
    iban: '000000001',
    bankAddress: '1.1',
    addr: '1.1',
  };

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
        <DetailSection title="Order Info">
          <DetailRow k="Create At:" v={row.time} />
          <DetailRow k="Record Id:" v={String(row.recordId).replace(/\.\.\./, '')} />
          <DetailRow k="Merchant ID:" v={row.mid} />
          <DetailRow k="Sell Amount:" v={fmtUSDT(row.sellAmt)} />
          <DetailRow k="外显服务费:" v={fmtUSDT(d.extFee)} />
          <DetailRow k="平台服务费:" v={fmtUSDT(d.platFee)} />
          <DetailRow k="供应商承兑Amount:" v={fmtUSDT(d.supAmt)} />
          <DetailRow k="Rate:" v={fmtMarketRate(row.market, row.ccy)} />
          <DetailRow k="供应商汇率:" v={fmtMarketRate(d.supRate, row.ccy)} />
          <DetailRow k="Get Asset:" v={fmtFiat(d.userGot, row.ccy)} />
        </DetailSection>

        <DetailSection title="Recipient Info">
          <DetailRow k="Bank Name:" v={recipient.bank} />
          <DetailRow k="Account Holder:" v={recipient.holder} />
          <DetailRow k="BIC/SWIFT:" v={recipient.swift} />
          <DetailRow k="IBAN/Account Number:" v={recipient.iban} />
          <DetailRow k="Bank Address:" v={recipient.bankAddress} />
          <DetailRow k="Recipient’s Address:" v={recipient.addr} />
        </DetailSection>
      </Box>

      <Stack direction="row" justifyContent="center" sx={{ p: '16px 24px 20px' }}>
        <Button variant="contained" sx={{ height: 36, px: 4 }}>
          复制信息
        </Button>
      </Stack>
    </Dialog>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
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
      <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary', mb: 1 }}>{title}</Box>
      {children}
    </Box>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <Box component="span" sx={{ flex: '0 0 44%', color: 'grey.600', fontSize: 14 }}>
        {k}
      </Box>
      <Box
        component="span"
        sx={{ flex: 1, textAlign: 'right', color: 'text.primary', fontSize: 14, wordBreak: 'break-all' }}
      >
        {v}
      </Box>
    </Box>
  );
}
