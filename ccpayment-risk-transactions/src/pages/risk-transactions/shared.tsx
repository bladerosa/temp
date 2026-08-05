import type { ReactNode } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';

export function DialogTitleBar({
  title,
  onClose,
  align = 'center',
}: {
  title: string;
  onClose: () => void;
  align?: 'center' | 'flex-start';
}) {
  return (
    <Stack direction="row" alignItems={align} justifyContent="space-between" sx={{ gap: 4 }}>
      <Typography variant="h3">{title}</Typography>
      <IconButton aria-label="關閉" onClick={onClose} sx={{ width: 32, height: 32, flex: '0 0 32px' }}>
        <X size={20} strokeWidth={1.8} />
      </IconButton>
    </Stack>
  );
}

/** 详情弹窗里的「标签 — 值」一行，可选尾随复制按钮。 */
export function DetailRow({
  label,
  children,
  copyValue,
}: {
  label: ReactNode;
  children: ReactNode;
  copyValue?: string;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 4 }}>
      <Box sx={{ flex: '0 0 auto', fontSize: 14, color: 'text.secondary' }}>{label}</Box>
      <Stack direction="row" alignItems="center" sx={{ gap: 2.5, minWidth: 0 }}>
        <Box sx={{ fontSize: 15, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {children}
        </Box>
        {copyValue && <CopyButton value={copyValue} />}
      </Stack>
    </Stack>
  );
}

/** 抽屉 / 弹窗里成对出现的 outlined 下拉触发块（原型用的是自绘 select）。 */
export function FieldShell({
  label,
  showLabel = true,
  height = 56,
  children,
  onClick,
  borderColor = 'grey.300',
}: {
  label: string;
  showLabel?: boolean;
  height?: number;
  children: ReactNode;
  onClick?: () => void;
  borderColor?: string;
}) {
  return (
    <Box sx={{ position: 'relative' }}>
      {showLabel && (
        <Typography
          sx={{
            position: 'absolute',
            top: -7,
            left: 10,
            px: 1,
            bgcolor: 'background.paper',
            fontSize: 12,
            color: 'text.secondary',
            zIndex: 1,
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        onClick={onClick}
        sx={{
          height,
          border: '1px solid',
          borderColor,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pl: 4.5,
          pr: 3.5,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
