import { Box } from '@mui/material';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  /** Optional override for total (defaults to sum of data values). */
  total?: number;
  /** Label rendered in the donut's center. */
  centerLabel?: string;
  /** Value rendered in the donut's center (defaults to `total.toLocaleString()`). */
  centerValue?: string;
  /** Fires when the user clicks a slice. `index` matches the input `data` array. */
  onSliceClick?: (index: number) => void;
}

/** Donut chart backed by MUI X `<PieChart>` — gets hover tooltips + slice
 *  highlight out of the box. Keeps the original API + center label/value
 *  composition for back-compat with existing call sites. */
export function DonutChart({
  data,
  size = 220,
  thickness = 36,
  total,
  centerLabel = '商户总数',
  centerValue,
  onSliceClick,
}: DonutChartProps) {
  const sum = total ?? data.reduce((s, d) => s + d.value, 0);
  const outerRadius = size / 2 - 4;
  const innerRadius = outerRadius - thickness;
  const seriesData = data.map((d, i) => ({
    id: `${i}-${d.label}`,
    label: d.label,
    value: d.value,
    color: d.color,
  }));

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <PieChart
        width={size}
        height={size}
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        slotProps={{ legend: { hidden: true } }}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: { fill: '#fff', fontWeight: 600, fontSize: 11 },
          ...(onSliceClick && { '& path': { cursor: 'pointer' } }),
        }}
        onItemClick={onSliceClick ? (_e, { dataIndex }) => onSliceClick(dataIndex) : undefined}
        series={[
          {
            data: seriesData,
            innerRadius,
            outerRadius,
            cx: size / 2 - 4,
            cy: size / 2 - 4,
            paddingAngle: 0.5,
            cornerRadius: 1,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius, additionalRadius: -4, color: 'gray' },
            valueFormatter: (v) => v.value.toLocaleString(),
          },
        ]}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box>
          <Box sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'Poppins' }}>{centerLabel}</Box>
          <Box sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary', fontFamily: 'Poppins' }}>
            {centerValue ?? sum.toLocaleString()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
