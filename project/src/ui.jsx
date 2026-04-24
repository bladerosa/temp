// Base UI primitives
const { useState, useRef, useEffect, useMemo, useCallback } = React;

const uiStyles = {
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-2)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 40,
    padding: '0 12px',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color .15s, box-shadow .15s',
  },
  inputFocus: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 3px rgba(79,91,213,.12)',
  },
};

function Field({ label, required, hint, children, style }) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          marginBottom: 6,
        }}>
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {hint && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>{hint}</div>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, maxLength, type = 'text', prefix, suffix, disabled }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      background: disabled ? 'var(--bg-subtle)' : 'var(--bg-paper)',
      border: `1px solid ${focus ? 'var(--primary)' : 'var(--border-default)'}`,
      borderRadius: 8,
      boxShadow: focus ? '0 0 0 3px rgba(60,111,245,.14)' : 'none',
      transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
      height: 40,
    }}>
      {prefix && <div style={{ paddingLeft: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{prefix}</div>}
      <input
        value={value || ''}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          height: '100%',
          padding: prefix ? '0 12px 0 8px' : '0 12px',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--text-primary)',
          minWidth: 0,
        }}
      />
      {maxLength != null && (
        <div style={{ paddingRight: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          {(value || '').length}/{maxLength}
        </div>
      )}
      {suffix && <div style={{ paddingRight: 12, color: 'var(--text-secondary)' }}>{suffix}</div>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, disabled, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = options.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative', width: width || '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          height: 40,
          padding: '0 36px 0 12px',
          background: disabled ? 'var(--bg-subtle)' : 'var(--bg-paper)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border-default)'}`,
          boxShadow: open ? '0 0 0 3px rgba(60,111,245,.14)' : 'none',
          borderRadius: 8,
          textAlign: 'left',
          fontSize: 14,
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          position: 'relative',
          transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
        }}
      >
        {selected ? selected.label : (placeholder || '请选择')}
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, color: 'var(--text-secondary)', transition: 'transform .15s' }}>
          <IconChevronDown size={16} />
        </div>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-paper)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-dropdown)',
          zIndex: 30,
          maxHeight: 260,
          overflowY: 'auto',
          padding: 6,
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '9px 10px',
                borderRadius: 8,
                fontSize: 13.5,
                cursor: 'pointer',
                background: opt.value === value ? 'var(--primary-lighter)' : 'transparent',
                color: opt.value === value ? 'var(--primary-dark)' : 'var(--text-primary)',
                fontWeight: opt.value === value ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 120ms ease-out',
              }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
              onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <IconCheck size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Button({ variant = 'primary', size = 'md', icon, children, onClick, disabled, style, type = 'button' }) {
  const sizes = {
    sm: { height: 32, padding: '0 12px', fontSize: 13 },
    md: { height: 40, padding: '0 18px', fontSize: 14 },
    lg: { height: 44, padding: '0 22px', fontSize: 14 },
  };
  const variants = {
    primary: {
      background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)',
      shadow: 'var(--shadow-primary)',
      hoverBg: 'var(--primary-dark)',
    },
    secondary: {
      background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-default)',
      shadow: 'var(--shadow-z1)',
      hoverBg: 'var(--bg-subtle)',
    },
    soft: {
      background: 'var(--primary-lighter)', color: 'var(--primary-dark)', border: '1px solid transparent',
      shadow: 'none',
      hoverBg: '#C4D8FC',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent',
      shadow: 'none',
      hoverBg: 'var(--bg-subtle)',
    },
    danger: {
      background: '#fff', color: 'var(--error)', border: '1px solid var(--error-light)',
      shadow: 'var(--shadow-z1)',
      hoverBg: 'var(--error-lighter)',
    },
  };
  const s = sizes[size];
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...s,
        background: hover && !disabled ? v.hoverBg : v.background,
        color: v.color,
        border: v.border,
        borderRadius: 8,
        fontFamily: 'inherit',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        transition: 'background 120ms ease-out, box-shadow 120ms ease-out, color 120ms ease-out',
        boxShadow: disabled ? 'none' : v.shadow,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Radio({ checked, onChange, children, disabled }) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 14,
      color: 'var(--text-primary)',
      userSelect: 'none',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--grey-500)'}`,
        background: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 120ms ease-out',
      }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }} disabled={disabled} />
      {children}
    </label>
  );
}

function Checkbox({ checked, onChange, children, disabled }) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 14,
      color: 'var(--text-primary)',
      userSelect: 'none',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 4,
        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--grey-500)'}`,
        background: checked ? 'var(--primary)' : '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        transition: 'background 120ms ease-out, border-color 120ms ease-out',
      }}>
        {checked && <IconCheck size={13} strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={e => onChange && onChange(e.target.checked)} style={{ display: 'none' }} disabled={disabled} />
      {children}
    </label>
  );
}

function Switch({ checked, onChange, size = 'md' }) {
  // md matches CCPayment spec (34×20 with 16px thumb)
  const w = size === 'sm' ? 30 : 34;
  const h = size === 'sm' ? 18 : 20;
  const d = h - 4;
  return (
    <button
      type="button"
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: w, height: h,
        background: checked ? 'var(--primary)' : 'var(--grey-400)',
        borderRadius: h,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        padding: 0,
        transition: 'background 120ms ease-out',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: checked ? w - d - 2 : 2,
        width: d, height: d,
        background: '#fff',
        borderRadius: '50%',
        transition: 'left 160ms ease-out',
        boxShadow: '0 1px 3px rgba(0,0,0,.16)',
      }} />
    </button>
  );
}

function Card({ children, style, padding = 24 }) {
  return (
    <div style={{
      background: 'var(--bg-paper)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding,
      boxShadow: 'var(--shadow-card)',
      ...style,
    }}>{children}</div>
  );
}

function Tag({ children, color = 'neutral', dot = true }) {
  const palette = {
    neutral: { bg: 'var(--grey-200)',       fg: 'var(--grey-800)',       dotC: 'var(--grey-600)' },
    success: { bg: 'var(--success-lighter)', fg: 'var(--success-darker)', dotC: 'var(--success)' },
    warn:    { bg: 'var(--warning-lighter)', fg: 'var(--warning-darker)', dotC: 'var(--warning)' },
    info:    { bg: 'var(--info-lighter)',    fg: 'var(--info-darker)',    dotC: 'var(--info)' },
    primary: { bg: 'var(--primary-lighter)', fg: 'var(--primary-darker)', dotC: 'var(--primary)' },
    danger:  { bg: 'var(--error-lighter)',   fg: 'var(--error-darker)',   dotC: 'var(--error)' },
  }[color] || { bg: 'var(--grey-200)', fg: 'var(--grey-800)', dotC: 'var(--grey-600)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 9999,
      background: palette.bg, color: palette.fg,
      fontSize: 11.5, fontWeight: 600, lineHeight: 1.2,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.dotC }} />}
      {children}
    </span>
  );
}

// simple date picker using native input for prototype
function DateInput({ value, onChange, placeholder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid var(--border-default)',
      borderRadius: 8, height: 40, background: 'var(--bg-paper)',
      padding: '0 10px', gap: 8, flex: 1,
    }}>
      <IconCalendar size={14} stroke="var(--text-secondary)" />
      <input
        type="date"
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', flex: 1, background: 'transparent', color: 'var(--text-primary)' }}
        placeholder={placeholder}
      />
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, min, suffix, step }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid var(--border-default)',
      borderRadius: 8, height: 40, background: 'var(--bg-paper)',
      padding: '0 12px', flex: 1, minWidth: 0,
    }}>
      <input
        type="number"
        value={value ?? ''}
        min={min}
        step={step}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', flex: 1, background: 'transparent', color: 'var(--text-primary)', minWidth: 0, width: '100%' }}
        placeholder={placeholder}
      />
      {suffix && <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 4, whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  );
}

Object.assign(window, {
  Field, TextInput, Select, Button, Radio, Checkbox, Switch, Card, Tag, DateInput, NumberInput
});
