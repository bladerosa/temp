import { Box } from '@mui/material';

export interface KpiNumberCellProps {
  value: number | null | undefined;
  pct?: number | null;
  suffix?: string | null;
  onClick?: () => void;
}

export function KpiNumberCell({ value, pct, suffix, onClick }: KpiNumberCellProps) {
  if (value === null || value === undefined) {
    return <Box component="span" sx={{ color: 'text.disabled' }}>--</Box>;
  }
  const nonZero = value > 0;
  const clickable = nonZero && !!onClick;
  return (
    <Box
      component="span"
      onClick={
        clickable
          ? (e) => {
              e.stopPropagation();
              onClick?.();
            }
          : undefined
      }
      title={clickable ? '点击查看该统计项的商户列表' : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.5,
        cursor: clickable ? 'pointer' : 'default',
        '& .num': {
          fontSize: 14,
          fontWeight: 600,
          color: nonZero ? 'primary.main' : 'text.primary',
        },
        '&:hover .num': clickable ? { textDecoration: 'underline' } : {},
      }}
    >
      <span className="num">{value.toLocaleString()}</span>
      {suffix && (
        <Box component="span" sx={{ fontSize: 11.5, color: 'text.secondary', pointerEvents: 'none' }}>
          ({suffix})
        </Box>
      )}
      {pct != null && (
        <Box component="span" sx={{ fontSize: 11.5, color: 'text.secondary', pointerEvents: 'none' }}>
          ({typeof pct === 'number' ? pct.toFixed(2) : pct}%)
        </Box>
      )}
    </Box>
  );
}
