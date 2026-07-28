import { Box, CircularProgress } from '@mui/material';

export function PageLoader() {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '60vh',
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}
