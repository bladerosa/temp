import { memo, useState } from 'react';
import { Box } from '@mui/material';

// Brand-colored circular crypto badge. First tries `/crypto/<SYMBOL>.svg`;
// on miss, falls back to a colored circle with the symbol's first letter.
// Mirrors the bundled ui_kits/ccpayment `.crypto-badge` recipe (32×32,
// inset gloss-via-shadow, 50%-size letter in white).

export type CryptoBadgeProps = {
  symbol: string;
  /** Brand color for the fallback circle. When omitted falls back to neutral bg. */
  color?: string;
  /** Pixel size for the square box. Defaults to 32. */
  size?: number;
};

const NEUTRAL_BG = '#F8F9FB';

function CryptoBadgeImpl({ symbol, color, size = 32 }: CryptoBadgeProps) {
  const [errored, setErrored] = useState(false);
  const upper = (symbol ?? '').toUpperCase();
  const letter = (upper[0] ?? '').slice(0, 1);
  const fontSize = Math.round(size * 0.5);

  // The crypto folder is keyed by uppercase token symbol (e.g. /crypto/USDT.svg).
  const src = `/crypto/${upper}.svg`;

  if (!errored) {
    return (
      <Box
        component="img"
        src={src}
        alt={upper}
        onError={() => setErrored(true)}
        sx={{
          width: size,
          height: size,
          borderRadius: 9999,
          display: 'inline-block',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color ?? NEUTRAL_BG,
        color: color ? '#FFFFFF' : '#71757E',
        display: 'inline-grid',
        placeItems: 'center',
        fontFamily: '"Poppins", "PingFang SC", sans-serif',
        fontWeight: 800,
        fontSize,
        lineHeight: 1,
        flexShrink: 0,
        // ui_kit recipe (preview/components/Crypto-icons.html): subtle inset gloss
        // for color-filled badges, none for the bg-subtle placeholder.
        boxShadow: color ? 'inset 0 -2px 4px rgba(0,0,0,0.12)' : 'none',
        userSelect: 'none',
      }}
      aria-label={upper}
    >
      {letter}
    </Box>
  );
}

export const CryptoBadge = memo(CryptoBadgeImpl);
export default CryptoBadge;
