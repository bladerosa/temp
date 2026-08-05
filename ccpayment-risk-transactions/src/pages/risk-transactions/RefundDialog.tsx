import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ScanLine, X } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { FULL_ADDRESS, MEMO_COINS } from '@/data/riskTransactions';
import { useStores } from '@/stores';
import { stripSign } from '@/utils/format';
import { DialogTitleBar } from './shared';

type RefundMode = '' | 'origin' | 'custom';

/** 原型固定的三档预估费用。 */
const feeFor = (mode: RefundMode, hasAddress: boolean) => {
  if (!mode) return '0.04067';
  if (mode === 'custom' && hasAddress) return '0.04199';
  return '0.04099';
};

export const RefundDialog = observer(function RefundDialog() {
  const { risk } = useStores();
  const row = risk.refundTarget;

  const [mode, setMode] = useState<RefundMode>('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (row) {
      setMode('');
      setAddress('');
      setMemo('');
    }
  }, [row]);

  if (!row) return null;

  const originAddress = FULL_ADDRESS[row.from] ?? row.from;
  const hasAddress = address.trim().length > 0;
  const supportsMemo = MEMO_COINS.includes(row.symbol);
  const canSend = mode === 'origin' || (mode === 'custom' && hasAddress);
  const inputLabel = `${row.chain} 地址`;

  return (
    <Dialog open onClose={risk.closeRefund} maxWidth={false} PaperProps={{ sx: { width: 520 } }}>
      <Box sx={{ px: 6, pt: 6, pb: 4 }}>
        <DialogTitleBar title="退款" onClose={risk.closeRefund} />
      </Box>

      <DialogContent sx={{ px: 6, pt: 0, pb: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <TextField
          select
          label="至地址"
          value={mode}
          onChange={(e) => {
            const next = e.target.value as RefundMode;
            setMode(next);
            if (next === 'custom') setAddress('');
          }}
          InputLabelProps={{ shrink: Boolean(mode) }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (v) => {
              if (v === 'origin') return '退款至付款地址';
              if (v === 'custom') return '提款至指定地址';
              return <Box sx={{ color: 'text.disabled' }}>至地址</Box>;
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { height: 56, fontSize: 16 } }}
        >
          <MenuItem value="origin" sx={{ fontSize: 15 }}>
            退款至付款地址
          </MenuItem>
          <MenuItem value="custom" sx={{ fontSize: 15 }}>
            提款至指定地址
          </MenuItem>
        </TextField>

        {mode !== 'custom' && (
          <Box>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.5 }}>地址</Typography>
            <Stack direction="row" alignItems="center" sx={{ gap: 3 }}>
              <Box sx={{ fontSize: 15, wordBreak: 'break-all' }}>{originAddress}</Box>
              <CopyButton value={originAddress} size={18} />
            </Stack>
          </Box>
        )}

        {mode === 'custom' && (
          <TextField
            label={inputLabel}
            placeholder={inputLabel}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            InputLabelProps={{ shrink: hasAddress }}
            InputProps={{
              sx: { height: 56, fontSize: 16 },
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
                    {hasAddress && (
                      <IconButton aria-label="清除地址" size="small" onClick={() => setAddress('')}>
                        <X size={18} strokeWidth={1.8} />
                      </IconButton>
                    )}
                    <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                      <ScanLine size={22} strokeWidth={1.5} />
                    </Box>
                  </Stack>
                </InputAdornment>
              ),
            }}
          />
        )}

        {supportsMemo && mode !== '' && (
          <Box>
            <TextField
              fullWidth
              label="Memo（選填）"
              placeholder="Memo（選填）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              InputLabelProps={{ shrink: memo.trim().length > 0 }}
              InputProps={{
                sx: { height: 56, fontSize: 16 },
                endAdornment: memo.trim().length > 0 && (
                  <InputAdornment position="end">
                    <IconButton aria-label="清除 Memo" size="small" onClick={() => setMemo('')}>
                      <X size={18} strokeWidth={1.8} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary', mt: 1.5 }}>
              此幣種支持 memo，若收款方要求請填寫，否則可留空
            </Typography>
          </Box>
        )}

        <Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.5 }}>區塊鏈</Typography>
          <Typography sx={{ fontSize: 15 }}>{row.chain}</Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.5 }}>費用</Typography>
          <Typography sx={{ fontSize: 15 }}>{feeFor(mode, hasAddress)} USDT</Typography>
          <Typography sx={{ fontSize: 13, color: 'warning.dark', mt: 1 }}>
            費用將從商家帳戶中扣除
          </Typography>
        </Box>
      </DialogContent>

      <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent="space-between"
        sx={{ borderTop: '1px solid', borderColor: 'divider', px: 6, pt: 4, pb: 5, gap: 6 }}
      >
        <Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>接收數量</Typography>
          <Typography variant="h3">{stripSign(row.amount)}</Typography>
        </Box>
        <Button
          variant="contained"
          disabled={!canSend}
          onClick={risk.closeRefund}
          sx={{ px: 7, py: 3, fontSize: 15, fontWeight: 600 }}
        >
          發送
        </Button>
      </Stack>
    </Dialog>
  );
});
