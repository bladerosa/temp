import {
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { InactiveWindow, Schedule, TimeUnit } from '@/data/types';

// =============================================================================
// ScheduleEditor — every / unit / anchorTime row, plus an optional inactive
// window row when callers pass `inactiveWindow`/`onInactiveWindowChange`.
// Used by InactiveTask + BalanceCheckTask in the auto-collection wizard.
// =============================================================================

export type ScheduleEditorProps = {
  value: Schedule;
  onChange: (next: Schedule) => void;
  inactiveWindow?: InactiveWindow;
  onInactiveWindowChange?: (next: InactiveWindow) => void;
};

export function ScheduleEditor({
  value,
  onChange,
  inactiveWindow,
  onInactiveWindowChange,
}: ScheduleEditorProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'grey.100',
        p: 3,
      }}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 500 }}>
            每隔
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              type="number"
              size="small"
              value={value.every}
              onChange={(e) =>
                onChange({ ...value, every: Math.max(1, Number(e.target.value) || 1) })
              }
              inputProps={{ min: 1 }}
              sx={{ width: 100 }}
            />
            <TextField
              select
              size="small"
              value={value.unit}
              onChange={(e) => onChange({ ...value, unit: e.target.value as TimeUnit })}
              sx={{ width: 110 }}
            >
              <MenuItem value="minute">分钟</MenuItem>
              <MenuItem value="hour">小时</MenuItem>
              <MenuItem value="day">天</MenuItem>
            </TextField>
            <Typography variant="caption" color="text.secondary">
              执行一次
            </Typography>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 500 }}>
            执行时刻
          </Typography>
          <TextField
            type="time"
            size="small"
            value={value.anchorTime}
            onChange={(e) => onChange({ ...value, anchorTime: e.target.value })}
            sx={{ width: 140 }}
          />
        </Stack>

        {inactiveWindow && onInactiveWindowChange && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 500 }}>
              未活跃时长
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                type="number"
                size="small"
                value={inactiveWindow.value}
                onChange={(e) =>
                  onInactiveWindowChange({
                    ...inactiveWindow,
                    value: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                inputProps={{ min: 1 }}
                sx={{ width: 100 }}
              />
              <TextField
                select
                size="small"
                value={inactiveWindow.unit}
                onChange={(e) =>
                  onInactiveWindowChange({
                    ...inactiveWindow,
                    unit: e.target.value as InactiveWindow['unit'],
                  })
                }
                sx={{ width: 110 }}
              >
                <MenuItem value="day">天</MenuItem>
                <MenuItem value="week">周</MenuItem>
                <MenuItem value="month">月</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        )}

        <Typography variant="caption" color="text.secondary">
          定时任务以「执行时刻」对齐到具体时间点，并按所选周期循环执行。
        </Typography>
      </Stack>
    </Box>
  );
}

export default ScheduleEditor;
