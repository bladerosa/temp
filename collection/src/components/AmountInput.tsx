import { useEffect } from 'react';
import { findChain, findToken, isConvertible } from '../data/tokens';
import type { AmountSpec } from '../data/types';
import { CoinBadge, TOKEN_AMOUNT_STEP, fmtTokenAmount } from './Primitives';
import { IconAlert } from './Icon';

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

/**
 * Adaptive amount input.
 *
 * Behavior depends on the convertibility of the selected targets:
 *   - all convertible → single USD input
 *   - all non-convertible → per-token amount table (every target listed)
 *   - mixed → BOTH a single USD input (for the convertible group) AND a per-token
 *     table for the non-convertible group (only non-convertible tokens listed)
 */
export function AmountInput({
  targets,
  value,
  onChange,
  label = '最小归集金额',
  hint,
}: {
  targets: string[];
  value: AmountSpec;
  onChange: (next: AmountSpec) => void;
  label?: string;
  hint?: string;
}) {
  const convertibles    = targets.filter((id) => isConvertible(id));
  const nonConvertibles = targets.filter((id) => !isConvertible(id));
  const hasConv    = convertibles.length > 0;
  const hasNonConv = nonConvertibles.length > 0;

  // Keep `amounts` in sync with the current non-convertible targets:
  //   - drop entries no longer in targets
  //   - add zero entries for newly-added non-convertible targets
  useEffect(() => {
    const next: Record<string, number> = {};
    let changed = false;
    for (const id of nonConvertibles) {
      if (id in value.amounts) next[id] = value.amounts[id];
      else { next[id] = 0; changed = true; }
    }
    if (Object.keys(value.amounts).length !== nonConvertibles.length) changed = true;
    if (changed) onChange({ ...value, amounts: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonConvertibles.join(',')]);

  if (targets.length === 0) {
    return (
      <div className="field">
        <label>{label}</label>
        <div className="picker-block dim" style={{ padding: 14, fontSize: 13 }}>
          请先在上方选择目标 chain · token
        </div>
      </div>
    );
  }

  return (
    <div className="field" style={{ gap: 12 }}>
      <label>{label}</label>

      {/* USD input for convertible-token group */}
      {hasConv && (
        <div className="amount-usd-block">
          <div className="input-wrap" style={{ maxWidth: 280 }}>
            <input
              className="input with-suffix" type="number" min={0.01} step={0.01}
              value={value.usd}
              onChange={(e) => onChange({ ...value, usd: round2(Number(e.target.value)) })}
            />
            <span className="suffix">USD</span>
          </div>
          <span className="hint">
            {hasNonConv
              ? `应用于可折算 USD 的 ${convertibles.length} 个 token；最多支持 2 位小数`
              : '所有目标 token 均可折算为 USD，统一以 USD 进行设置；最多支持 2 位小数'}
          </span>
        </div>
      )}

      {/* Per-token amount table for non-convertible group */}
      {hasNonConv && (
        <>
          <div className="warn-tip">
            <IconAlert size={16} className="ico"/>
            <div>已选目标中存在无法折算为 USD 的 token，需要按 token 单独填写最小归集数量（amount）。</div>
          </div>
          <div className="amount-table">
            <div className="amount-table-head">
              <span>Token（无 USD 折算）</span>
              <span style={{ textAlign: 'right' }}>最小归集数量</span>
            </div>
            {nonConvertibles.map((id) => {
              const t = findToken(id);
              const c = t ? findChain(t.chainId) : null;
              if (!t || !c) return null;
              return (
                <div key={id} className="amount-table-row">
                  <span className="coin-cell">
                    <CoinBadge symbol={t.symbol} color={t.color} size={22}/>
                    <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name} · {t.symbol}</span>
                      <span style={{ fontSize: 11 }} className="muted">无 USD 折算</span>
                    </span>
                  </span>
                  <div className="input-wrap" style={{ width: 200, justifySelf: 'end' }}>
                    <input
                      className="input with-suffix" type="number" min={0} step={TOKEN_AMOUNT_STEP}
                      value={value.amounts[id] ?? 0}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        onChange({
                          ...value,
                          amounts: { ...value.amounts, [id]: Number.isFinite(v) ? v : 0 },
                        });
                      }}
                    />
                    <span className="suffix">{t.symbol}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

// Quick read helpers used by other pages.
export function formatAmountSpec(spec: AmountSpec, targets: string[]): string {
  const parts: string[] = [];
  const hasConv    = targets.some(isConvertible);
  if (hasConv) {
    parts.push('$' + spec.usd.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }));
  }
  targets.filter((id) => !isConvertible(id)).forEach((id) => {
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
  // every non-convertible target must have a positive amount
  return targets.every((id) => isConvertible(id) || (spec.amounts[id] ?? 0) > 0);
}

export const defaultAmountSpec = (initialUsd: number = 0): AmountSpec => ({
  usd: initialUsd,
  amounts: {},
});
