import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

interface SvgMarkupProps {
  markup: string;
  size: number;
  sx?: SxProps<Theme>;
}

/* Renders a trusted static SVG string (coin badges, guide icons). */
export function SvgMarkup({ markup, size, sx }: SvgMarkupProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-flex',
        '& svg': { width: '100%', height: '100%', display: 'block' },
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
