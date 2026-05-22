import { Box } from '@mui/material';

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
}

export interface SegmentedProps<V extends string> {
  value: V;
  options: SegmentedOption<V>[];
  onChange: (v: V) => void;
}

export function Segmented<V extends string>({ value, options, onChange }: SegmentedProps<V>) {
  return (
    <Box
      data-segmented="1"
      sx={{
        display: 'inline-flex',
        bgcolor: 'grey.100',
        borderRadius: 2,
        p: '3px',
        gap: '2px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Box
            key={o.value}
            onClick={() => onChange(o.value)}
            sx={{
              height: 28,
              px: 3,
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 1.5,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? 'background.paper' : 'transparent',
              boxShadow: active ? '0 1px 2px 0 rgba(113,117,126,0.12)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              '&:hover': active ? {} : { color: 'text.primary' },
            }}
          >
            {o.label}
          </Box>
        );
      })}
    </Box>
  );
}
