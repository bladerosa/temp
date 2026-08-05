import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ScanLine, X } from 'lucide-react';
import { CryptoBadge } from '@/components/CryptoBadge';
import { BATCH_ADDRESSES, BATCH_COINS, MEMO_COINS } from '@/data/riskTransactions';
import { useStores } from '@/stores';
import type { BatchType } from '@/stores/RiskTransactionStore';
import { DialogTitleBar } from './shared';

export const BatchRefundDrawer = observer(function BatchRefundDrawer() {
  const { risk } = useStores();

  const isToken = risk.batchType === 'token';
  const supportsMemo = MEMO_COINS.includes(risk.batchCoin.sym);
  const canNext = risk.batchRefundAddress.trim().length > 0;

  return (
    <Drawer
      anchor="right"
      open={risk.batchOpen}
      onClose={risk.closeBatch}
      PaperProps={{ sx: { width: 400, maxWidth: '100vw' } }}
    >
      <Box sx={{ px: 6, pt: 6, pb: 2 }}>
        <DialogTitleBar title="批量退款" onClose={risk.closeBatch} align="flex-start" />
      </Box>

      <Stack sx={{ flex: 1, overflowY: 'auto', px: 6, pt: 3, pb: 6, gap: 5 }}>
        <Typography sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary' }}>
          根據條件篩選未處理的風險交易，批量退款
        </Typography>

        <TextField
          select
          label="退款類型"
          value={risk.batchType}
          onChange={(e) => risk.setBatchType(e.target.value as BatchType)}
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { height: 56, fontSize: 16 } }}
        >
          <MenuItem value="token" sx={{ fontSize: 15 }}>
            指定代幣
          </MenuItem>
          <MenuItem value="address" sx={{ fontSize: 15 }}>
            指定地址
          </MenuItem>
        </TextField>

        {!isToken && (
          <TextField
            select
            label="選擇地址"
            value={risk.batchAddress}
            onChange={(e) => risk.setBatchAddress(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { height: 56, fontSize: 15 } }}
            SelectProps={{
              renderValue: (v) => (
                <Typography noWrap sx={{ fontSize: 15 }}>
                  {String(v)}
                </Typography>
              ),
            }}
          >
            {BATCH_ADDRESSES.map((a) => (
              <MenuItem key={a} value={a} sx={{ fontSize: 14 }}>
                <Typography noWrap sx={{ fontSize: 14 }}>
                  {a}
                </Typography>
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          select
          label="選擇代幣"
          value={risk.batchCoin.label}
          onChange={(e) => {
            const next = BATCH_COINS.find((c) => c.label === e.target.value);
            if (next) risk.setBatchCoin(next);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { height: 56, fontSize: 16 } }}
          SelectProps={{
            renderValue: (v) => {
              const coin = BATCH_COINS.find((c) => c.label === v);
              return (
                <Stack direction="row" alignItems="center" sx={{ gap: 3 }}>
                  {coin && <CryptoBadge symbol={coin.sym} size={26} />}
                  <Box component="span" sx={{ fontSize: 16 }}>
                    {String(v)}
                  </Box>
                </Stack>
              );
            },
          }}
        >
          {BATCH_COINS.map((c) => (
            <MenuItem key={c.label} value={c.label} sx={{ fontSize: 15, gap: 3 }}>
              <CryptoBadge symbol={c.sym} size={24} />
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        {isToken && (
          <Box>
            <TextField
              fullWidth
              label="最小退款金額"
              placeholder="最小退款金額"
              value={risk.batchMin}
              onChange={(e) => risk.setBatchMin(e.target.value)}
              InputLabelProps={{ shrink: risk.batchMin.trim().length > 0 }}
              InputProps={{
                sx: { height: 56, fontSize: 16 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>USD</Typography>
                  </InputAdornment>
                ),
              }}
            />
            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary', mt: 2 }}>
              小於此金額的地址將不會發起退款
            </Typography>
          </Box>
        )}

        <TextField
          label="退款地址"
          placeholder="退款地址"
          value={risk.batchRefundAddress}
          onChange={(e) => risk.setBatchRefundAddress(e.target.value)}
          InputLabelProps={{ shrink: canNext }}
          InputProps={{
            sx: { height: 56, fontSize: 16 },
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                  <ScanLine size={22} strokeWidth={1.5} />
                </Box>
              </InputAdornment>
            ),
          }}
        />

        {supportsMemo && (
          <Box>
            <TextField
              fullWidth
              label="Memo（選填）"
              placeholder="Memo（選填）"
              value={risk.batchMemo}
              onChange={(e) => risk.setBatchMemo(e.target.value)}
              InputLabelProps={{ shrink: risk.batchMemo.trim().length > 0 }}
              InputProps={{
                sx: { height: 56, fontSize: 16 },
                endAdornment: risk.batchMemo.trim().length > 0 && (
                  <InputAdornment position="end">
                    <IconButton aria-label="清除 Memo" size="small" onClick={() => risk.setBatchMemo('')}>
                      <X size={18} strokeWidth={1.8} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary', mt: 2 }}>
              此幣種支持 memo，若收款方要求請填寫，否則可留空
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          disabled={!canNext}
          onClick={risk.submitBatch}
          sx={{ height: 52, fontSize: 15, fontWeight: 600, mt: 1 }}
        >
          下一步
        </Button>
      </Stack>
    </Drawer>
  );
});
