import { useMemo, useRef, useState } from 'react';
import { findChain, findToken, isConvertible } from '../data/tokens';
import { queryUncollected } from '../data/mockData';
import type { UncollectedAddress, UncollectedQueryResult } from '../data/mockData';
import { SingleTokenPicker } from '../components/TokenPicker';
import {
  Checkbox, CoinBadge, Modal, Stat, fmtDateTime, fmtTokenAmount,
  TOKEN_AMOUNT_STEP, usd,
} from '../components/Primitives';
import {
  IconPlay, IconInfo, IconAlert, IconLayers, IconSearch,
  IconScale, IconShield,
} from '../components/Icon';
import { useToast } from '../components/Toast';

type Phase = 'idle' | 'queried' | 'submitting';

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

// Threshold predicate — convertible tokens use USD, non-convertible use token amount.
const meets = (a: UncollectedAddress, conv: boolean, minUsd: number, minAmount: number) =>
  conv ? (a.amountUsd ?? 0) >= minUsd : Number(a.amount) >= minAmount;

export default function ManualCollection() {
  const [chainId, setChainId] = useState('TRX');
  const [tokenId, setTokenId] = useState('TRX:USDT');

  // Two parallel min-threshold values so switching chain/token doesn't mix units.
  const [minUsd, setMinUsd] = useState<number>(50);
  const [minAmount, setMinAmount] = useState<number>(50);

  const [phase, setPhase] = useState<Phase>('idle');
  const [query, setQuery] = useState<UncollectedQueryResult | null>(null);
  const [querying, setQuerying] = useState(false);

  const [pickedAbnormal, setPickedAbnormal] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const step2Ref = useRef<HTMLDivElement | null>(null);

  const chain = findChain(chainId);
  const token = findToken(tokenId);
  const conv = isConvertible(tokenId);

  // ---- chain/token change resets the lower workflow ----
  const updateChainToken = (c: string, t: string) => {
    setChainId(c); setTokenId(t);
    setQuery(null); setPhase('idle'); setPickedAbnormal(new Set());
  };

  // ---- run query ----
  const runQuery = () => {
    if (!token) return;
    setQuerying(true);
    setQuery(null);
    setPickedAbnormal(new Set());
    setTimeout(() => {
      setQuery(queryUncollected(chainId, tokenId));
      setPhase('queried');
      setQuerying(false);
      // Bring Step 2 into view so the result isn't missed below the fold.
      requestAnimationFrame(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, 600);
  };

  // ---- reactive aggregates filtered by current min threshold ----
  const filtered = useMemo(() => {
    if (!query) return null;
    const passing  = query.addresses.filter((a) => meets(a, conv, minUsd, minAmount));
    const normal   = passing.filter((a) => !a.isAbnormal);
    const abnormal = passing.filter((a) => a.isAbnormal);

    const sumAmt = (xs: UncollectedAddress[]) => xs.reduce((s, x) => s + Number(x.amount || 0), 0);
    const sumUsd = (xs: UncollectedAddress[]) => xs.reduce((s, x) => s + (x.amountUsd ?? 0), 0);
    const total = passing.length;

    return {
      total, normal, abnormal,
      totalAmount:    sumAmt(passing),
      totalUsd:       conv ? sumUsd(passing) : undefined,
      normalAmount:   sumAmt(normal),
      normalUsd:      conv ? sumUsd(normal) : undefined,
      normalRatio:    total > 0 ? normal.length / total : 0,
      abnormalAmount: sumAmt(abnormal),
      abnormalUsd:    conv ? sumUsd(abnormal) : undefined,
      abnormalRatio:  total > 0 ? abnormal.length / total : 0,
      hiddenAbnormalCount: query.addresses.filter((a) => a.isAbnormal && !meets(a, conv, minUsd, minAmount)).length,
    };
  }, [query, conv, minUsd, minAmount]);

  // ---- abnormal picking ----
  const toggleOne = (addr: string) => {
    setPickedAbnormal((prev) => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr); else next.add(addr);
      return next;
    });
  };
  const allVisibleSelected = (filtered?.abnormal.length ?? 0) > 0
    && filtered!.abnormal.every((a) => pickedAbnormal.has(a.address));
  const toggleAllVisible = () => {
    if (!filtered) return;
    const next = new Set(pickedAbnormal);
    if (allVisibleSelected) filtered.abnormal.forEach((a) => next.delete(a.address));
    else filtered.abnormal.forEach((a) => next.add(a.address));
    setPickedAbnormal(next);
  };
  const selectedAbnormalEffective = useMemo(() => {
    if (!filtered) return [] as UncollectedAddress[];
    return filtered.abnormal.filter((a) => pickedAbnormal.has(a.address));
  }, [filtered, pickedAbnormal]);

  // ---- partial reset (used after submit ack)
  // Preserves the user's chain/token + min threshold so they can immediately
  // re-query or run another collection on the same target. Only the query
  // result, abnormal-address picks, and phase are cleared.
  const resetAfterSubmit = () => {
    setQuery(null);
    setPhase('idle');
    setPickedAbnormal(new Set());
  };

  // ---- submit ----
  const start = () => {
    if (!filtered) return;
    setConfirm(false);
    setPhase('submitting');
    setTimeout(() => {
      toast.show({
        title: '该次手动归集任务已提交',
        desc: <>请在「<b>归集任务</b>」模块跟踪查询执行结果。</>,
        tone: 'success',
      });
      resetAfterSubmit();
    }, 1400);
  };


  const minInputValid = conv ? minUsd > 0 : minAmount > 0;
  const canSubmit = phase === 'queried' && minInputValid
    && !!filtered && (filtered.normal.length + selectedAbnormalEffective.length) > 0;

  const tokenSymbol = token?.symbol ?? '';

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">手动归集</h2>
          <div className="page-sub">设置最小归集{conv ? '金额' : '数量'}并查询，查看正常 / 异常资产分布，确认后提交归集。</div>
        </div>
      </div>

      {/* ===== Step 1 ===== */}
      <div className="card" style={{ maxWidth: 1080 }}>
        <div className="row gap-8 mb-12">
          <span className="chip primary"><span className="dot"/>Step 1</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>选择 chain · token、设置最小归集{conv ? '金额' : '数量'}并查询</span>
        </div>

        <SingleTokenPicker chainId={chainId} tokenId={tokenId} onChange={updateChainToken}/>

        <div className="field-grid mt-16">
          <div className="field">
            <label>最小归集{conv ? '金额（USD）' : `数量（${tokenSymbol}）`}</label>
            <div className="input-wrap" style={{ maxWidth: 280 }}>
              <input
                className="input with-suffix" type="number"
                min={0} step={conv ? 0.01 : TOKEN_AMOUNT_STEP}
                value={conv ? minUsd : minAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (conv) setMinUsd(round2(v));
                  else setMinAmount(Number.isFinite(v) ? v : 0);
                }}
              />
              <span className="suffix">{conv ? 'USD' : tokenSymbol}</span>
            </div>
            <span className="hint">
              {conv
                ? '查询结果将仅统计余额 ≥ 此金额的地址；异常地址表也会同步过滤；最多支持 2 位小数'
                : `该 token 无 USD 折算，按 token 数量设置；最多支持 8 位小数`}
            </span>
          </div>

          <div className="field">
            <label>预览</label>
            <div className="picker-block" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
              {token && chain ? (
                <>
                  <CoinBadge symbol={token.symbol} color={token.color} size={32}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{chain.name} · {token.symbol}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      最小归集 ≥ {conv ? usd(minUsd) : `${fmtTokenAmount(minAmount)} ${token.symbol}`}
                    </div>
                  </div>
                  {!conv && <span className="chip warning"><span className="dot"/>无 USD 折算</span>}
                </>
              ) : <span className="dim">未选择</span>}
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn primary lg" onClick={runQuery} disabled={querying || !token || !minInputValid}>
            {querying ? <><span className="spinner"/> 查询中…</> : <><IconSearch size={14}/> 查询未归集情况</>}
          </button>
        </div>
      </div>

      {/* ===== Step 2 ===== */}
      {query && filtered && (
        <div ref={step2Ref} className="card mt-16" style={{ maxWidth: 1080, scrollMarginTop: 16 }}>
          <div className="row gap-8 mb-12">
            <span className="chip primary"><span className="dot"/>Step 2</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>未归集情况 — 阈值 ≥ {conv ? usd(minUsd) : `${fmtTokenAmount(minAmount)} ${tokenSymbol}`}</span>
            <span style={{ flex: 1 }}/>
            <span className="muted" style={{ fontSize: 12 }}>查询时间 {fmtDateTime(new Date().toISOString())}</span>
          </div>

          <div className="stat-strip">
            <Stat
              label="总未归集"
              value={`${fmtTokenAmount(filtered.totalAmount)} ${tokenSymbol}`}
              hint={
                (filtered.totalUsd != null ? `${usd(filtered.totalUsd)} · ` : '') +
                `${filtered.total} 个地址`
              }
              tone="primary" icon={<IconLayers size={18}/>}
            />
            <Stat
              label="正常数量"
              value={`${fmtTokenAmount(filtered.normalAmount)} ${tokenSymbol}`}
              hint={
                (filtered.normalUsd != null ? `${usd(filtered.normalUsd)} · ` : '') +
                `${filtered.normal.length} 个 · 占比 ${(filtered.normalRatio * 100).toFixed(1)}%`
              }
              tone="success" icon={<IconScale size={18}/>}
            />
            <Stat
              label="异常数量"
              value={`${fmtTokenAmount(filtered.abnormalAmount)} ${tokenSymbol}`}
              hint={
                (filtered.abnormalUsd != null ? `${usd(filtered.abnormalUsd)} · ` : '') +
                `${filtered.abnormal.length} 个 · 占比 ${(filtered.abnormalRatio * 100).toFixed(1)}%`
              }
              tone="warning" icon={<IconShield size={18}/>}
            />
          </div>

          <div className="row gap-8 mb-12">
            <span style={{ fontWeight: 600, fontSize: 13 }}>异常金额地址表</span>
            <span className="muted" style={{ fontSize: 12 }}>· 默认不归集；勾选后才会一并发起归集</span>
          </div>

          <div className="table-wrap" style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <Checkbox checked={allVisibleSelected} onChange={toggleAllVisible}/>
                  </th>
                  <th>chain</th>
                  <th>token</th>
                  <th>地址</th>
                  <th style={{ textAlign: 'right' }}>金额（USD）</th>
                  <th style={{ textAlign: 'right' }}>数量</th>
                </tr>
              </thead>
              <tbody>
                {filtered.abnormal.map((a) => (
                  <tr key={a.address}>
                    <td><Checkbox checked={pickedAbnormal.has(a.address)} onChange={() => toggleOne(a.address)}/></td>
                    <td>
                      {chain && (
                        <span className="coin-cell">
                          <CoinBadge symbol={chain.id} color={chain.color} size={20}/>
                          <span style={{ fontWeight: 600, fontSize: 12.5 }}>{chain.name}</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {token && (
                        <span className="coin-cell">
                          <CoinBadge symbol={token.symbol} color={token.color} size={20}/>
                          <span style={{ fontWeight: 600, fontSize: 12.5 }}>{token.symbol}</span>
                        </span>
                      )}
                    </td>
                    <td className="mono" style={{ fontSize: 11.5, wordBreak: 'break-all', maxWidth: 320 }}>{a.address}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {a.amountUsd != null ? usd(a.amountUsd) : <span className="dim">-</span>}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtTokenAmount(a.amount)}</td>
                  </tr>
                ))}
                {filtered.abnormal.length === 0 && (
                  <tr><td colSpan={6}>
                    <div className="empty">
                      <div className="empty-art"><IconShield size={28}/></div>
                      <div className="title">无符合条件的异常地址</div>
                      <div className="desc">
                        {filtered.hiddenAbnormalCount > 0
                          ? `已根据当前最小归集阈值过滤掉 ${filtered.hiddenAbnormalCount} 条不达标记录`
                          : '当前 chain · token 没有异常金额地址'}
                      </div>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.hiddenAbnormalCount > 0 && filtered.abnormal.length > 0 && (
            <div className="muted mt-8" style={{ fontSize: 12 }}>
              已根据当前最小归集阈值过滤掉 {filtered.hiddenAbnormalCount} 条不达标的异常地址。
            </div>
          )}

          {/* ===== Submit area ===== */}
          <div className="divider"/>

          {filtered.normal.length + selectedAbnormalEffective.length === 0 ? (
            <div className="warn-tip">
              <IconAlert size={16} className="ico"/>
              <div>
                当前阈值下没有可归集的地址。请<b>调低最小归集{conv ? '金额' : '数量'}</b>，或在上方异常地址表中勾选要包含的地址。
              </div>
            </div>
          ) : (
            <div className="tip">
              <IconInfo size={16} className="ico"/>
              <div>
                提交后将归集 <b>该 chain · token</b> 中：
                <br/>· 余额 ≥ 阈值的 <b>{filtered.normal.length} 个正常地址</b>（自动）
                <br/>· 你在上方表格中勾选的 <b>{selectedAbnormalEffective.length} 个异常地址</b>
                {pickedAbnormal.size !== selectedAbnormalEffective.length && (
                  <span className="muted">（其中 {pickedAbnormal.size - selectedAbnormalEffective.length} 个因不满足最小归集阈值已自动忽略）</span>
                )}
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <button
              className="btn primary lg"
              disabled={!canSubmit}
              onClick={() => setConfirm(true)}
            >
              {phase === 'submitting'
                ? <><span className="spinner"/> 正在提交…</>
                : <><IconPlay size={16}/> 开始归集</>}
            </button>
          </div>
        </div>
      )}

      {/* ===== Confirm submit ===== */}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认开始归集"
        footer={
          <>
            <div style={{ flex: 1 }}/>
            <button className="btn ghost" onClick={() => setConfirm(false)}>取消</button>
            <button className="btn primary" onClick={start}><IconPlay size={14}/> 开始归集</button>
          </>
        }
      >
        <div className="warn-tip">
          <IconAlert size={16} className="ico"/>
          <div>
            将立即对 <b>{chain?.name}</b> 上的 <b>{tokenSymbol}</b> 发起归集：
            <br/>· 余额 ≥ <b>{conv ? usd(minUsd) : `${fmtTokenAmount(minAmount)} ${tokenSymbol}`}</b> 的 <b>{filtered?.normal.length ?? 0}</b> 个正常地址
            <br/>· 你勾选的 <b>{selectedAbnormalEffective.length}</b> 个异常地址
          </div>
        </div>
        <div className="mt-12 muted" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
          · 此操作不可中途撤销，请确认配置无误。<br/>
          · 提交后任务执行进度可在「归集任务」模块跟踪查询。
        </div>
      </Modal>

      <style>{`
        .spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: spin 700ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
