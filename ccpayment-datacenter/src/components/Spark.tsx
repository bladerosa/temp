import { Box } from '@mui/material';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

export interface SparkProps {
  values: number[];
  /** Optional one-per-value labels for the tooltip (e.g. "2026.05.12-2026.05.18"). */
  labels?: string[];
  /** Series label rendered in the tooltip alongside the value. */
  label?: string;
  /** Format the numeric value for the tooltip (e.g. v => `${v} 笔`). */
  valueFormat?: (v: number) => string;
  color?: string;
  /** Width in px. Pass `'100%'` to stretch the chart to its container. */
  width?: number | string;
  height?: number;
}

/** Tiny inline trend line. Backed by MUI X `<SparkLineChart>` so hover shows
 *  the data-point value (with optional "日期: ..." prefix from `labels`). */
export function Spark({
  values,
  labels,
  label = '交易笔数',
  valueFormat,
  color = '#3C6FF5',
  width = 80,
  height = 24,
}: SparkProps) {
  if (values.length === 0) return null;
  return (
    <Box sx={{ width, height, display: 'inline-block', verticalAlign: 'middle' }}>
      <SparkLineChart
        data={values}
        height={height}
        colors={[color]}
        curve="linear"
        showTooltip
        showHighlight
        valueFormatter={(v) => {
          const value = v == null ? '' : valueFormat ? valueFormat(v) : String(v);
          return `${label}: ${value}`;
        }}
        xAxis={
          labels
            ? {
                id: 'x',
                data: labels,
                scaleType: 'band',
                valueFormatter: (v) => `日期: ${v}`,
              }
            : undefined
        }
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
      />
    </Box>
  );
}
