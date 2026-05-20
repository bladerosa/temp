import { Box } from '@mui/material';
import type { SellOrderRaw, FeeConfig } from '@/data/types';
import { deriveRow, fmtFiat, fmtMarketRate, fmtUSDT } from '@/utils/pricing';

export function OrderDetailContent({
  row,
  fee,
}: {
  row: SellOrderRaw;
  fee: FeeConfig;
}) {
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
    <>
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
    </>
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
