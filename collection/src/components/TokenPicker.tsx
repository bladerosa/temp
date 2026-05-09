import { useState, useMemo } from 'react';
import { CHAINS, TOKENS, tokensByChain, findChain } from '../data/tokens';
import { CoinBadge, Checkbox } from './Primitives';
import { IconSearch, IconCheck, IconClose } from './Icon';

const fuzzy = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.trim().toLowerCase());

// ============================================================
// Multi-select chain → token picker (auto-task creation)
// ============================================================
export function MultiTokenPicker({
  value, onChange,
}: { value: string[]; onChange: (next: string[]) => void }) {
  const [activeChain, setActiveChain] = useState<string>(CHAINS[0].id);
  const [chainQuery, setChainQuery] = useState('');
  const [tokenQuery, setTokenQuery] = useState('');

  const filteredChains = useMemo(
    () => (chainQuery.trim()
      ? CHAINS.filter((c) => fuzzy(c.name, chainQuery) || fuzzy(c.id, chainQuery))
      : CHAINS),
    [chainQuery],
  );

  // Tokens visible in the right pane: filtered by tokenQuery,
  // and (when query is empty) scoped to the active chain.
  const visibleTokens = useMemo(() => {
    const q = tokenQuery.trim();
    if (q) {
      return TOKENS.filter((t) => fuzzy(t.symbol, q) || fuzzy(t.chainId, q) || fuzzy(findChain(t.chainId)?.name ?? '', q));
    }
    return tokensByChain(activeChain);
  }, [activeChain, tokenQuery]);

  const toggle = (tokenId: string) => {
    onChange(value.includes(tokenId) ? value.filter((v) => v !== tokenId) : [...value, tokenId]);
  };

  const chainSelectedCount = (chainId: string) =>
    tokensByChain(chainId).filter((t) => value.includes(t.id)).length;

  // ===== bulk actions =====
  const selectAllEverywhere = () => onChange(TOKENS.map((t) => t.id));
  const clearAll = () => onChange([]);

  const allTokensSelected = value.length === TOKENS.length;

  return (
    <div className="picker-block">
      <div className="picker-toolbar">
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn sm ${allTokensSelected ? 'soft' : 'outlined'}`}
            onClick={allTokensSelected ? clearAll : selectAllEverywhere}
          >
            {allTokensSelected ? <><IconClose size={12}/> 取消全选</> : <><IconCheck size={12}/> 全选所有 chain · token</>}
          </button>
          <span className="muted" style={{ fontSize: 12 }}>
            已选 <b style={{ color: 'var(--primary)' }}>{value.length}</b> / {TOKENS.length}
          </span>
        </div>
        {value.length > 0 && (
          <button type="button" className="btn ghost sm" onClick={clearAll}>清空已选</button>
        )}
      </div>

      <div className="picker-row">
        <div className="picker-col" style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 12, minWidth: 200 }}>
          <h5>Chain</h5>
          <div className="picker-search">
            <IconSearch size={12}/>
            <input
              placeholder="搜索 chain"
              value={chainQuery}
              onChange={(e) => setChainQuery(e.target.value)}
            />
            {chainQuery && (
              <span className="x" onClick={() => setChainQuery('')}><IconClose size={12}/></span>
            )}
          </div>
          <div className="picker-list">
            {filteredChains.map((c) => {
              const sel = chainSelectedCount(c.id);
              const total = tokensByChain(c.id).length;
              const allSel = sel > 0 && sel === total;
              return (
                <div
                  key={c.id}
                  className={`picker-item ${activeChain === c.id ? 'sel' : ''}`}
                  onClick={() => { setActiveChain(c.id); setTokenQuery(''); }}
                >
                  <CoinBadge symbol={c.id} color={c.color} size={20} />
                  <span style={{ flex: 1 }}>{c.name}</span>
                  {sel > 0 && !allSel && (
                    <span className="chip primary" style={{ padding: '1px 7px', fontSize: 10.5 }}>{sel}</span>
                  )}
                  <button
                    type="button"
                    className={`chain-bulk-link ${allSel ? 'danger' : ''}`}
                    title={allSel ? '取消该 chain 全选' : '全选该 chain 所有 token'}
                    onClick={(e) => {
                      e.stopPropagation();
                      const ids = tokensByChain(c.id).map((t) => t.id);
                      const idSet = new Set(ids);
                      if (allSel) {
                        onChange(value.filter((v) => !idSet.has(v)));
                      } else {
                        onChange(Array.from(new Set([...value, ...ids])));
                      }
                    }}
                  >
                    {allSel ? '取消全选' : '全选'}
                  </button>
                </div>
              );
            })}
            {filteredChains.length === 0 && (
              <div className="picker-empty">未匹配到 chain</div>
            )}
          </div>
        </div>

        <div className="picker-col" style={{ paddingLeft: 12 }}>
          <h5>
            Token
            {tokenQuery.trim() && <span className="muted" style={{ marginLeft: 6, fontSize: 11, fontWeight: 400 }}>· 全 chain 搜索</span>}
          </h5>
          <div className="picker-search">
            <IconSearch size={12}/>
            <input
              placeholder="搜索 token（输入后跨 chain 匹配）"
              value={tokenQuery}
              onChange={(e) => setTokenQuery(e.target.value)}
            />
            {tokenQuery && (
              <span className="x" onClick={() => setTokenQuery('')}><IconClose size={12}/></span>
            )}
          </div>

          <div className="picker-list">
            {visibleTokens.map((t) => (
              <div
                key={t.id}
                className={`picker-item ${value.includes(t.id) ? 'sel' : ''}`}
                onClick={() => toggle(t.id)}
              >
                <Checkbox checked={value.includes(t.id)} onChange={() => toggle(t.id)} />
                <CoinBadge symbol={t.symbol} color={t.color} size={20} />
                <span style={{ flex: 1, fontWeight: 500 }}>{t.symbol}</span>
                <span className="muted" style={{ fontSize: 11 }}>{findChain(t.chainId)?.name}</span>
              </div>
            ))}
            {visibleTokens.length === 0 && (
              <div className="picker-empty">未匹配到 token</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Single-select chain + token (manual collection page)
// ============================================================
export function SingleTokenPicker({
  chainId, tokenId, onChange,
}: {
  chainId: string;
  tokenId: string;
  onChange: (chainId: string, tokenId: string) => void;
}) {
  const [chainQuery, setChainQuery] = useState('');
  const [tokenQuery, setTokenQuery] = useState('');

  const filteredChains = useMemo(
    () => (chainQuery.trim()
      ? CHAINS.filter((c) => fuzzy(c.name, chainQuery) || fuzzy(c.id, chainQuery))
      : CHAINS),
    [chainQuery],
  );

  const filteredTokens = useMemo(() => {
    const list = tokensByChain(chainId);
    return tokenQuery.trim()
      ? list.filter((t) => fuzzy(t.symbol, tokenQuery))
      : list;
  }, [chainId, tokenQuery]);

  return (
    <div className="picker-block">
      <div className="picker-row">
        <div className="picker-col" style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 12, minWidth: 200 }}>
          <h5>选择 Chain</h5>
          <div className="picker-search">
            <IconSearch size={12}/>
            <input
              placeholder="搜索 chain"
              value={chainQuery}
              onChange={(e) => setChainQuery(e.target.value)}
            />
            {chainQuery && <span className="x" onClick={() => setChainQuery('')}><IconClose size={12}/></span>}
          </div>
          <div className="picker-list">
            {filteredChains.map((c) => (
              <div
                key={c.id}
                className={`picker-item ${chainId === c.id ? 'sel' : ''}`}
                onClick={() => {
                  const first = tokensByChain(c.id)[0];
                  onChange(c.id, first?.id ?? '');
                  setTokenQuery('');
                }}
              >
                <CoinBadge symbol={c.id} color={c.color} size={20} />
                <span style={{ flex: 1 }}>{c.name}</span>
              </div>
            ))}
            {filteredChains.length === 0 && (
              <div className="picker-empty">未匹配到 chain</div>
            )}
          </div>
        </div>
        <div className="picker-col" style={{ paddingLeft: 12 }}>
          <h5>选择 Token</h5>
          <div className="picker-search">
            <IconSearch size={12}/>
            <input
              placeholder="搜索 token"
              value={tokenQuery}
              onChange={(e) => setTokenQuery(e.target.value)}
            />
            {tokenQuery && <span className="x" onClick={() => setTokenQuery('')}><IconClose size={12}/></span>}
          </div>
          <div className="picker-list">
            {filteredTokens.map((t) => (
              <div
                key={t.id}
                className={`picker-item ${tokenId === t.id ? 'sel' : ''}`}
                onClick={() => onChange(chainId, t.id)}
              >
                <CoinBadge symbol={t.symbol} color={t.color} size={20} />
                <span style={{ flex: 1 }}>{t.symbol}</span>
              </div>
            ))}
            {filteredTokens.length === 0 && (
              <div className="picker-empty">未匹配到 token</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
