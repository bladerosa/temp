import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Select, NumberInput, Switch, Checkbox, Tag } from './ui';
import { DateRangePicker } from './DatePicker';
import { IconInfo } from './icons';
import type {
  RegTimeValue, RegTimeRelative, RegTimeAbsolute,
  DepositValue, DepositKind, DepositAmountValue, DepositCompareValue, DepositFirstValue,
  TxStatusValue, FeeRateValue, BlacklistValue,
  ConditionGroupValue, Operator, BoundOp, CmpOp, TimeUnit, ComparePreset,
} from './types';

const OPERATOR_OPTIONS = [
  { value: 'lt', label: '小于 (<)' },
  { value: 'gt', label: '大于 (>)' },
  { value: 'eq', label: '等于 (=)' },
  { value: 'between', label: '区间' },
];

const CMP_OP_OPTIONS = [
  { value: 'gt', label: '大于 (>)' },
  { value: 'lt', label: '小于 (<)' },
  { value: 'gte', label: '大于等于 (≥)' },
  { value: 'lte', label: '小于等于 (≤)' },
  { value: 'eq', label: '等于 (=)' },
];

const TIME_UNIT_OPTIONS = [
  { value: 'day', label: '天' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

const LEFT_OP_OPTIONS = [
  { value: 'gt', label: '大于 (>)' },
  { value: 'gte', label: '大于等于 (≥)' },
];

const RIGHT_OP_OPTIONS = [
  { value: 'lt', label: '小于 (<)' },
  { value: 'lte', label: '小于等于 (≤)' },
];

const CMP_OP_TEXT: Record<CmpOp, string> = {
  lt: '小于', lte: '小于等于', gt: '大于', gte: '大于等于', eq: '等于',
};

const HALF_YEAR_MS = 183 * 24 * 3600 * 1000;

function spanTooLong(start: string, end: string): boolean {
  if (!start || !end) return false;
  return new Date(end).getTime() - new Date(start).getTime() > HALF_YEAR_MS;
}

const boxStyle = {
  padding: 16,
  background: 'var(--bg-subtle)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 8,
} as const;

// ── RegTimeCondition ─────────────────────────────────────────────────────────
interface RegTimeConditionProps {
  value?: RegTimeValue | null;
  onChange: (v: RegTimeValue) => void;
  mode?: 'relative' | 'absolute';
}

export function RegTimeCondition({ value, onChange, mode = 'relative' }: RegTimeConditionProps) {
  const v: RegTimeValue = value ?? (
    mode === 'absolute'
      ? ({ mode: 'absolute', startDate: '', endDate: '' } as RegTimeAbsolute)
      : ({ mode: 'relative', op: 'lt', n1: '', u1: 'month', n2: '', u2: 'month' } as RegTimeRelative)
  );

  return (
    <div style={boxStyle}>
      {mode === 'absolute' ? (
        <AbsoluteRegTime
          v={v as RegTimeAbsolute}
          update={patch => onChange({ ...(v as RegTimeAbsolute), ...patch } as RegTimeAbsolute)}
        />
      ) : (
        <RelativeRegTime
          v={v as RegTimeRelative}
          update={patch => onChange({ ...(v as RegTimeRelative), ...patch } as RegTimeRelative)}
        />
      )}
      <ConditionPreview text={formatRegTime(v, mode)} />
    </div>
  );
}

function AbsoluteRegTime({ v, update }: { v: RegTimeAbsolute; update: (p: Partial<RegTimeAbsolute>) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 84 }}>注册时间</span>
      <div style={{ flex: 1, minWidth: 260, display: 'flex' }}>
        <DateRangePicker
          value={{ start: v.startDate, end: v.endDate }}
          onChange={({ start, end }) => update({ startDate: start, endDate: end })}
        />
      </div>
    </div>
  );
}

function RelativeRegTime({ v, update }: { v: RegTimeRelative; update: (p: Partial<RegTimeRelative>) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>注册时间</span>
      <div style={{ width: 120 }}>
        <Select value={v.op} onChange={op => update({ op: op as Operator })} options={OPERATOR_OPTIONS} />
      </div>
      {v.op !== 'between' ? (
        <>
          <div style={{ width: 100 }}>
            <NumberInput value={v.n1} onChange={n1 => update({ n1 })} placeholder="数值" min={0} />
          </div>
          <div style={{ width: 90 }}>
            <Select value={v.u1} onChange={u1 => update({ u1: u1 as TimeUnit })} options={TIME_UNIT_OPTIONS} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>(相对执行日)</span>
        </>
      ) : (
        <>
          <div style={{ width: 118 }}>
            <Select value={v.leftOp ?? 'gt'} onChange={leftOp => update({ leftOp: leftOp as BoundOp })} options={LEFT_OP_OPTIONS} />
          </div>
          <div style={{ width: 80 }}>
            <NumberInput value={v.n1} onChange={n1 => update({ n1 })} placeholder="起始" min={0} />
          </div>
          <div style={{ width: 80 }}>
            <Select value={v.u1} onChange={u1 => update({ u1: u1 as TimeUnit })} options={TIME_UNIT_OPTIONS} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>且</span>
          <div style={{ width: 118 }}>
            <Select value={v.rightOp ?? 'lt'} onChange={rightOp => update({ rightOp: rightOp as BoundOp })} options={RIGHT_OP_OPTIONS} />
          </div>
          <div style={{ width: 80 }}>
            <NumberInput value={v.n2} onChange={n2 => update({ n2 })} placeholder="结束" min={0} />
          </div>
          <div style={{ width: 80 }}>
            <Select value={v.u2} onChange={u2 => update({ u2: u2 as TimeUnit })} options={TIME_UNIT_OPTIONS} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>(相对执行日)</span>
        </>
      )}
    </div>
  );
}

export function formatRegTime(v: RegTimeValue | null | undefined, mode: 'relative' | 'absolute' = 'relative'): string {
  if (!v) return '—';
  const resolvedMode = ('mode' in v && v.mode) || mode;
  if (resolvedMode === 'absolute') {
    const a = v as RegTimeAbsolute;
    if (!a.startDate || !a.endDate) return '请选择注册时间起止日期';
    return `注册时间 在 ${a.startDate} 至 ${a.endDate}`;
  }
  const r = v as RegTimeRelative;
  const unitText = (u: TimeUnit) => ({ day: '天', week: '周', month: '个月', year: '年' } as Record<TimeUnit, string>)[u] ?? '';
  if (r.op === 'between') {
    if (!r.n1 || !r.n2) return '请填写完整区间';
    const lo = r.leftOp === 'gte' ? '大于等于' : '大于';
    const ro = r.rightOp === 'lte' ? '小于等于' : '小于';
    return `注册时间 ${lo} ${r.n1}${unitText(r.u1)} 且 ${ro} ${r.n2}${unitText(r.u2)}`;
  }
  if (!r.n1) return '请填写数值';
  const opMap: Record<string, string> = { lt: '小于', gt: '大于', eq: '等于' };
  return `注册时间 ${opMap[r.op]} ${r.n1}${unitText(r.u1)}`;
}

// ── DepositCondition（入金金额 / 两窗口环比 / 首次入金时间，三选一） ─────────────
export function defaultDepositValue(): DepositValue {
  return {
    kind: 'amount',
    amount: { startDate: '', endDate: '', recentN: '', recentU: 'day', op: 'lt', a1: '', a2: '' },
    compare: { aStart: '', aEnd: '', bStart: '', bEnd: '', preset: 'recentN', recentN: '30', op: 'lt', pct: '' },
    first: { op: 'gt', days: '', startDate: '', endDate: '' },
  };
}

interface DepositConditionProps {
  value?: DepositValue | null;
  onChange: (v: DepositValue) => void;
  rangeMode: 'absolute' | 'relative';
}

const DEPOSIT_KIND_TABS: { key: DepositKind; label: string }[] = [
  { key: 'amount', label: '入金金额' },
  { key: 'compare', label: '两窗口环比' },
  { key: 'first', label: '首次入金时间' },
];

export function DepositCondition({ value, onChange, rangeMode }: DepositConditionProps) {
  const v: DepositValue = value ?? defaultDepositValue();

  return (
    <div style={boxStyle}>
      {/* 类型切换 */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 14,
        background: '#E9EBF1', padding: 3, borderRadius: 9, width: 'fit-content',
      }}>
        {DEPOSIT_KIND_TABS.map(t => {
          const active = v.kind === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange({ ...v, kind: t.key })}
              style={{
                padding: '6px 14px',
                background: active ? '#fff' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none', borderRadius: 7,
                fontSize: 12.5, fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(16,24,40,.08)' : 'none',
                fontFamily: 'inherit', transition: 'all .15s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {v.kind === 'amount' && (
        <DepositAmount
          v={v.amount}
          update={patch => onChange({ ...v, amount: { ...v.amount, ...patch } })}
          rangeMode={rangeMode}
        />
      )}
      {v.kind === 'compare' && (
        <DepositCompare
          v={v.compare}
          update={patch => onChange({ ...v, compare: { ...v.compare, ...patch } })}
          rangeMode={rangeMode}
        />
      )}
      {v.kind === 'first' && (
        <DepositFirst
          v={v.first}
          update={patch => onChange({ ...v, first: { ...v.first, ...patch } })}
          rangeMode={rangeMode}
        />
      )}

      <ConditionPreview text={formatDeposit(v, rangeMode)} />
    </div>
  );
}

function DepositAmount({ v, update, rangeMode }: {
  v: DepositAmountValue;
  update: (p: Partial<DepositAmountValue>) => void;
  rangeMode: 'absolute' | 'relative';
}) {
  return (
    <>
      {/* Time range row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 84 }}>统计时间</span>
        {rangeMode === 'absolute' ? (
          <div style={{ flex: 1, minWidth: 260, display: 'flex' }}>
            <DateRangePicker
              value={{ start: v.startDate, end: v.endDate }}
              onChange={({ start, end }) => update({ startDate: start, endDate: end })}
            />
          </div>
        ) : (
          <>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>最近</span>
            <div style={{ width: 100 }}>
              <NumberInput value={v.recentN} onChange={recentN => update({ recentN })} placeholder="数值" min={1} />
            </div>
            <div style={{ width: 90 }}>
              <Select value={v.recentU} onChange={recentU => update({ recentU: recentU as TimeUnit })} options={TIME_UNIT_OPTIONS} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>(相对执行日)</span>
          </>
        )}
      </div>

      {/* Amount row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>入金金额（相对执行日）</span>
        <div style={{ width: 120 }}>
          <Select value={v.op} onChange={op => update({ op: op as Operator })} options={OPERATOR_OPTIONS} />
        </div>
        {v.op !== 'between' ? (
          <div style={{ width: 180 }}>
            <NumberInput value={v.a1} onChange={a1 => update({ a1 })} placeholder="0.00" min={0} step="0.01" suffix="USD" />
          </div>
        ) : (
          <>
            <div style={{ width: 118 }}>
              <Select value={v.leftOp ?? 'gt'} onChange={leftOp => update({ leftOp: leftOp as BoundOp })} options={LEFT_OP_OPTIONS} />
            </div>
            <div style={{ width: 130 }}>
              <NumberInput value={v.a1} onChange={a1 => update({ a1 })} placeholder="0.00" min={0} step="0.01" suffix="USD" />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>且</span>
            <div style={{ width: 118 }}>
              <Select value={v.rightOp ?? 'lt'} onChange={rightOp => update({ rightOp: rightOp as BoundOp })} options={RIGHT_OP_OPTIONS} />
            </div>
            <div style={{ width: 130 }}>
              <NumberInput value={v.a2} onChange={a2 => update({ a2 })} placeholder="0.00" min={0} step="0.01" suffix="USD" />
            </div>
          </>
        )}
      </div>
    </>
  );
}

const COMPARE_PRESET_OPTIONS = [
  { value: 'recentN', label: '近 N 天 vs 前 N 天' },
  { value: 'calMonth', label: '上自然月 vs 上上自然月' },
];

function DepositCompare({ v, update, rangeMode }: {
  v: DepositCompareValue;
  update: (p: Partial<DepositCompareValue>) => void;
  rangeMode: 'absolute' | 'relative';
}) {
  const aTooLong = spanTooLong(v.aStart, v.aEnd);
  const bTooLong = spanTooLong(v.bStart, v.bEnd);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rangeMode === 'absolute' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 110 }}>窗口A（数据源）</span>
            <div style={{ flex: 1, minWidth: 260, display: 'flex' }}>
              <DateRangePicker
                value={{ start: v.aStart, end: v.aEnd }}
                onChange={({ start, end }) => update({ aStart: start, aEnd: end })}
              />
            </div>
            {aTooLong && <span style={{ fontSize: 12, color: 'var(--error)' }}>跨度超过半年</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 110 }}>窗口B（对比基准）</span>
            <div style={{ flex: 1, minWidth: 260, display: 'flex' }}>
              <DateRangePicker
                value={{ start: v.bStart, end: v.bEnd }}
                onChange={({ start, end }) => update({ bStart: start, bEnd: end })}
              />
            </div>
            {bTooLong && <span style={{ fontSize: 12, color: 'var(--error)' }}>跨度超过半年</span>}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 84 }}>对比窗口</span>
          <div style={{ width: 200 }}>
            <Select
              value={v.preset}
              onChange={preset => update({ preset: preset as ComparePreset })}
              options={COMPARE_PRESET_OPTIONS}
            />
          </div>
          {v.preset === 'recentN' && (
            <>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>N =</span>
              <div style={{ width: 90 }}>
                <NumberInput value={v.recentN} onChange={recentN => update({ recentN })} placeholder="天数" min={1} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>天</span>
            </>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>(相对执行日)</span>
        </div>
      )}

      {/* 命中条件 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: rangeMode === 'absolute' ? 110 : 84 }}>命中条件</span>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>窗口A 入金金额</span>
        <div style={{ width: 140 }}>
          <Select value={v.op} onChange={op => update({ op: op as CmpOp })} options={CMP_OP_OPTIONS} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>窗口B 入金金额 ×</span>
        <div style={{ width: 110 }}>
          <NumberInput value={v.pct} onChange={pct => update({ pct })} placeholder="比例" min={0} suffix="%" />
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {rangeMode === 'absolute'
          ? '每个窗口跨度不可超过半年；满足条件的窗口A内商户视为命中。'
          : '窗口按任务执行日动态计算；满足条件的窗口A内商户视为命中。'}
      </div>
    </div>
  );
}

function DepositFirst({ v, update, rangeMode }: {
  v: DepositFirstValue;
  update: (p: Partial<DepositFirstValue>) => void;
  rangeMode: 'absolute' | 'relative';
}) {
  if (rangeMode === 'absolute') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 84 }}>首次入金时间</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>在</span>
        <div style={{ flex: 1, minWidth: 260, display: 'flex' }}>
          <DateRangePicker
            value={{ start: v.startDate, end: v.endDate }}
            onChange={({ start, end }) => update({ startDate: start, endDate: end })}
          />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>首次入金时间 距今</span>
      <div style={{ width: 140 }}>
        <Select value={v.op} onChange={op => update({ op: op as CmpOp })} options={CMP_OP_OPTIONS} />
      </div>
      <div style={{ width: 100 }}>
        <NumberInput value={v.days} onChange={days => update({ days })} placeholder="天数" min={0} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>天</span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>(相对执行日)</span>
    </div>
  );
}

export function formatDeposit(v: DepositValue | null | undefined, rangeMode: 'absolute' | 'relative'): string {
  if (!v) return '—';
  if (v.kind === 'compare') return formatDepositCompare(v.compare, rangeMode);
  if (v.kind === 'first') return formatDepositFirst(v.first, rangeMode);
  return formatDepositAmount(v.amount, rangeMode);
}

function formatDepositAmount(v: DepositAmountValue, rangeMode: 'absolute' | 'relative'): string {
  const unitText = (u: TimeUnit) => ({ day: '天', week: '周', month: '个月', year: '年' } as Record<TimeUnit, string>)[u] ?? '';
  const rangePart = rangeMode === 'absolute'
    ? (v.startDate && v.endDate ? `${v.startDate} 至 ${v.endDate}` : '请选择时间范围')
    : (v.recentN ? `最近 ${v.recentN}${unitText(v.recentU)}内` : '请填写相对时间');

  let amtPart: string;
  const opMap: Record<string, string> = { lt: '小于', gt: '大于', eq: '等于' };
  if (v.op === 'between') {
    if (!v.a1 || !v.a2) {
      amtPart = '请填写完整区间';
    } else {
      const lo = v.leftOp === 'gte' ? '大于等于' : '大于';
      const ro = v.rightOp === 'lte' ? '小于等于' : '小于';
      const lb = v.leftOp === 'gte' ? '[' : '(';
      const rb = v.rightOp === 'lte' ? ']' : ')';
      amtPart = `入金金额 ${lo} ${v.a1} USD 且 ${ro} ${v.a2} USD  ${lb}${v.a1}, ${v.a2}${rb}`;
    }
  } else {
    amtPart = v.a1 ? `入金金额 ${opMap[v.op]} ${v.a1} USD` : '请填写金额';
  }
  return `${rangePart} ${amtPart}`;
}

function formatDepositCompare(c: DepositCompareValue, rangeMode: 'absolute' | 'relative'): string {
  const opT = CMP_OP_TEXT[c.op];
  if (rangeMode === 'absolute') {
    if (!c.aStart || !c.aEnd || !c.bStart || !c.bEnd) return '请完整选择窗口A与窗口B的起止日期';
    if (spanTooLong(c.aStart, c.aEnd)) return '窗口A跨度超过半年，请调整';
    if (spanTooLong(c.bStart, c.bEnd)) return '窗口B跨度超过半年，请调整';
    if (!c.pct) return '请填写对比百分比';
    return `窗口A ${c.aStart}至${c.aEnd} 入金金额 ${opT} 窗口B ${c.bStart}至${c.bEnd} × ${c.pct}%`;
  }
  if (c.preset === 'calMonth') {
    if (!c.pct) return '请填写对比百分比';
    return `上自然月(A) 入金金额 ${opT} 上上自然月(B) × ${c.pct}%`;
  }
  if (!c.recentN) return '请填写对比窗口天数';
  if (!c.pct) return '请填写对比百分比';
  return `近${c.recentN}天(A) 入金金额 ${opT} 前${c.recentN}天(B) × ${c.pct}%`;
}

function formatDepositFirst(f: DepositFirstValue, rangeMode: 'absolute' | 'relative'): string {
  if (rangeMode === 'absolute') {
    if (!f.startDate || !f.endDate) return '请选择首次入金时间起止日期';
    return `首次入金时间 在 ${f.startDate} 至 ${f.endDate}`;
  }
  if (!f.days) return '请填写首次入金距今天数';
  return `首次入金时间 距执行日 ${CMP_OP_TEXT[f.op]} ${f.days} 天`;
}

// ── TxStatusCondition ────────────────────────────────────────────────────────
export function defaultTxStatusValue(): TxStatusValue {
  return { deposit: false, swap: false, withdraw: false };
}

export function TxStatusCondition({ value, onChange }: {
  value?: TxStatusValue | null;
  onChange: (v: TxStatusValue) => void;
}) {
  const v: TxStatusValue = value ?? defaultTxStatusValue();
  const update = (patch: Partial<TxStatusValue>) => onChange({ ...v, ...patch });

  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 84 }}>未使用功能</span>
        <Checkbox checked={v.deposit} onChange={deposit => update({ deposit })}>Deposit</Checkbox>
        <Checkbox checked={v.swap} onChange={swap => update({ swap })}>Swap</Checkbox>
        <Checkbox checked={v.withdraw} onChange={withdraw => update({ withdraw })}>Withdraw</Checkbox>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
        筛选未使用过所勾选功能的商户，可用于针对性推广产品功能。
      </div>
      <ConditionPreview text={formatTxStatus(v)} />
    </div>
  );
}

export function formatTxStatus(v: TxStatusValue | null | undefined): string {
  if (!v) return '—';
  const sel = [v.deposit && 'Deposit', v.swap && 'Swap', v.withdraw && 'Withdraw'].filter(Boolean) as string[];
  if (!sel.length) return '请至少勾选一个功能';
  return `未使用过 ${sel.join('、')}`;
}

// ── FeeRateCondition ─────────────────────────────────────────────────────────
export function defaultFeeRateValue(): FeeRateValue {
  return { op: 'lt', v1: '', v2: '' };
}

export function FeeRateCondition({ value, onChange }: {
  value?: FeeRateValue | null;
  onChange: (v: FeeRateValue) => void;
}) {
  const v: FeeRateValue = value ?? defaultFeeRateValue();
  const update = (patch: Partial<FeeRateValue>) => onChange({ ...v, ...patch });

  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 84 }}>当前费率</span>
        <div style={{ width: 120 }}>
          <Select value={v.op} onChange={op => update({ op: op as Operator })} options={OPERATOR_OPTIONS} />
        </div>
        {v.op !== 'between' ? (
          <div style={{ width: 150 }}>
            <NumberInput value={v.v1} onChange={v1 => update({ v1 })} placeholder="0.00" min={0} step="0.01" suffix="%" />
          </div>
        ) : (
          <>
            <div style={{ width: 118 }}>
              <Select value={v.leftOp ?? 'gt'} onChange={leftOp => update({ leftOp: leftOp as BoundOp })} options={LEFT_OP_OPTIONS} />
            </div>
            <div style={{ width: 120 }}>
              <NumberInput value={v.v1} onChange={v1 => update({ v1 })} placeholder="0.00" min={0} step="0.01" suffix="%" />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>且</span>
            <div style={{ width: 118 }}>
              <Select value={v.rightOp ?? 'lt'} onChange={rightOp => update({ rightOp: rightOp as BoundOp })} options={RIGHT_OP_OPTIONS} />
            </div>
            <div style={{ width: 120 }}>
              <NumberInput value={v.v2} onChange={v2 => update({ v2 })} placeholder="0.00" min={0} step="0.01" suffix="%" />
            </div>
          </>
        )}
      </div>
      <ConditionPreview text={formatFeeRate(v)} />
    </div>
  );
}

export function formatFeeRate(v: FeeRateValue | null | undefined): string {
  if (!v) return '—';
  const opMap: Record<string, string> = { lt: '小于', gt: '大于', eq: '等于' };
  if (v.op === 'between') {
    if (!v.v1 || !v.v2) return '请填写完整区间';
    const lo = v.leftOp === 'gte' ? '大于等于' : '大于';
    const ro = v.rightOp === 'lte' ? '小于等于' : '小于';
    return `当前费率 ${lo} ${v.v1}% 且 ${ro} ${v.v2}%`;
  }
  if (!v.v1) return '请填写费率';
  return `当前费率 ${opMap[v.op]} ${v.v1}%`;
}

// ── BlacklistCondition（排除项） ──────────────────────────────────────────────
export function parseBlacklistIds(ids: string): string[] {
  return Array.from(new Set(ids.split(/[\s,，;；]+/).map(s => s.trim()).filter(Boolean)));
}

export function BlacklistCondition({ value, onChange }: {
  value?: BlacklistValue | null;
  onChange: (v: BlacklistValue) => void;
}) {
  const v: BlacklistValue = value ?? { ids: '' };
  const ids = parseBlacklistIds(v.ids);

  return (
    <div style={boxStyle}>
      <textarea
        value={v.ids}
        onChange={e => onChange({ ids: e.target.value })}
        rows={3}
        placeholder="输入要屏蔽的商户 ID，支持逗号 / 空格 / 换行分隔，如：M0001234 M0005678"
        style={{
          width: '100%', boxSizing: 'border-box',
          border: '1px solid var(--border-default)', borderRadius: 8,
          padding: '10px 12px', fontSize: 12.5,
          fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
          background: 'var(--bg-paper)', outline: 'none', resize: 'vertical',
          lineHeight: 1.6,
        }}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        已识别 <b style={{ color: 'var(--primary)' }}>{ids.length}</b> 个商户 ID，命中结果中将排除这些商户
      </div>
      <ConditionPreview text={formatBlacklist(v)} />
    </div>
  );
}

export function formatBlacklist(v: BlacklistValue | null | undefined): string {
  const ids = parseBlacklistIds(v?.ids ?? '');
  if (!ids.length) return '请输入要屏蔽的商户 ID';
  const sample = ids.slice(0, 5).join('、');
  return `屏蔽 ${ids.length} 个商户 ID：${sample}${ids.length > 5 ? ' 等' : ''}`;
}

// ── ConditionPreview ─────────────────────────────────────────────────────────
function ConditionPreview({ text }: { text: string }) {
  return (
    <div style={{
      marginTop: 12, padding: '8px 12px',
      background: 'var(--bg-paper)', border: '1px solid var(--border-subtle)',
      borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <IconInfo size={12} stroke="var(--grey-600)" />
      <span style={{ flex: 1 }}>预览：{text}</span>
    </div>
  );
}

// ── Group helpers ─────────────────────────────────────────────────────────────
export function emptyConditionGroup(): ConditionGroupValue {
  return {
    regEnabled: false, regValue: null,
    depositEnabled: false, depositValue: null,
    txEnabled: false, txValue: null,
    feeEnabled: false, feeValue: null,
    blockEnabled: false, blockValue: null,
  };
}

/** 至少启用一个「筛选」条件（屏蔽商户为排除项，不计入） */
export function anyFilterEnabled(v: ConditionGroupValue | null | undefined): boolean {
  if (!v) return false;
  return v.regEnabled || v.depositEnabled || v.txEnabled || v.feeEnabled;
}

export function buildConditionSummary(
  v: ConditionGroupValue | null | undefined,
  rangeMode: 'absolute' | 'relative',
): string {
  if (!v) return '未设置触发条件';
  const parts: string[] = [];
  if (v.regEnabled) parts.push(formatRegTime(v.regValue, rangeMode));
  if (v.depositEnabled) parts.push(formatDeposit(v.depositValue ?? defaultDepositValue(), rangeMode));
  if (v.txEnabled) parts.push(formatTxStatus(v.txValue ?? defaultTxStatusValue()));
  if (v.feeEnabled) parts.push(formatFeeRate(v.feeValue ?? defaultFeeRateValue()));
  const base = parts.length ? parts.join(' · 且 ') : '未设置触发条件';
  if (v.blockEnabled) {
    const n = parseBlacklistIds(v.blockValue?.ids ?? '').length;
    return n ? `${base} · 屏蔽 ${n} 个商户` : `${base} · 屏蔽名单未填写`;
  }
  return base;
}

// ── ConditionGroup ───────────────────────────────────────────────────────────
interface ConditionGroupProps {
  value?: ConditionGroupValue | null;
  onChange: (v: ConditionGroupValue) => void;
  rangeMode: 'absolute' | 'relative';
  showHintNone?: boolean;
}

export function ConditionGroup({ value, onChange, rangeMode, showHintNone = true }: ConditionGroupProps) {
  const v: ConditionGroupValue = value ?? emptyConditionGroup();
  const update = (patch: Partial<ConditionGroupValue>) => onChange({ ...v, ...patch });

  const noneOn = !anyFilterEnabled(v);

  const blocks: { key: string; enabled: boolean; exclude?: boolean; el: ReactNode }[] = [
    {
      key: 'reg', enabled: v.regEnabled,
      el: (
        <ConditionBlock
          title="注册时间条件"
          description="按用户注册距今的时长筛选"
          enabled={v.regEnabled}
          onToggle={on => update({ regEnabled: on })}
        >
          <RegTimeCondition value={v.regValue} onChange={regValue => update({ regValue })} mode={rangeMode} />
        </ConditionBlock>
      ),
    },
    {
      key: 'deposit', enabled: v.depositEnabled,
      el: (
        <ConditionBlock
          title="入金条件"
          description="入金金额 / 两窗口环比 / 首次入金时间，三选一"
          enabled={v.depositEnabled}
          onToggle={on => update({ depositEnabled: on })}
        >
          <DepositCondition value={v.depositValue} onChange={depositValue => update({ depositValue })} rangeMode={rangeMode} />
        </ConditionBlock>
      ),
    },
    {
      key: 'tx', enabled: v.txEnabled,
      el: (
        <ConditionBlock
          title="交易状态条件"
          description="按未使用过 Deposit / Swap / Withdraw 功能筛选"
          enabled={v.txEnabled}
          onToggle={on => update({ txEnabled: on })}
        >
          <TxStatusCondition value={v.txValue} onChange={txValue => update({ txValue })} />
        </ConditionBlock>
      ),
    },
    {
      key: 'fee', enabled: v.feeEnabled,
      el: (
        <ConditionBlock
          title="当前费率条件"
          description="按商户当前费率筛选"
          enabled={v.feeEnabled}
          onToggle={on => update({ feeEnabled: on })}
        >
          <FeeRateCondition value={v.feeValue} onChange={feeValue => update({ feeValue })} />
        </ConditionBlock>
      ),
    },
    {
      key: 'block', enabled: v.blockEnabled, exclude: true,
      el: (
        <ConditionBlock
          title="屏蔽商户"
          description="命中结果中排除以下商户 ID"
          badge={<Tag color="warn" dot={false}>排除项</Tag>}
          enabled={v.blockEnabled}
          onToggle={on => update({ blockEnabled: on })}
        >
          <BlacklistCondition value={v.blockValue} onChange={blockValue => update({ blockValue })} />
        </ConditionBlock>
      ),
    },
  ];

  const rendered: ReactNode[] = [];
  let seenEnabled = false;
  for (const b of blocks) {
    if (b.enabled && seenEnabled) {
      rendered.push(<GroupDivider key={`${b.key}-div`} label={b.exclude ? 'EXCLUDE · 排除' : 'AND · 且'} tone={b.exclude ? 'warn' : 'primary'} />);
    }
    if (b.enabled) seenEnabled = true;
    rendered.push(<Fragment key={b.key}>{b.el}</Fragment>);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rendered}

      {showHintNone && noneOn && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--warning-lighter)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--warning-darker)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--warning)', color: 'var(--text-primary)',
            display: 'grid', placeItems: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>!</span>
          请至少启用一个筛选条件（注册时间 / 入金 / 交易状态 / 当前费率）
          {v.blockEnabled ? '；「屏蔽商户」为排除项，不能单独作为筛选条件' : ''}
        </div>
      )}
    </div>
  );
}

function GroupDivider({ label, tone }: { label: string; tone: 'primary' | 'warn' }) {
  const bg = tone === 'warn' ? 'var(--warning-lighter)' : 'var(--primary-lighter)';
  const fg = tone === 'warn' ? 'var(--warning-darker)' : 'var(--primary-darker)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '2px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      <div style={{
        padding: '4px 12px',
        background: bg,
        color: fg,
        fontSize: 11, fontWeight: 700,
        borderRadius: 9999, letterSpacing: '.04em',
      }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}

// ── ConditionBlock ────────────────────────────────────────────────────────────
interface ConditionBlockProps {
  title: string;
  description: string;
  badge?: ReactNode;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: ReactNode;
}

function ConditionBlock({ title, description, badge, enabled, onToggle, children }: ConditionBlockProps) {
  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      background: 'var(--bg-paper)',
      boxShadow: enabled ? 'var(--shadow-z1)' : 'none',
      transition: 'box-shadow 120ms ease-out',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: enabled ? '1px solid var(--border-subtle)' : 'none',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {title}
            {badge}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{description}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: enabled ? 'var(--primary-dark)' : 'var(--text-secondary)', fontWeight: 500 }}>
            {enabled ? '已启用' : '未启用'}
          </span>
          <Switch checked={enabled} onChange={onToggle} />
        </div>
      </div>
      {enabled && (
        <div style={{ padding: 20 }}>
          {children}
        </div>
      )}
    </div>
  );
}
