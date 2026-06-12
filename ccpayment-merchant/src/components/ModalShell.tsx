import type { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';

interface ModalShellProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

/* Prototype-faithful dialog: 660px surface, 20px radius, 26px bold title
   with a round close button. Esc / backdrop close handled by MUI. */
export function ModalShell({ open, title, onClose, children, width = 660 }: ModalShellProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width,
          maxWidth: '100%',
          borderRadius: '20px',
          p: '32px 36px 36px',
          m: 6,
        },
      }}
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(33,43,54,0.55)' } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '26px' }}>
        <Typography sx={{ fontSize: 26, fontWeight: 700, color: 'text.primary', letterSpacing: '-0.2px' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close" sx={{ width: 36, height: 36, color: 'grey.600' }}>
          <X size={22} />
        </IconButton>
      </Box>
      {children}
    </Dialog>
  );
}
