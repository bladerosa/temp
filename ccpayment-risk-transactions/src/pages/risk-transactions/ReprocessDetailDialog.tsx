import { useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, Link, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CryptoBadge } from '@/components/CryptoBadge';
import { CHAIN_FEE, MEMO_COINS, REJECT_ADDRESS } from '@/data/riskTransactions';
import { useStores } from '@/stores';
import { parseAmount, stripSign, trimNumber } from '@/utils/format';
import { DetailRow, DialogTitleBar } from './shared';

export const ReprocessDetailDialog = observer(function ReprocessDetailDialog() {
  const { risk } = useStores();
  const row = risk.reprocessDetail;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (row) setExpanded(false);
  }, [row]);

  if (!row) return null;

  const refunded = row.reprocess === 'refunded';
  const isBatch = Boolean(row.bill);
  const members = risk.membersOfBill(row.bill ?? '');

  const chipLabel = refunded ? '已退款' : row.reprocess === 'failed' ? '失敗' : '已拒絕';
  const amount = refunded ? row.amount.replace('+ ', '- ') : row.amount;
  const batchTotal = isBatch
    ? `${trimNumber(members.reduce((sum, m) => sum + parseAmount(m.amount).n, 0))} ${parseAmount(row.amount).unit}`
    : '';
  const supportsMemo = MEMO_COINS.includes(row.symbol);
  const toAddress = refunded ? row.from : REJECT_ADDRESS;

  return (
    <Dialog
      open
      onClose={risk.closeReprocessDetail}
      maxWidth={false}
      PaperProps={{ sx: { width: 520 } }}
    >
      <Box sx={{ px: 6, pt: 6, pb: 5 }}>
        <DialogTitleBar title="重新處理詳情" onClose={risk.closeReprocessDetail} />
      </Box>

      <DialogContent sx={{ px: 6, pt: 0, pb: 6 }}>
        <Box sx={{ bgcolor: 'grey.100', borderRadius: 3, p: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 4 }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {isBatch ? '風險付款 · 批量退款' : '風險付款'}
            </Typography>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 3,
                py: 1.25,
                borderRadius: 2,
                fontSize: 14,
                fontWeight: 500,
                bgcolor: refunded ? 'success.lighter' : 'error.lighter',
                color: refunded ? 'success.dark' : 'error.dark',
              }}
            >
              {chipLabel}
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" sx={{ gap: 4, mt: 3.5 }}>
            <CryptoBadge symbol={row.symbol} size={40} />
            <Typography sx={{ fontSize: 24, lineHeight: '32px', fontWeight: 700 }}>{amount}</Typography>
          </Stack>

          <Box sx={{ borderTop: '1px dashed', borderColor: 'grey.300', mt: 4.5, mb: 1 }} />

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 4, py: 2.5 }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>區塊鏈網路</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{row.chain}</Typography>
          </Stack>

          {isBatch && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 4, py: 2.5 }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>合併退款金額</Typography>
              <Stack direction="row" alignItems="baseline" sx={{ gap: 2 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{batchTotal}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  共 {members.length} 筆
                </Typography>
              </Stack>
            </Stack>
          )}

          {refunded && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 4, py: 2.5 }}>
              <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  {isBatch ? '區塊鏈手續費（本批次）' : '區塊鏈手續費'}
                </Typography>
                <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                  <Info size={17} strokeWidth={1.6} />
                </Box>
              </Stack>
              <Stack direction="row" alignItems="baseline" sx={{ gap: 2 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                  {CHAIN_FEE[row.chain] ?? '0.03169 USDT'}
                </Typography>
                {isBatch && (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>整批僅收取一次</Typography>
                )}
              </Stack>
            </Stack>
          )}
        </Box>

        <Stack sx={{ pt: 5, px: 1, gap: 4.5 }}>
          <DetailRow label="紀錄 ID" copyValue={row.id}>
            {row.id}
          </DetailRow>

          {isBatch && (
            <DetailRow label="批次 ID" copyValue={row.bill}>
              {row.bill}
            </DetailRow>
          )}

          <DetailRow label="To address" copyValue={toAddress}>
            {toAddress}
          </DetailRow>

          {supportsMemo && <DetailRow label="Memo">{row.memo?.length ? row.memo : '--'}</DetailRow>}

          {refunded && (
            <DetailRow label="Txid" copyValue={row.txid}>
              <Link href="#" onClick={(e) => e.preventDefault()} sx={{ fontSize: 15, textDecoration: 'underline' }}>
                {row.txid}
              </Link>
            </DetailRow>
          )}

          <DetailRow label="付款時間">{row.time}</DetailRow>

          {isBatch && (
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 4 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setExpanded((v) => !v)}
                sx={{ gap: 4, cursor: 'pointer' }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                  本批次紀錄（{members.length} 筆）
                </Typography>
                <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                  {expanded ? <ChevronUp size={20} strokeWidth={1.8} /> : <ChevronDown size={20} strokeWidth={1.8} />}
                </Box>
              </Stack>

              {expanded && (
                <Box sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                  {members.map((m) => {
                    const current = m.id === row.id;
                    return (
                      <Stack
                        key={m.id}
                        direction="row"
                        alignItems="center"
                        sx={{
                          gap: 3,
                          px: 4,
                          py: 3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: current ? 'grey.100' : 'background.paper',
                          '&:last-of-type': { borderBottom: 'none' },
                        }}
                      >
                        <Typography
                          noWrap
                          onClick={() => !current && risk.jumpToPayment(m.id)}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 13,
                            color: current ? 'text.primary' : 'primary.main',
                            cursor: current ? 'default' : 'pointer',
                          }}
                        >
                          {m.id}
                        </Typography>
                        {current && (
                          <Box
                            component="span"
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: 11,
                              fontWeight: 500,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                            }}
                          >
                            本筆
                          </Box>
                        )}
                        <Typography sx={{ fontSize: 14, flex: '0 0 auto' }}>
                          {stripSign(m.amount)}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
});
