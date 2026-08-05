import { Box } from '@mui/material';
import type { ReprocessStatus, WithdrawStatus } from '@/data/riskTransactions';

/** 「重新處理狀態」——描边 chip。 */
export const REPROCESS_META: Record<
  ReprocessStatus,
  { label: string; fg: string; border: string }
> = {
  pending: { label: '等待中', fg: 'warning.dark', border: 'warning.light' },
  refunded: { label: '已退款', fg: 'success.dark', border: 'success.light' },
  rejected: { label: '已拒絕', fg: 'error.main', border: 'error.light' },
  failed: { label: '失敗', fg: 'error.main', border: 'error.light' },
};

/** 風險資金提款状态——软色底 chip。 */
export const WITHDRAW_STATUS_META: Record<
  WithdrawStatus,
  { label: string; bg: string; fg: string }
> = {
  success: { label: '成功', bg: 'success.lighter', fg: 'success.dark' },
  failed: { label: '失敗', bg: 'error.lighter', fg: 'error.main' },
  rejected: { label: '已拒絕', bg: 'error.lighter', fg: 'error.dark' },
};

export function SoftChip({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 2.25,
        py: 0.75,
        borderRadius: 1.5,
        fontSize: 12,
        fontWeight: 500,
        bgcolor: bg,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}

export function OutlineChip({ label, fg, border }: { label: string; fg: string; border: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 2.25,
        py: 0.75,
        borderRadius: 1.5,
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid',
        borderColor: border,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}

/** 批量标记。 */
export function BatchTag() {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 500,
        bgcolor: 'grey.200',
        color: 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      批量
    </Box>
  );
}
