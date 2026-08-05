import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Check, ChevronDown, ChevronRight, Info, Minus } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { BATCH_GROUPS, MEMO_COINS } from '@/data/riskTransactions';
import { useStores } from '@/stores';
import { formatAmount } from '@/utils/format';
import { DialogTitleBar } from './shared';

/** 按命中的地址笔数计的预估费用（原型固定表）。 */
const FEES: Record<number, string> = { 0: '0', 1: '0.00819578', 2: '0.01639155' };

function CheckBox({
  checked,
  partial,
  onClick,
}: {
  checked: boolean;
  partial?: boolean;
  onClick: () => void;
}) {
  const filled = checked || !!partial;
  return (
    <Box
      role="checkbox"
      aria-checked={partial ? 'mixed' : checked}
      onClick={onClick}
      sx={{
        width: 22,
        height: 22,
        flex: '0 0 22px',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: filled ? 'primary.main' : 'grey.300',
        bgcolor: filled ? 'primary.main' : 'background.paper',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
      }}
    >
      {checked && <Check size={16} strokeWidth={2.6} />}
      {!checked && partial && <Minus size={16} strokeWidth={2.6} />}
    </Box>
  );
}

export const BatchConfirmDialog = observer(function BatchConfirmDialog() {
  const { risk } = useStores();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!risk.batchConfirmOpen) return null;

  const unit = risk.batchCoin.sym;
  const selected = risk.batchSelectedCount;
  const total = risk.batchTotalCount;
  const addressCount = risk.batchSelectedAddressCount;
  const fee = FEES[addressCount] ?? formatAmount(addressCount * 0.00819578);
  const supportsMemo = MEMO_COINS.includes(risk.batchCoin.sym);

  return (
    <Dialog
      open
      onClose={risk.closeBatchConfirm}
      maxWidth={false}
      PaperProps={{ sx: { width: 600, maxHeight: '88vh' } }}
    >
      <Box sx={{ px: 6, pt: 6, pb: 6 }}>
        <DialogTitleBar title="退款確認" onClose={risk.closeBatchConfirm} />
      </Box>

      <DialogContent sx={{ px: 6, pt: 0, pb: 6 }}>
        <Stack sx={{ bgcolor: 'grey.100', borderRadius: 3, px: 6, py: 5, gap: 3.5 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ gap: 4 }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>總共退款金額</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {formatAmount(risk.batchSelectedTotal)} {unit}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ gap: 4 }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>退款網路</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {risk.batchCoin.label.split('-')[1]}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ gap: 4 }}>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', flex: '0 0 auto' }}>
              退款地址
            </Typography>
            <Typography noWrap sx={{ fontSize: 15, fontWeight: 600, minWidth: 0 }}>
              {risk.batchRefundAddress}
            </Typography>
          </Stack>
          {supportsMemo && (
            <Stack direction="row" justifyContent="space-between" sx={{ gap: 4 }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', flex: '0 0 auto' }}>
                Memo
              </Typography>
              <Typography noWrap sx={{ fontSize: 15, fontWeight: 600, minWidth: 0 }}>
                {risk.batchMemo.trim() || '--'}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 4 }}>
            <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>預估費用</Typography>
              <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                <Info size={17} strokeWidth={1.6} />
              </Box>
            </Stack>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{fee} USDT</Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 5, borderRadius: 3, overflow: 'hidden', boxShadow: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ gap: 4, bgcolor: 'grey.200', px: 5, py: 3.5 }}>
            <CheckBox
              checked={selected === total}
              partial={selected > 0 && selected < total}
              onClick={risk.toggleBatchAll}
            />
            <Typography sx={{ flex: 1, fontSize: 14, color: 'text.secondary' }}>地址</Typography>
            <Typography sx={{ width: 170, flex: '0 0 170px', fontSize: 14, color: 'text.secondary' }}>
              數量
            </Typography>
            <Box sx={{ width: 24, flex: '0 0 24px' }} />
          </Stack>

          {BATCH_GROUPS.map((group) => {
            const picked = group.children.filter((c) => risk.batchSelection[c.id]).length;
            const groupTotal = group.children.reduce((s, c) => s + c.amount, 0);
            const open = !!expanded[group.addr];

            return (
              <Box key={group.addr}>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    gap: 4,
                    px: 5,
                    py: 4,
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CheckBox
                    checked={picked === group.children.length}
                    partial={picked > 0 && picked < group.children.length}
                    onClick={() => risk.toggleBatchGroup(group.addr)}
                  />
                  <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 15 }}>
                    {`${group.addr.slice(0, 26)}…`}
                  </Typography>
                  <CopyButton value={group.addr} />
                  <Typography sx={{ width: 170, flex: '0 0 170px', fontSize: 15 }}>
                    {formatAmount(groupTotal)} {unit}
                  </Typography>
                  <Box
                    role="button"
                    aria-label={open ? '收合明細' : '展開明細'}
                    onClick={() => setExpanded((prev) => ({ ...prev, [group.addr]: !prev[group.addr] }))}
                    sx={{ flex: '0 0 22px', color: 'text.secondary', cursor: 'pointer', display: 'inline-flex' }}
                  >
                    {open ? <ChevronDown size={22} strokeWidth={1.8} /> : <ChevronRight size={22} strokeWidth={1.8} />}
                  </Box>
                </Stack>

                {open &&
                  group.children.map((child) => (
                    <Stack
                      key={child.id}
                      direction="row"
                      alignItems="center"
                      sx={{
                        gap: 4,
                        pl: 12,
                        pr: 5,
                        py: 4,
                        bgcolor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <CheckBox
                        checked={!!risk.batchSelection[child.id]}
                        onClick={() => risk.toggleBatchChild(child.id)}
                      />
                      <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 14 }}>
                        紀錄 ID: {`${child.id.slice(0, 20)}…`}
                      </Typography>
                      <CopyButton value={child.id} />
                      <Typography sx={{ width: 170, flex: '0 0 170px', fontSize: 15 }}>
                        {formatAmount(child.amount)} {unit}
                      </Typography>
                      <Box sx={{ width: 22, flex: '0 0 22px' }} />
                    </Stack>
                  ))}
              </Box>
            );
          })}
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={risk.closeBatchConfirm}
          sx={{ mt: 6, height: 56, fontSize: 15, fontWeight: 600 }}
        >
          確認
        </Button>
      </DialogContent>
    </Dialog>
  );
});
