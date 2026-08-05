import { useState } from 'react';
import { Box, InputBase, Menu, MenuItem, Typography } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SearchFieldProps<T extends string> {
  fields: readonly T[];
  field: T;
  onFieldChange: (field: T) => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** 原型里付款 Tab 520px、提款 Tab 620px。 */
  maxWidth?: number;
}

/** 「搜索字段下拉 + 分隔线 + 输入框」的组合控件。 */
export function SearchField<T extends string>({
  fields,
  field,
  onFieldChange,
  query,
  onQueryChange,
  maxWidth = 520,
}: SearchFieldProps<T>) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  return (
    <Box
      sx={{
        height: 44,
        // 基准取小值让它先留在同一行，再靠 grow 撑到设计宽度 —— flex-wrap
        // 是先按 basis 断行、再在行内伸缩的。
        flex: '1 1 320px',
        maxWidth,
        minWidth: 280,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pl: 4,
          pr: 3,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{field}</Typography>
        <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
          {open ? <ChevronUp size={18} strokeWidth={1.7} /> : <ChevronDown size={18} strokeWidth={1.7} />}
        </Box>
      </Box>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 150, mt: 1 } } }}
      >
        {fields.map((f) => (
          <MenuItem
            key={f}
            selected={f === field}
            onClick={() => {
              onFieldChange(f);
              setAnchor(null);
            }}
            sx={{ fontSize: 14 }}
          >
            {f}
          </MenuItem>
        ))}
      </Menu>

      <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />

      <InputBase
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="搜尋"
        inputProps={{ 'aria-label': `搜尋 ${field}` }}
        sx={{ flex: 1, minWidth: 0, height: '100%', px: 4, fontSize: 14 }}
      />
    </Box>
  );
}
