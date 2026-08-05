import { useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, Link, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { MEMO_COINS } from '@/data/riskTransactions';
import { useStores } from '@/stores';
import { stripSign } from '@/utils/format';
import { DetailRow, DialogTitleBar } from './shared';
import { BatchTag, SoftChip, WITHDRAW_STATUS_META } from './statusMaps';

export const WithdrawDetailDialog = observer(function WithdrawDetailDialog() {
  const { risk } = useStores();
  const row = risk.withdrawDetail;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (row) setExpanded(false);
  }, [row]);

  if (!row) return null;

  const isBatch = Boolean(row.bill);
  const members = risk.membersOfBill(row.bill ?? '');
  const meta = WITHDRAW_STATUS_META[row.status];
  const supportsMemo = MEMO_COINS.includes(row.symbol);

  return (
    <Dialog
      open
      onClose={risk.closeWithdrawDetail}
      maxWidth={false}
      PaperProps={{ sx: { width: 560, maxHeight: '88vh' } }}
    >
      <Box sx={{ px: 6, pt: 6 }}>
        <DialogTitleBar title="退款詳情" onClose={risk.closeWithdrawDetail} align="flex-start" />
      </Box>

      <DialogContent sx={{ px: 6, pt: 5, pb: 6 }}>
        <Stack sx={{ bgcolor: 'grey.100', borderRadius: 3, px: 6, py: 5, gap: 2.5 }}>
          <Stack direction="row" alignItems="center" sx={{ gap: 2.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {isBatch ? '風險資金提款 · 批量退款' : '風險資金提款'}
            </Typography>
            <SoftChip label={meta.label} bg={meta.bg} fg={meta.fg} />
            {isBatch && <BatchTag />}
          </Stack>
          <Typography sx={{ fontSize: 24, lineHeight: '34px', fontWeight: 700 }}>
            {stripSign(row.amount)}
          </Typography>
          {isBatch && (
            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary' }}>
              此筆為批量退款合併後的單筆鏈上轉帳，覆蓋多筆風險付款。
            </Typography>
          )}
        </Stack>

        <Stack sx={{ mt: 5, gap: 3.5 }}>
          <DetailRow label="紀錄 ID" copyValue={row.id}>
            {row.id}
          </DetailRow>

          {isBatch && (
            <DetailRow label="批次 ID" copyValue={row.bill}>
              {row.bill}
            </DetailRow>
          )}

          <DetailRow label="區塊鏈">{row.chain}</DetailRow>

          <DetailRow label="至地址" copyValue={row.to}>
            {row.to}
          </DetailRow>

          {supportsMemo && <DetailRow label="Memo">{row.memo?.length ? row.memo : '--'}</DetailRow>}

          <DetailRow label={isBatch ? '區塊鏈手續費（本筆轉帳）' : '區塊鏈手續費'}>{row.fee}</DetailRow>

          <DetailRow label="Txid">
            {row.txid ? (
              <Link href="#" onClick={(e) => e.preventDefault()} sx={{ fontSize: 15 }}>
                {row.txid}
              </Link>
            ) : (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                --
              </Box>
            )}
          </DetailRow>

          <DetailRow label="退款時間">{row.time}</DetailRow>

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
                  本次退款覆蓋的風險付款（{members.length} 筆）
                </Typography>
                <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                  {expanded ? <ChevronUp size={20} strokeWidth={1.8} /> : <ChevronDown size={20} strokeWidth={1.8} />}
                </Box>
              </Stack>

              {expanded && (
                <>
                  <Box sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                    {members.map((m) => (
                      <Stack
                        key={m.id}
                        direction="row"
                        alignItems="center"
                        onClick={() => risk.jumpToPayment(m.id)}
                        sx={{
                          gap: 3,
                          px: 4,
                          py: 3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'grey.100' },
                          '&:last-of-type': { borderBottom: 'none' },
                        }}
                      >
                        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 13, color: 'primary.main' }}>
                          {m.id}
                        </Typography>
                        <Typography sx={{ fontSize: 14, flex: '0 0 auto' }}>{stripSign(m.amount)}</Typography>
                        <Box sx={{ color: 'text.secondary', display: 'inline-flex', flex: '0 0 16px' }}>
                          <ChevronRight size={16} strokeWidth={1.8} />
                        </Box>
                      </Stack>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: 12, lineHeight: '18px', color: 'text.secondary', mt: 2 }}>
                    點擊任一紀錄可跳轉至風險付款列表並按該筆紀錄 ID 精準篩選。
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
});
