import { useEffect, useRef, type ReactNode } from 'react';
import { findChain, findToken } from '../data/tokens';
import { IconClose } from './Icon';

// ============ Crypto badge ============
//
// Implementation matches the bundled `ui_kits/ccpayment` `.crypto-badge`:
// 32×32 (default) circle, brand color fill, white extrabold symbol, inset
// gloss. The README's bg-subtle placeholder is reserved for tokens that have
// no brand color metadata at all — those fall through to the .placeholder
// variant defined in app.css.
export function CoinBadge({
  symbol, color, size = 32,
}: { symbol: string; color?: string; size?: number }) {
  // Single-letter glyph in the center, scaled with the badge.
  const fontSize = Math.round(size * 0.5);
  const text = (symbol[0] ?? '').toUpperCase();
  if (color) {
    return (
      <div
        className="coin-badge"
        style={{ width: size, height: size, fontSize, background: color, color: '#fff' }}
      >
        {text}
      </div>
    );
  }
  return (
    <div
      className="coin-badge placeholder"
      style={{ width: size, height: size, fontSize }}
    >
      {text}
    </div>
  );
}

export function ChainBadge({ chainId, size = 22 }: { chainId: string; size?: number }) {
  const c = findChain(chainId);
  if (!c) return null;
  return <CoinBadge symbol={c.id} color={c.color} size={size} />;
}

export function TokenLabel({ tokenId }: { tokenId: string }) {
  const t = findToken(tokenId);
  const c = t ? findChain(t.chainId) : null;
  if (!t || !c) return <span className="muted">{tokenId}</span>;
  return (
    <span className="coin-cell">
      <CoinBadge symbol={t.symbol} color={t.color} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontWeight: 600 }}>{t.symbol}</span>
        <span className="mono" style={{ fontSize: 11 }}>{c.name}</span>
      </span>
    </span>
  );
}

// ============ Switch (per controls.html .sw — 36×20, radius 10, thumb 14) ============
export function Switch({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label
      className={`switch ${checked ? 'on' : ''}`}
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      onClick={(e) => {
        // we render the input as visually hidden — toggle here keeps a single click target
        if (e.target instanceof HTMLLabelElement) onChange(!checked);
      }}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="thumb" />
    </label>
  );
}

// ============ Checkbox (per controls.html .cb — 18×18, 2px border, currentColor checked) ============
export function Checkbox({
  checked, onChange,
}: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <span
      className={`check ${checked ? 'checked' : ''}`}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    />
  );
}

// ============ Modal ============
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open, onClose, title, children, footer, size = 'md', dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  /**
   * Whether the user can dismiss via mask click / ESC / close-x.
   * Set to `false` for destructive confirms — user must explicitly pick an
   * action button in the footer.
   */
  dismissable?: boolean;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Body scroll lock, ESC close, focus trap, restore-focus-on-close.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first interactive element inside the modal.
    const focusFirst = () => {
      const root = modalRef.current;
      if (!root) return;
      const f = root.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (f.length) f[0].focus();
      else root.focus();
    };
    const rafId = window.requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!dismissable) return;
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const root = modalRef.current;
        if (!root) return;
        const f = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (f.length === 0) {
          e.preventDefault();
          return;
        }
        const first = f[0];
        const last  = f[f.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !root.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;
  return (
    <div
      className="modal-mask"
      onClick={dismissable ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`modal ${size === 'md' ? '' : size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="modal-head">
          <h3 id="modal-title">{title}</h3>
          {dismissable && (
            <button className="close-x" onClick={onClose} aria-label="关闭">
              <IconClose size={18} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

// ============ Token multi-select pills (read-only display) ============
export function TokenPills({
  tokenIds, onRemove,
}: { tokenIds: string[]; onRemove?: (id: string) => void }) {
  if (tokenIds.length === 0) {
    return <div className="multi-select empty">未选择目标 token</div>;
  }
  return (
    <div className="multi-select">
      {tokenIds.map((id) => {
        const t = findToken(id);
        const c = t ? findChain(t.chainId) : null;
        if (!t || !c) return null;
        return (
          <span className="token-pill" key={id} title={`${c.name} · ${t.symbol}`}>
            <CoinBadge symbol={t.symbol} color={t.color} size={20} />
            <span>{c.name} · {t.symbol}</span>
            {onRemove && (
              <span className="x" onClick={() => onRemove(id)}><IconClose size={12} /></span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ============ Empty state ============
export function Empty({ title, desc, icon }: { title: string; desc?: string; icon?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-art">{icon}</div>
      <div className="title">{title}</div>
      {desc ? <div className="desc">{desc}</div> : null}
    </div>
  );
}

// ============ Stat tile ============
export function Stat({
  label, value, hint, tone = 'primary', icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'primary' | 'success' | 'warning' | 'info';
  icon?: ReactNode;
}) {
  return (
    <div className={`stat ${tone}`}>
      <div className="top">
        <div className="label">{label}</div>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

// ============ Pagination ============
import { IconChevronRight } from './Icon';

function pageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '...')[] = [1];
  if (current > 3) out.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) out.push(p);
  if (current < total - 2) out.push('...');
  out.push(total);
  return out;
}

export function Pagination({
  total, page, pageSize, onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  variant = 'footer',
}: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  pageSizeOptions?: number[];
  variant?: 'footer' | 'compact';
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safe = Math.min(Math.max(1, page), totalPages);
  const rangeStart = total === 0 ? 0 : (safe - 1) * pageSize + 1;
  const rangeEnd = Math.min(safe * pageSize, total);

  return (
    <div className={`pagination ${variant === 'footer' ? 'pagination-footer' : 'pagination-compact'}`}>
      <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
        <span className="muted" style={{ fontSize: 12 }}>
          {total === 0 ? '共 0 条' : `第 ${rangeStart}–${rangeEnd} 条 / 共 ${total} 条`}
        </span>
        {onPageSizeChange && (
          <div className="row gap-4" style={{ alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12 }}>每页</span>
            <select
              className="filter-select"
              style={{ padding: '4px 28px 4px 10px', fontSize: 12 }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="muted" style={{ fontSize: 12 }}>条</span>
          </div>
        )}
      </div>
      <div className="row gap-4">
        <button className="page-btn" disabled={safe <= 1} onClick={() => onPageChange(safe - 1)}>
          <IconChevronRight size={12} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        {pageRange(safe, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`gap-${i}`} className="page-gap">…</span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === safe ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button className="page-btn" disabled={safe >= totalPages} onClick={() => onPageChange(safe + 1)}>
          <IconChevronRight size={12}/>
        </button>
      </div>
    </div>
  );
}

// ============ formatter ============
export const usd = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Format a token quantity. Up to 8 decimals, trailing zeros trimmed,
 * with thousand separators on the integer part.
 *   "8500.00"      → "8,500"
 *   "1.50000000"   → "1.5"
 *   "0.123456789"  → "0.12345679"   (rounded at 8 dp)
 */
export const fmtTokenAmount = (n: number | string): string => {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString('en-US', { maximumFractionDigits: 8, minimumFractionDigits: 0 });
};

/** Step value for token-amount <input> elements — supports up to 8 decimals. */
export const TOKEN_AMOUNT_STEP = '0.00000001';

export const usdShort = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
