import { useRef, useState, useEffect } from 'react';
import { Box, Button, Popper, Paper, Stack, ClickAwayListener } from '@mui/material';
import { Calendar, ChevronDown } from 'lucide-react';
import { fmtRangeStr } from '@/utils/dateRange';

export interface DateRangePickerProps {
  from: string;
  to: string;
  presets?: string[];
  /** Called when the user clicks a preset OR picks a custom range and clicks 应用. */
  onChange: (preset: string, from?: string, to?: string) => void;
}

const DEFAULT_PRESETS = ['今日', '本周', '本月', '近30天', '近90天', '本季度', '今年至今'];

export function DateRangePicker({
  from,
  to,
  presets = DEFAULT_PRESETS,
  onChange,
}: DateRangePickerProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
  }, [from, to]);

  const slashToDash = (s: string) => s.replaceAll('/', '-');
  const dashToSlash = (s: string) => s.replaceAll('-', '/');

  return (
    <Box ref={anchorRef} sx={{ position: 'relative' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 32,
          px: 3,
          gap: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          fontSize: 13,
          fontWeight: 500,
          color: 'text.primary',
          cursor: 'pointer',
          '&:hover': { borderColor: 'grey.300' },
        }}
      >
        <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
          <Calendar size={14} />
        </Box>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtRangeStr(from, to)}</span>
        <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
          <ChevronDown size={12} />
        </Box>
      </Box>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper
            sx={{
              mt: 1,
              p: 3,
              width: 360,
              borderRadius: 3,
              boxShadow: '0 0 2px rgba(145,158,171,0.24), -20px 20px 40px -4px rgba(145,158,171,0.24)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {presets.map((p) => (
                <Button
                  key={p}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  sx={{ minWidth: 0, height: 28, px: 2, fontSize: 12 }}
                >
                  {p}
                </Button>
              ))}
            </Box>
            <Box sx={{ height: '1px', bgcolor: 'divider', my: 1.5 }} />
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>起始</Box>
                <input
                  type="date"
                  value={slashToDash(draftFrom)}
                  onChange={(e) => setDraftFrom(dashToSlash(e.target.value))}
                  style={{
                    width: '100%',
                    height: 32,
                    border: '1px solid #E8ECF2',
                    borderRadius: 6,
                    padding: '0 8px',
                    fontFamily: 'inherit',
                    fontSize: 13,
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>结束</Box>
                <input
                  type="date"
                  value={slashToDash(draftTo)}
                  onChange={(e) => setDraftTo(dashToSlash(e.target.value))}
                  style={{
                    width: '100%',
                    height: 32,
                    border: '1px solid #E8ECF2',
                    borderRadius: 6,
                    padding: '0 8px',
                    fontFamily: 'inherit',
                    fontSize: 13,
                  }}
                />
              </Box>
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" onClick={() => setOpen(false)}>取消</Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  onChange('自定义', draftFrom, draftTo);
                  setOpen(false);
                }}
              >
                应用
              </Button>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
