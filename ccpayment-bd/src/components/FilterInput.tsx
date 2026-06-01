import { Box, Menu, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface KeyOption<K extends string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  keyOptions: KeyOption<K>[];
  activeKey: K;
  onKeyChange: (k: K) => void;
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;
  width?: number;
}

export function FilterInput<K extends string>({
  keyOptions,
  activeKey,
  onKeyChange,
  query,
  onQueryChange,
  placeholder = '',
  width = 380,
}: Props<K>) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const activeLabel = keyOptions.find((k) => k.key === activeKey)?.label ?? '';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        height: 44,
        width,
        maxWidth: '100%',
        transition: 'border-color .12s, box-shadow .12s',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 4px rgba(60,111,245,0.10)',
        },
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          bgcolor: 'transparent',
          border: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          px: '14px',
          height: 28,
          m: '0 8px',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 500,
          color: 'text.primary',
          cursor: 'pointer',
          flex: 'none',
        }}
      >
        {activeLabel}
        <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
          <ChevronDown size={14} />
        </Box>
      </Box>
      <Box
        component="input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          flex: 1,
          border: 0,
          background: 'transparent',
          p: '0 14px 0 4px',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'text.primary',
          outline: 'none',
          height: '100%',
          '&::placeholder': { color: 'text.disabled' },
        }}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 160, mt: 1, borderRadius: '10px' } }}
      >
        {keyOptions.map((k) => (
          <MenuItem
            key={k.key}
            selected={k.key === activeKey}
            onClick={() => {
              onKeyChange(k.key);
              setAnchor(null);
            }}
          >
            {k.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
