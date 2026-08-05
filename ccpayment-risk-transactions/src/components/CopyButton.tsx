import { Box, Tooltip } from '@mui/material';
import { Copy } from 'lucide-react';
import { useStores } from '@/stores';
import { copyText } from '@/utils/format';

export interface CopyButtonProps {
  value: string;
  size?: number;
  label?: string;
}

/** 表格 / 详情里跟在地址、ID 后面的复制图标。 */
export function CopyButton({ value, size = 17, label = '複製' }: CopyButtonProps) {
  const { toast } = useStores();

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyText(value);
    toast.show(
      ok
        ? { title: '已複製', desc: value, tone: 'success', duration: 2000 }
        : { title: '複製失敗', desc: '瀏覽器拒絕了剪貼簿存取', tone: 'error' }
    );
  };

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        onClick={onCopy}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          flex: `0 0 ${size}px`,
          color: 'text.secondary',
          cursor: 'pointer',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <Copy size={size} strokeWidth={1.6} />
      </Box>
    </Tooltip>
  );
}
