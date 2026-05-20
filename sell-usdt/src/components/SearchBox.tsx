import { Box, InputBase } from '@mui/material';
import { ChevronDown } from 'lucide-react';

export function SearchBox() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 44,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        minWidth: 360,
        transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 3px rgba(60,111,245,0.12)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          fontSize: 14,
          color: 'text.primary',
          cursor: 'pointer',
          height: '100%',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        商户ID
        <Box sx={{ display: 'inline-flex', color: 'grey.500' }}>
          <ChevronDown size={14} />
        </Box>
      </Box>
      <InputBase
        placeholder="search"
        sx={{
          flex: 1,
          px: 3.5,
          fontSize: 14,
          height: '100%',
          color: 'text.primary',
        }}
      />
    </Box>
  );
}
