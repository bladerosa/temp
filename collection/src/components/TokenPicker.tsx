import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Check,
  X,
  Search,
} from 'lucide-react';
import { CHAINS, TOKENS, findChain, findToken, tokensByChain } from '@/data/tokens';
import CryptoBadge from './CryptoBadge';

const fuzzy = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.trim().toLowerCase());

// =============================================================================
// MultiTokenPicker — used by auto-task creation. Two-pane chain → token grid
// with per-chain "select all", a global "select all", and a chip bar showing
// the current selection. Chip-x removes from selection.
// =============================================================================

export type MultiTokenPickerProps = {
  selected: string[];
  onChange: (ids: string[]) => void;
};

export function MultiTokenPicker({ selected, onChange }: MultiTokenPickerProps) {
  const [activeChain, setActiveChain] = useState<string>(CHAINS[0].id);
  const [chainQuery, setChainQuery] = useState('');
  const [tokenQuery, setTokenQuery] = useState('');

  const filteredChains = useMemo(
    () =>
      chainQuery.trim()
        ? CHAINS.filter((c) => fuzzy(c.name, chainQuery) || fuzzy(c.id, chainQuery))
        : CHAINS,
    [chainQuery],
  );

  const visibleTokens = useMemo(() => {
    const q = tokenQuery.trim();
    if (q) {
      return TOKENS.filter(
        (t) =>
          fuzzy(t.symbol, q) ||
          fuzzy(t.chainId, q) ||
          fuzzy(findChain(t.chainId)?.name ?? '', q),
      );
    }
    return tokensByChain(activeChain);
  }, [activeChain, tokenQuery]);

  const toggle = (tokenId: string) => {
    onChange(
      selected.includes(tokenId)
        ? selected.filter((v) => v !== tokenId)
        : [...selected, tokenId],
    );
  };

  const chainSelectedCount = (chainId: string) =>
    tokensByChain(chainId).filter((t) => selected.includes(t.id)).length;

  const selectAllEverywhere = () => onChange(TOKENS.map((t) => t.id));
  const clearAll = () => onChange([]);
  const allTokensSelected = selected.length === TOKENS.length;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'grey.100',
        p: 3,
      }}
    >
      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            size="small"
            variant={allTokensSelected ? 'contained' : 'outlined'}
            color={allTokensSelected ? 'inherit' : 'primary'}
            onClick={allTokensSelected ? clearAll : selectAllEverywhere}
            startIcon={
              allTokensSelected ? <X size={14} /> : <Check size={14} />
            }
          >
            {allTokensSelected ? '取消全选' : '全选所有 chain · token'}
          </Button>
          <Typography variant="caption" color="text.secondary">
            已选 <Box component="b" sx={{ color: 'primary.main' }}>{selected.length}</Box> / {TOKENS.length}
          </Typography>
        </Stack>
        {selected.length > 0 && (
          <Button size="small" variant="text" onClick={clearAll}>
            清空已选
          </Button>
        )}
      </Stack>

      {/* Two panes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' },
          gap: 3,
        }}
      >
        {/* Left: chains */}
        <Box sx={{ borderRight: { sm: 1 }, borderColor: { sm: 'divider' }, pr: { sm: 3 } }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Chain
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="搜索 chain"
            value={chainQuery}
            onChange={(e) => setChainQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
              endAdornment: chainQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setChainQuery('')}>
                    <X size={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ mb: 2 }}
          />
          <Stack spacing={0.5} sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {filteredChains.map((c) => {
              const sel = chainSelectedCount(c.id);
              const total = tokensByChain(c.id).length;
              const allSel = sel > 0 && sel === total;
              return (
                <Box
                  key={c.id}
                  onClick={() => {
                    setActiveChain(c.id);
                    setTokenQuery('');
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    backgroundColor: activeChain === c.id ? 'rgba(60,111,245,0.08)' : 'transparent',
                    color: activeChain === c.id ? 'primary.main' : 'text.primary',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <CryptoBadge symbol={c.id} color={c.color} size={20} />
                  <Box sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.name}</Box>
                  {sel > 0 && !allSel && (
                    <Chip size="small" label={sel} color="primary" sx={{ height: 18, fontSize: 10 }} />
                  )}
                  <Box
                    component="button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const ids = tokensByChain(c.id).map((t) => t.id);
                      const idSet = new Set(ids);
                      if (allSel) {
                        onChange(selected.filter((v) => !idSet.has(v)));
                      } else {
                        onChange(Array.from(new Set([...selected, ...ids])));
                      }
                    }}
                    sx={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: allSel ? 'error.main' : 'primary.main',
                      fontWeight: 600,
                      px: 0.5,
                    }}
                  >
                    {allSel ? '取消全选' : '全选'}
                  </Box>
                </Box>
              );
            })}
            {filteredChains.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
                未匹配到 chain
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Right: tokens */}
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Token
            {tokenQuery.trim() && (
              <Box component="span" sx={{ ml: 1, fontSize: 11, fontWeight: 400, color: 'text.secondary' }}>
                · 全 chain 搜索
              </Box>
            )}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="搜索 token（输入后跨 chain 匹配）"
            value={tokenQuery}
            onChange={(e) => setTokenQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
              endAdornment: tokenQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setTokenQuery('')}>
                    <X size={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1,
              maxHeight: 360,
              overflowY: 'auto',
            }}
          >
            {visibleTokens.map((t) => {
              const isSel = selected.includes(t.id);
              return (
                <Box
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: 1,
                    borderColor: isSel ? 'primary.main' : 'divider',
                    backgroundColor: isSel ? 'rgba(60,111,245,0.08)' : 'background.paper',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      border: 2,
                      borderColor: isSel ? 'primary.main' : 'grey.300',
                      backgroundColor: isSel ? 'primary.main' : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {isSel && <Check size={12} />}
                  </Box>
                  <CryptoBadge symbol={t.symbol} color={t.color} size={20} />
                  <Box sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.symbol}</Box>
                  <Typography variant="caption" color="text.secondary">
                    {findChain(t.chainId)?.name}
                  </Typography>
                </Box>
              );
            })}
            {visibleTokens.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ p: 2, gridColumn: '1 / -1' }}>
                未匹配到 token
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Chip bar at the bottom */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        {selected.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            未选择目标 token
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {selected.map((id) => {
              const t = findToken(id);
              const c = t ? findChain(t.chainId) : null;
              if (!t || !c) return null;
              return (
                <Chip
                  key={id}
                  size="small"
                  icon={<CryptoBadge symbol={t.symbol} color={t.color} size={16} />}
                  label={`${c.name} · ${t.symbol}`}
                  onDelete={() => toggle(id)}
                  deleteIcon={<X size={14} />}
                  sx={{ height: 26 }}
                />
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// =============================================================================
// SingleTokenPicker — used by manual collection. Two-pane chain list +
// token list with single selection. Chain change resets the active token to
// the first token on the new chain (caller wires this via onChange).
// =============================================================================

export type SingleTokenPickerProps = {
  chainId: string;
  tokenId: string;
  onChange: (chainId: string, tokenId: string) => void;
};

export function SingleTokenPicker({ chainId, tokenId, onChange }: SingleTokenPickerProps) {
  const [chainQuery, setChainQuery] = useState('');
  const [tokenQuery, setTokenQuery] = useState('');

  const filteredChains = useMemo(
    () =>
      chainQuery.trim()
        ? CHAINS.filter((c) => fuzzy(c.name, chainQuery) || fuzzy(c.id, chainQuery))
        : CHAINS,
    [chainQuery],
  );

  const filteredTokens = useMemo(() => {
    const list = tokensByChain(chainId);
    return tokenQuery.trim() ? list.filter((t) => fuzzy(t.symbol, tokenQuery)) : list;
  }, [chainId, tokenQuery]);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'grey.100',
        p: 3,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' },
        gap: 3,
      }}
    >
      <Box sx={{ borderRight: { sm: 1 }, borderColor: { sm: 'divider' }, pr: { sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          选择 Chain
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="搜索 chain"
          value={chainQuery}
          onChange={(e) => setChainQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
            endAdornment: chainQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setChainQuery('')}>
                  <X size={14} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 2 }}
        />
        <Stack spacing={0.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {filteredChains.map((c) => (
            <Box
              key={c.id}
              onClick={() => {
                const first = tokensByChain(c.id)[0];
                onChange(c.id, first?.id ?? '');
                setTokenQuery('');
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: 1.5,
                cursor: 'pointer',
                backgroundColor: chainId === c.id ? 'rgba(60,111,245,0.08)' : 'transparent',
                color: chainId === c.id ? 'primary.main' : 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <CryptoBadge symbol={c.id} color={c.color} size={20} />
              <Box sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.name}</Box>
            </Box>
          ))}
          {filteredChains.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
              未匹配到 chain
            </Typography>
          )}
        </Stack>
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          选择 Token
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="搜索 token"
          value={tokenQuery}
          onChange={(e) => setTokenQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
            endAdornment: tokenQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setTokenQuery('')}>
                  <X size={14} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 2 }}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {filteredTokens.map((t) => {
            const isSel = tokenId === t.id;
            return (
              <Box
                key={t.id}
                onClick={() => onChange(chainId, t.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: 1,
                  borderColor: isSel ? 'primary.main' : 'divider',
                  backgroundColor: isSel ? 'rgba(60,111,245,0.08)' : 'background.paper',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <CryptoBadge symbol={t.symbol} color={t.color} size={20} />
                <Box sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.symbol}</Box>
              </Box>
            );
          })}
          {filteredTokens.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ p: 2, gridColumn: '1 / -1' }}>
              未匹配到 token
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
