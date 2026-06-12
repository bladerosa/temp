import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { Check, X } from 'lucide-react';

interface CopyToastProps {
  open: boolean;
  onClose: () => void;
}

/* Top-right "Copied to clipboard!" toast (AI Agent tile). */
export function CopyToast({ open, onClose }: CopyToastProps) {
  return (
    <Box
      role="status"
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -4px rgba(145,158,171,0.24), 0 0 2px 0 rgba(145,158,171,0.24)',
        p: '18px 20px 18px 18px',
        maxWidth: 480,
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0)' : 'translateY(-8px)',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '14px',
          flexShrink: 0,
          bgcolor: 'success.lighter',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'success.main',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
          }}
        >
          <Check size={18} strokeWidth={3} />
        </Box>
      </Box>
      <Box>
        <Box sx={{ fontSize: 19, fontWeight: 700, color: 'text.primary' }}>Copied to clipboard!</Box>
        <Box sx={{ fontSize: 16, color: 'text.secondary', mt: '3px' }}>Paste this into your AI agent to begin.</Box>
      </Box>
      <ButtonBase
        onClick={onClose}
        aria-label="Close"
        sx={{
          color: 'grey.400',
          p: '6px',
          ml: '6px',
          borderRadius: '8px',
          flexShrink: 0,
          alignSelf: 'flex-start',
          '&:hover': { bgcolor: 'grey.100', color: 'grey.600' },
        }}
      >
        <X size={20} />
      </ButtonBase>
    </Box>
  );
}
