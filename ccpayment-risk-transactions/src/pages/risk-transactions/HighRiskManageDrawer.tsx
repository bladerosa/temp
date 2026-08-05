import { useEffect, useState } from 'react';
import { Box, Button, Drawer, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { DialogTitleBar } from './shared';

const MODE_OPTIONS = [
  { value: 'auto' as const, label: '自动退款（不支持memo币种）' },
  { value: 'manual' as const, label: '手動重新處理' },
];

const PATH_OPTIONS = ['原路退回', '指定地址'];

export const HighRiskManageDrawer = observer(function HighRiskManageDrawer() {
  const { risk } = useStores();
  const [draft, setDraft] = useState(risk.settings.threshold);

  // 每次打开都从已保存的触发值重新起草。
  useEffect(() => {
    if (risk.manageOpen) setDraft(risk.settings.threshold);
  }, [risk.manageOpen, risk.settings.threshold]);

  const isAuto = risk.settings.mode === 'auto';

  return (
    <Drawer
      anchor="right"
      open={risk.manageOpen}
      onClose={risk.closeManage}
      PaperProps={{ sx: { width: 400, maxWidth: '100vw' } }}
    >
      <Box sx={{ px: 6, pt: 6, pb: 2 }}>
        <DialogTitleBar title="風險付款管理" onClose={risk.closeManage} align="flex-start" />
      </Box>

      <Stack sx={{ flex: 1, overflowY: 'auto', px: 6, pt: 4, pb: 6, gap: 6 }}>
        <TextField
          select
          label="高風險支付管理"
          value={risk.settings.mode}
          onChange={(e) => risk.setSettingsMode(e.target.value as 'auto' | 'manual')}
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { height: 52 } }}
        >
          {MODE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value} sx={{ fontSize: 14 }}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        {isAuto && (
          <Stack sx={{ gap: 3 }}>
            <TextField
              select
              label="退回路徑"
              value={risk.settings.path}
              onChange={(e) => risk.setSettingsPath(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { height: 52 } }}
            >
              {PATH_OPTIONS.map((p) => (
                <MenuItem key={p} value={p} sx={{ fontSize: 14 }}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="自動退款觸發值"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>USD</Typography>
                  </InputAdornment>
                ),
                sx: { height: 52, fontSize: 15 },
              }}
            />

            <Typography sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary' }}>
              單筆風險充值達到配置金額，將自動退款到指定地址
            </Typography>
          </Stack>
        )}

        <Button
          variant="contained"
          onClick={() => void risk.saveThreshold(draft)}
          sx={{ height: 52, fontSize: 15, fontWeight: 600, mt: 2 }}
        >
          確認
        </Button>
      </Stack>
    </Drawer>
  );
});
