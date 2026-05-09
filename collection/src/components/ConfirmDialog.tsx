import type { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

// Generic confirmation dialog. Used for "delete task", "abort job", and
// the manual-collection submit confirmation. The `tone` controls the
// confirm button color so we don't reach for inline sx everywhere.

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: 'primary' | 'error';
  /** When false, ESC and backdrop won't dismiss. Defaults true. */
  dismissable?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmText = '确认',
  cancelText = '取消',
  tone = 'primary',
  dismissable = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    // DS Dialog spec: confirm width 480px (NOT MUI maxWidth="sm" = 600).
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (!dismissable && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        onClose();
      }}
      disableEscapeKeyDown={!dismissable}
      PaperProps={{ sx: { width: 480, maxWidth: 'calc(100vw - 32px)' } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{body}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text" color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={tone} variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
