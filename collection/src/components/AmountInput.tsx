import { useEffect } from 'react';
import {
  Alert,
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { findChain, findToken, isConvertible } from '@/data/tokens';
import type { AmountSpec } from '@/data/types';
import { TOKEN_AMOUNT_STEP, fmtTokenAmount } from '@/utils/format';
import CryptoBadge from './CryptoBadge';

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

// =============================================================================
// AmountInput — three-state input keyed off `targets`:
//   - all convertible      → single USD input
//   - all non-convertible  → per-token table
//   - mixed                → BOTH a USD input (convertibles) AND a per-token
//                            table for the non-convertible group
// =============================================================================

export type AmountInputProps = {
  value: AmountSpec;
  onChange: (next: AmountSpec) => void;
  targets: string[];
  label?: string;
  helperText?: string;
};

export function AmountInput({
  value,
  onChange,
  targets,
  label = '最小归集金额',
  helperText,
}: AmountInputProps) {
  const convertibles = targets.filter((id) => isConvertible(id));
  const nonConvertibles = targets.filter((id) => !isConvertible(id));
  const hasConv = convertibles.length > 0;
  const hasNonConv = nonConvertibles.length > 0;

  // Sync `amounts` against the current non-convertible targets:
  //   - drop entries no longer in targets
  //   - add zero entries for newly-added non-convertible targets
  useEffect(() => {
    const next: Record<string, number> = {};
    let changed = false;
    for (const id of nonConvertibles) {
      if (id in value.amounts) next[id] = value.amounts[id];
      else {
        next[id] = 0;
        changed = true;
      }
    }
    if (Object.keys(value.amounts).length !== nonConvertibles.length) changed = true;
    if (changed) onChange({ ...value, amounts: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonConvertibles.join(',')]);

  // Per AC-001-1: when targets is empty AmountInput still renders the
  // single-USD input as a placeholder (so users can pre-fill before picking
  // tokens). Helper text explains the absent target.
  if (targets.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Box>
          <TextField
            type="number"
            value={value.usd}
            onChange={(e) => onChange({ ...value, usd: round2(Number(e.target.value)) })}
            inputProps={{ min: 0.01, step: 0.01 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
            sx={{ maxWidth: 280, width: '100%' }}
            placeholder="未选择目标 token"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            {helperText ?? '请先在上方选择目标 chain · token；阈值会按选中 token 是否可折算 USD 自动切换形态'}
          </Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>

      {hasConv && (
        <Box>
          <TextField
            type="number"
            value={value.usd}
            onChange={(e) => onChange({ ...value, usd: round2(Number(e.target.value)) })}
            inputProps={{ min: 0.01, step: 0.01 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
            sx={{ maxWidth: 280, width: '100%' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            {hasNonConv
              ? `应用于可折算 USD 的 ${convertibles.length} 个 token；最多支持 2 位小数`
              : '所有目标 token 均可折算为 USD，统一以 USD 进行设置；最多支持 2 位小数'}
          </Typography>
        </Box>
      )}

      {hasNonConv && (
        <>
          <Alert severity="warning" sx={{ fontSize: 13 }}>
            已选目标中存在无法折算为 USD 的 token，需要按 token 单独填写最小归集数量（amount）。
          </Alert>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 220px',
                px: 2,
                py: 1.25,
                backgroundColor: 'grey.100',
                fontSize: 12,
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              <span>Token（无 USD 折算）</span>
              <span style={{ textAlign: 'right' }}>最小归集数量</span>
            </Box>
            {nonConvertibles.map((id) => {
              const t = findToken(id);
              const c = t ? findChain(t.chainId) : null;
              if (!t || !c) return null;
              return (
                <Box
                  key={id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 220px',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <CryptoBadge symbol={t.symbol} color={t.color} size={22} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.name} · {t.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        无 USD 折算
                      </Typography>
                    </Box>
                  </Stack>
                  <TextField
                    type="number"
                    size="small"
                    value={value.amounts[id] ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      onChange({
                        ...value,
                        amounts: { ...value.amounts, [id]: Number.isFinite(v) ? v : 0 },
                      });
                    }}
                    inputProps={{ min: 0, step: TOKEN_AMOUNT_STEP }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{t.symbol}</InputAdornment>,
                    }}
                    sx={{ justifySelf: 'end', width: 200 }}
                  />
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Stack>
  );
}

// =============================================================================
// Helpers consumed by other parts of the app
// =============================================================================

export function formatAmountSpec(spec: AmountSpec, targets: string[]): string {
  const parts: string[] = [];
  const hasConv = targets.some(isConvertible);
  if (hasConv) {
    parts.push(
      '$' +
        spec.usd.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    );
  }
  targets
    .filter((id) => !isConvertible(id))
    .forEach((id) => {
      const t = findToken(id);
      if (!t) return;
      parts.push(`${fmtTokenAmount(spec.amounts[id] ?? 0)} ${t.symbol}`);
    });
  return `≥ ${parts.join(' · ')}`;
}

export function isAmountSpecValid(spec: AmountSpec, targets: string[]): boolean {
  if (targets.length === 0) return false;
  const hasConv = targets.some(isConvertible);
  if (hasConv && !(spec.usd > 0)) return false;
  return targets.every((id) => isConvertible(id) || (spec.amounts[id] ?? 0) > 0);
}

export const defaultAmountSpec = (initialUsd = 0): AmountSpec => ({
  usd: initialUsd,
  amounts: {},
});

export default AmountInput;
