import Box from '@mui/material/Box';
import { DOC_URLS } from '@/data/guide';

/* Floating circular Telegram support button — bottom-right of every page. */
export function TelegramFab() {
  return (
    <Box
      component="a"
      href={DOC_URLS.telegram}
      target="_blank"
      rel="noopener"
      aria-label="Contact support on Telegram"
      sx={{
        position: 'fixed',
        right: 32,
        bottom: 32,
        zIndex: 90,
        width: 56,
        height: 56,
        borderRadius: '50%',
        bgcolor: '#2AABEE',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 16px 0 rgba(42,171,238,0.32)',
        transition: 'background 120ms ease-out, transform 120ms ease-out',
        '&:hover': { bgcolor: '#1E96D6', transform: 'translateY(-2px)' },
      }}
    >
      <Box component="svg" viewBox="0 0 24 24" sx={{ width: 26, height: 26, mr: '2px', fill: 'currentColor' }}>
        <path d="M21.94 4.16c.26-1.07-.4-1.55-1.13-1.28L2.6 9.9c-1.07.42-1.05 1.03-.18 1.3l4.64 1.45 10.78-6.8c.51-.33.97-.15.59.18l-8.73 7.89-.34 4.8c.49 0 .7-.21.96-.46l2.3-2.22 4.78 3.53c.88.49 1.51.23 1.73-.81l3.13-14.6Z" />
      </Box>
    </Box>
  );
}
