import { useState } from 'react';
import { Box } from '@mui/material';

export interface CryptoBadgeProps {
  symbol: string;
  size?: number;
}

/**
 * 先尝试 `/crypto/<SYMBOL>.svg`，取不到时回落到首字母圆形（DS 规定的降级形态）。
 */
export function CryptoBadge({ symbol, size = 22 }: CryptoBadgeProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          flex: `0 0 ${size}px`,
          borderRadius: '50%',
          bgcolor: 'grey.300',
          color: 'text.inverse',
          display: 'grid',
          placeItems: 'center',
          fontSize: size <= 24 ? 10 : 12,
          fontWeight: 800,
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.12)',
        }}
      >
        {symbol.slice(0, 1)}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={`/crypto/${symbol}.svg`}
      alt={symbol}
      onError={() => setFailed(true)}
      sx={{ width: size, height: size, flex: `0 0 ${size}px`, display: 'block' }}
    />
  );
}
