import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { INDUSTRY_META } from '@/data/industries';
import type { IndustryCode } from '@/data/types';

export interface AdvancedFilterValue {
  keyword: string;
  regions: string[];
  industries: IndustryCode[];
  amountMin: string;
  amountMax: string;
  countMin: string;
  countMax: string;
}

const REGIONS = ['SG', 'HK', 'MY', 'TH', 'PH', 'ID', 'VN', 'TW', 'KR', 'JP', 'AE', 'TR', 'BR'];

export interface AdvancedFilterDialogProps {
  open: boolean;
  value: AdvancedFilterValue;
  onApply: (v: AdvancedFilterValue) => void;
  onClose: () => void;
}

export function AdvancedFilterDialog({ open, value, onApply, onClose }: AdvancedFilterDialogProps) {
  const [f, setF] = useState<AdvancedFilterValue>(value);
  const set = <K extends keyof AdvancedFilterValue>(k: K, v: AdvancedFilterValue[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));
  const toggleRegion = (r: string) =>
    set('regions', f.regions.includes(r) ? f.regions.filter((x) => x !== r) : [...f.regions, r]);
  const toggleIndustry = (i: IndustryCode) =>
    set('industries', f.industries.includes(i) ? f.industries.filter((x) => x !== i) : [...f.industries, i]);
  const reset = () =>
    setF({
      keyword: '',
      regions: [],
      industries: [],
      amountMin: '',
      amountMax: '',
      countMin: '',
      countMax: '',
    });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 4 }}>
        <Stack>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>高级筛选</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>组合多个维度精确定位商户</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <X size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            关键字
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="商户名 / Display ID"
            value={f.keyword}
            onChange={(e) => set('keyword', e.target.value)}
          />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            地区{' '}
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              (多选)
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {REGIONS.map((r) => {
              const on = f.regions.includes(r);
              return (
                <Chip
                  key={r}
                  label={(on ? '✓ ' : '') + r}
                  color={on ? 'primary' : 'default'}
                  onClick={() => toggleRegion(r)}
                  sx={{
                    cursor: 'pointer',
                    px: 1,
                    bgcolor: on ? 'rgba(60,111,245,0.16)' : 'rgba(145,158,171,0.16)',
                    color: on ? 'primary.dark' : 'grey.800',
                  }}
                />
              );
            })}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            行业{' '}
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              (多选)
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {INDUSTRY_META.map((ind) => {
              const on = f.industries.includes(ind.code);
              return (
                <Chip
                  key={ind.code}
                  label={(on ? '✓ ' : '') + ind.label}
                  color={on ? 'primary' : 'default'}
                  onClick={() => toggleIndustry(ind.code)}
                  sx={{
                    cursor: 'pointer',
                    px: 1,
                    bgcolor: on ? 'rgba(60,111,245,0.16)' : 'rgba(145,158,171,0.16)',
                    color: on ? 'primary.dark' : 'grey.800',
                  }}
                />
              );
            })}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            充值金额 (USDT)
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="最小"
              value={f.amountMin}
              onChange={(e) => set('amountMin', e.target.value)}
              sx={{ flex: 1 }}
            />
            <Box sx={{ color: 'text.disabled' }}>—</Box>
            <TextField
              size="small"
              placeholder="最大"
              value={f.amountMax}
              onChange={(e) => set('amountMax', e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            交易笔数
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="最小"
              value={f.countMin}
              onChange={(e) => set('countMin', e.target.value)}
              sx={{ flex: 1 }}
            />
            <Box sx={{ color: 'text.disabled' }}>—</Box>
            <TextField
              size="small"
              placeholder="最大"
              value={f.countMax}
              onChange={(e) => set('countMax', e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 4, justifyContent: 'space-between' }}>
        <Typography
          onClick={reset}
          sx={{ color: 'primary.main', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          重置全部
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose}>取消</Button>
          <Button variant="contained" onClick={() => onApply(f)}>
            应用筛选
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
