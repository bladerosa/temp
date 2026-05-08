// CCPayment-styled date picker
// Supports single-date ('single') and date-range ('range') modes.
// All chrome derived from the CCPayment design system: Poppins, 8px radius inputs,
// 12px radius dropdown, --shadow-dropdown, primary-lighter for range, primary dot
// indicator on day cells.

const DP_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DP_MONTHS = [
  '1\u6708','2\u6708','3\u6708','4\u6708','5\u6708','6\u6708',
  '7\u6708','8\u6708','9\u6708','10\u6708','11\u6708','12\u6708',
];

function dpPad(n) { return n < 10 ? '0' + n : '' + n; }
function dpFmt(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${dpPad(d.getMonth() + 1)}-${dpPad(d.getDate())}`;
}
function dpParse(s) {
  if (!s) return null;
  if (s instanceof Date) return s;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}
function dpSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function dpStartOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function dpAddMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function dpIsBefore(a, b) { return a && b && a.getTime() < b.getTime(); }
function dpIsAfter(a, b) { return a && b && a.getTime() > b.getTime(); }

function DPMonth({ anchor, selected, rangeStart, rangeEnd, hover, onPick, onHover }) {
  // anchor is first-of-month
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();

  const cells = [];
  // Leading dates from prev month
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(y, m - 1, daysInPrev - i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(y, m, d), outside: false });
  }
  // Trailing to complete 6 rows = 42 cells
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), outside: true });
  }

  // Determine effective range endpoints (selecting state)
  let rs = rangeStart, re = rangeEnd;
  if (rs && !re && hover) {
    if (dpIsBefore(hover, rs)) { re = rs; rs = hover; } else { re = hover; }
  }

  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div style={{ padding: '4px 10px 10px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
        padding: '6px 0',
      }}>
        {DP_WEEKDAYS.map(w => (
          <div key={w} style={{ textAlign: 'center', padding: '4px 0' }}>{w}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
        {cells.map((c, i) => {
          const isSel = selected && dpSameDay(c.date, selected);
          const isStart = rs && dpSameDay(c.date, rs);
          const isEnd = re && dpSameDay(c.date, re);
          const inRange = rs && re && !c.outside && c.date > rs && c.date < re;
          const isToday = dpSameDay(c.date, today);
          const endpoint = isStart || isEnd;

          // range background band
          const bandStyle = (rs && re && ((c.date >= rs && c.date <= re) && !c.outside))
            ? {
                background: 'var(--primary-lighter)',
                borderTopLeftRadius: isStart ? 999 : 0,
                borderBottomLeftRadius: isStart ? 999 : 0,
                borderTopRightRadius: isEnd ? 999 : 0,
                borderBottomRightRadius: isEnd ? 999 : 0,
              }
            : {};

          return (
            <div
              key={i}
              onMouseEnter={() => onHover && onHover(c.date)}
              onClick={() => !c.outside && onPick && onPick(c.date)}
              style={{
                height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: c.outside ? 'default' : 'pointer',
                ...bandStyle,
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
                fontWeight: endpoint || isSel ? 600 : 500,
                color: c.outside
                  ? 'var(--grey-400)'
                  : (endpoint || isSel)
                    ? '#fff'
                    : isToday ? 'var(--primary)' : 'var(--text-primary)',
                background: (endpoint || isSel) ? 'var(--primary)' : 'transparent',
                border: !endpoint && !isSel && isToday ? '1.5px solid var(--primary)' : 'none',
                boxSizing: 'border-box',
                transition: 'background 120ms ease-out, color 120ms ease-out',
              }}
              onMouseEnter={e => {
                if (!endpoint && !isSel && !c.outside && !inRange) e.currentTarget.style.background = 'var(--bg-subtle)';
              }}
              onMouseLeave={e => {
                if (!endpoint && !isSel && !c.outside && !inRange) e.currentTarget.style.background = 'transparent';
              }}
              >
                {c.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DPHeader({ anchor, onPrev, onNext, onPrevYear, onNextYear }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px 6px',
    }}>
      <div style={{ display: 'flex', gap: 2 }}>
        <button type="button" onClick={onPrevYear} style={dpIconBtn} title="\u4e0a\u4e00\u5e74">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
        </button>
        <button type="button" onClick={onPrev} style={dpIconBtn} title="\u4e0a\u4e00\u6708">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
        {anchor.getFullYear()}年 {DP_MONTHS[anchor.getMonth()]}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        <button type="button" onClick={onNext} style={dpIconBtn} title="\u4e0b\u4e00\u6708">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
        <button type="button" onClick={onNextYear} style={dpIconBtn} title="\u4e0b\u4e00\u5e74">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg>
        </button>
      </div>
    </div>
  );
}

const dpIconBtn = {
  width: 28, height: 28, borderRadius: 8,
  border: 'none', background: 'transparent', color: 'var(--text-secondary)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 120ms ease-out, color 120ms ease-out',
};

function DatePicker({ value, onChange, placeholder, disabled, minDate, maxDate }) {
  const [open, setOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState(() => dpStartOfMonth(dpParse(value) || new Date()));
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = dpParse(value);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          height: 40,
          padding: '0 12px',
          background: disabled ? 'var(--bg-subtle)' : 'var(--bg-paper)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border-default)'}`,
          boxShadow: open ? '0 0 0 3px rgba(60,111,245,.14)' : 'none',
          borderRadius: 8,
          textAlign: 'left',
          fontSize: 14,
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? dpFmt(selected) : (placeholder || '\u9009\u62e9\u65e5\u671f')}
        </span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: 280,
          background: 'var(--bg-paper)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-dropdown)',
          zIndex: 50,
          overflow: 'hidden',
        }}>
          <DPHeader
            anchor={anchor}
            onPrev={() => setAnchor(dpAddMonths(anchor, -1))}
            onNext={() => setAnchor(dpAddMonths(anchor, 1))}
            onPrevYear={() => setAnchor(dpAddMonths(anchor, -12))}
            onNextYear={() => setAnchor(dpAddMonths(anchor, 12))}
          />
          <DPMonth
            anchor={anchor}
            selected={selected}
            onPick={(d) => { onChange && onChange(dpFmt(d)); setOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}

function DateRangePicker({ value, onChange, disabled }) {
  // value = { start, end } as yyyy-mm-dd strings
  const [open, setOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState(() => dpStartOfMonth(dpParse(value && value.start) || new Date()));
  const [pickingEnd, setPickingEnd] = React.useState(false);
  const [draft, setDraft] = React.useState({ start: null, end: null });
  const [hover, setHover] = React.useState(null);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  React.useEffect(() => {
    if (open) {
      setDraft({ start: dpParse(value && value.start), end: dpParse(value && value.end) });
      setPickingEnd(false);
    }
  }, [open]);

  const onPick = (d) => {
    if (!pickingEnd) {
      setDraft({ start: d, end: null });
      setPickingEnd(true);
    } else {
      let s = draft.start, e = d;
      if (dpIsBefore(e, s)) { [s, e] = [e, s]; }
      setDraft({ start: s, end: e });
      onChange && onChange({ start: dpFmt(s), end: dpFmt(e) });
      setOpen(false);
    }
  };

  const selStart = draft.start || dpParse(value && value.start);
  const selEnd = draft.end || dpParse(value && value.end);

  const display = (selStart && selEnd)
    ? `${dpFmt(selStart)} \u2192 ${dpFmt(selEnd)}`
    : (dpParse(value && value.start) && dpParse(value && value.end))
      ? `${value.start} \u2192 ${value.end}`
      : '';

  const rightAnchor = dpAddMonths(anchor, 1);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          height: 40,
          padding: '0 12px',
          background: disabled ? 'var(--bg-subtle)' : 'var(--bg-paper)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border-default)'}`,
          boxShadow: open ? '0 0 0 3px rgba(60,111,245,.14)' : 'none',
          borderRadius: 8,
          textAlign: 'left',
          fontSize: 14,
          color: display ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {display || '\u9009\u62e9\u65e5\u671f\u8303\u56f4'}
        </span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: 560,
          background: 'var(--bg-paper)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-dropdown)',
          zIndex: 50,
          display: 'flex',
        }}>
          <div style={{ flex: 1, borderRight: '1px solid var(--border-subtle)' }}>
            <DPHeader
              anchor={anchor}
              onPrev={() => setAnchor(dpAddMonths(anchor, -1))}
              onNext={() => setAnchor(dpAddMonths(anchor, 1))}
              onPrevYear={() => setAnchor(dpAddMonths(anchor, -12))}
              onNextYear={() => setAnchor(dpAddMonths(anchor, 12))}
            />
            <DPMonth
              anchor={anchor}
              rangeStart={draft.start}
              rangeEnd={draft.end}
              hover={pickingEnd ? hover : null}
              onPick={onPick}
              onHover={setHover}
            />
          </div>
          <div style={{ flex: 1 }}>
            <DPHeader
              anchor={rightAnchor}
              onPrev={() => setAnchor(dpAddMonths(anchor, -1))}
              onNext={() => setAnchor(dpAddMonths(anchor, 1))}
              onPrevYear={() => setAnchor(dpAddMonths(anchor, -12))}
              onNextYear={() => setAnchor(dpAddMonths(anchor, 12))}
            />
            <DPMonth
              anchor={rightAnchor}
              rangeStart={draft.start}
              rangeEnd={draft.end}
              hover={pickingEnd ? hover : null}
              onPick={onPick}
              onHover={setHover}
            />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DatePicker, DateRangePicker });
