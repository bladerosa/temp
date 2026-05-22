import { Box, Stack } from '@mui/material';

export interface FinancePieDatum {
  label: string;
  value: number;
  color: string;
}

export interface FinancePieProps {
  data: FinancePieDatum[];
  size?: number;
}

export function FinancePie({ data, size = 150 }: FinancePieProps) {
  const sum = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  return (
    <Stack direction="row" alignItems="center" spacing={3.5}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const startA = (acc / sum) * Math.PI * 2 - Math.PI / 2;
          acc += d.value;
          const endA = (acc / sum) * Math.PI * 2 - Math.PI / 2;
          const large = endA - startA > Math.PI ? 1 : 0;
          const x1 = cx + r * Math.cos(startA);
          const y1 = cy + r * Math.sin(startA);
          const x2 = cx + r * Math.cos(endA);
          const y2 = cy + r * Math.sin(endA);
          if (d.value === 0) return null;
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={d.color}
              stroke="#fff"
              strokeWidth={1}
            />
          );
        })}
      </svg>
      <Stack spacing={1}>
        {data.map((d, i) => {
          const pct = ((d.value / sum) * 100).toFixed(2);
          return (
            <Stack key={i} direction="row" spacing={2} alignItems="center" sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
              <Box sx={{ color: 'text.secondary' }}>
                {d.label}: {pct}%
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
