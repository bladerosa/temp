import { Box } from '@mui/material';
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer';
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart';
import { BarPlot } from '@mui/x-charts/BarChart';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';

export interface LineSeries {
  key: string;
  color: string;
  label: string;
  kind?: 'line' | 'bar';
}

export interface LineChartProps {
  /** Heterogeneous rows. Each row must have a `date` string; numeric series are
   *  looked up by `series[i].key`. We accept loosely-typed inputs here because
   *  the data shape varies per chart (profit / cost / trend / rate / etc.). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ReadonlyArray<{ date: string } & Record<string, any>>;
  series: LineSeries[];
  height?: number;
  yMax?: number;
  yMin?: number;
  hiddenSeries?: Record<string, boolean | undefined>;
  /** Render every Nth x-axis label. Defaults to a heuristic that fits ~70px per label
   *  (so 21-char range strings decimate sensibly). */
  labelEvery?: number;
  /** Format y-axis ticks and tooltip values. e.g. `(v) => `${v}%`` for the rate chart. */
  valueFormat?: (v: number) => string;
}

/** Line / mixed line+bar chart backed by MUI X compose primitives. Gets
 *  hover tooltip, line markers, axis ticks for free. The original
 *  `series[i].kind === 'bar'` switch is preserved — those series render as
 *  grouped bars via `<BarPlot>`. */
export function LineChart({
  data,
  series,
  height = 280,
  yMax,
  yMin = 0,
  hiddenSeries = {},
  labelEvery,
  valueFormat,
}: LineChartProps) {
  const visible = series.filter((s) => !hiddenSeries[s.key]);
  const xLabels = data.map((d) => d.date);

  // Compute y-axis bounds: respect yMax/yMin if provided, otherwise auto.
  const allVals = data.flatMap((d) => visible.map((s) => Number(d[s.key] ?? 0)));
  const dataMax = allVals.length ? Math.max(...allVals, 1) : 1;
  const dataMin = allVals.length ? Math.min(...allVals, 0) : 0;
  const yHi = yMax ?? Math.ceil(dataMax * 1.15);
  const yLo = yMin !== undefined && yMin < 0 ? yMin : Math.min(0, dataMin);

  // X-axis label decimation — match the heuristic the previous custom chart used.
  const avgLabelChars = data.reduce((s, d) => s + (d.date?.length ?? 0), 0) / Math.max(1, data.length);
  const labelPx = Math.max(40, avgLabelChars * 6.5 + 12);
  // Reserve ~80px of right padding for the last x-tick + tooltip.
  const innerW = 800;
  const slots = Math.max(2, Math.floor(innerW / labelPx));
  const computedLabelEvery = Math.max(1, Math.ceil(data.length / slots));
  const effLabelEvery = labelEvery ?? computedLabelEvery;
  const tickInterval = (_value: string, index: number) => index % effLabelEvery === 0;

  // Map our series-shape into MUI X series objects.
  const chartSeries = visible.map((s) => {
    const values = data.map((d) => Number(d[s.key] ?? 0));
    return {
      type: s.kind === 'bar' ? ('bar' as const) : ('line' as const),
      data: values,
      label: s.label,
      color: s.color,
      // Line series → show round markers + smooth-ish line; tooltip is global.
      showMark: s.kind !== 'bar',
      curve: 'linear' as const,
      valueFormatter: valueFormat ? (v: number | null) => (v == null ? '' : valueFormat(v)) : undefined,
    };
  });

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveChartContainer
        height={height}
        margin={{ top: 16, right: 28, bottom: 32, left: 48 }}
        xAxis={[{ id: 'x', scaleType: 'band', data: xLabels, tickInterval, tickLabelStyle: { fontSize: 11, fill: '#71757E' } }]}
        yAxis={[
          {
            id: 'y',
            min: yLo,
            max: yHi,
            tickLabelStyle: { fontSize: 11, fill: '#71757E' },
            valueFormatter: valueFormat,
          },
        ]}
        series={chartSeries}
      >
        <ChartsGrid horizontal />
        <BarPlot borderRadius={2} />
        <LinePlot />
        <MarkPlot />
        <ChartsXAxis position="bottom" axisId="x" disableLine disableTicks />
        <ChartsYAxis position="left" axisId="y" disableLine disableTicks />
        <ChartsTooltip trigger="axis" />
      </ResponsiveChartContainer>
    </Box>
  );
}
