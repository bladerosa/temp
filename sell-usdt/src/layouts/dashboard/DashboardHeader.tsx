import { Box, IconButton, Tooltip } from '@mui/material';
import { Settings, Smile } from 'lucide-react';

export function DashboardHeader() {
  return (
    <Box
      sx={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 8,
        gap: 3,
        flexShrink: 0,
        bgcolor: '#F4F6F8',
      }}
    >
      <Tooltip title="设置">
        <IconButton
          sx={{
            width: 36,
            height: 36,
            color: 'grey.600',
          }}
        >
          <Settings size={22} strokeWidth={1.8} />
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          color: '#FFFFFF',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Smile size={22} strokeWidth={1.8} />
      </Box>
    </Box>
  );
}
