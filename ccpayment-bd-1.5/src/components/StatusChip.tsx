import { Box } from '@mui/material';
import type { WithdrawalStatus } from '@/data/withdrawals';
import { WD_STATUS_LABEL } from '@/data/withdrawals';

const COLORS: Record<WithdrawalStatus, { bg: string; fg: string }> = {
  paying: { bg: 'warning.lighter', fg: 'warning.dark' },
  paid: { bg: 'success.lighter', fg: 'success.dark' },
  rejected: { bg: 'error.lighter', fg: 'error.dark' },
  failed: { bg: 'rgba(145,158,171,0.14)', fg: 'text.secondary' },
};

export function StatusChip({ status }: { status: WithdrawalStatus }) {
  const c = COLORS[status];
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        p: '4px 10px',
        borderRadius: '6px',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        bgcolor: c.bg,
        color: c.fg,
      }}
    >
      {WD_STATUS_LABEL[status]}
    </Box>
  );
}
