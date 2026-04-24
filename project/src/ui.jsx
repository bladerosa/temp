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
        <label style={uiStyles.label}>
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {hint && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>{hint}</div>}
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
      background: disabled ? '#F6F7FB' : '#fff',
      border: `1px solid ${focus ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 8,
      boxShadow: focus ? '0 0 0 3px rgba(79,91,213,.12)' : 'none',
      transition: 'border-color .15s, box-shadow .15s',
      height: 40,
    }}>
      {prefix && <div style={{ paddingLeft: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>{prefix}</div>}
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
          color: 'var(--text)',
          minWidth: 0,
        }}
      />
      {maxLength != null && (
        <div style={{ paddingRight: 12, fontSize: 12, color: 'var(--text-3)' }}>
          {(value || '').length}/{maxLength}
        </div>
      )}
      {suffix && <div style={{ paddingRight: 12, color: 'var(--text-3)' }}>{suffix}</div>}
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
          background: disabled ? '#F6F7FB' : '#fff',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          boxShadow: open ? '0 0 0 3px rgba(79,91,213,.12)' : 'none',
          borderRadius: 8,
          textAlign: 'left',
          fontSize: 14,
          color: selected ? 'var(--text)' : 'var(--text-3)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          position: 'relative',
          transition: 'border-color .15s, box-shadow .15s',
        }}
      >
        {selected ? selected.label : (placeholder || '请选择')}
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, color: 'var(--text-3)', transition: 'transform .15s' }}>
          <IconChevronDown size={16} />
        </div>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 30,
          maxHeight: 260,
          overflowY: 'auto',
          padding: 4,
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer',
                background: opt.value === value ? 'var(--primary-soft)' : 'transparent',
                color: opt.value === value ? 'var(--primary)' : 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background .12s',
              }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = '#F6F7FB'; }}
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
    md: { height: 40, padding: '0 16px', fontSize: 14 },
    lg: { height: 44, padding: '0 20px', fontSize: 14 },
  };
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' },
    secondary: { background: '#fff', color: 'var(--text)', border: '1px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--text-2)', border: '1px solid transparent' },
    danger: { background: '#fff', color: 'var(--danger)', border: '1px solid #F7C8C9' },
  };
  const s = sizes[size];
  const v = variants[variant];
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
        ...v,
        borderRadius: 8,
        fontFamily: 'inherit',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : (hover ? 0.92 : 1),
        transform: hover && !disabled ? 'translateY(-0.5px)' : 'none',
        transition: 'opacity .12s, transform .12s, box-shadow .12s',
        boxShadow: variant === 'primary' && hover && !disabled ? '0 4px 12px rgba(79,91,213,.24)' : 'var(--shadow-sm)',
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
      color: 'var(--text)',
      userSelect: 'none',
    }}>
      <span style={{
        width: 16, height: 16, borderRadius: '50%',
        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color .12s',
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
      color: 'var(--text)',
      userSelect: 'none',
    }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: checked ? 'var(--primary)' : '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        transition: 'background .12s, border-color .12s',
      }}>
        {checked && <IconCheck size={12} strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={e => onChange && onChange(e.target.checked)} style={{ display: 'none' }} disabled={disabled} />
      {children}
    </label>
  );
}

function Switch({ checked, onChange, size = 'md' }) {
  const w = size === 'sm' ? 32 : 40;
  const h = size === 'sm' ? 18 : 22;
  const d = h - 4;
  return (
    <button
      type="button"
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: w, height: h,
        background: checked ? 'var(--primary)' : '#D6DAE2',
        borderRadius: h,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        padding: 0,
        transition: 'background .15s',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: checked ? w - d - 2 : 2,
        width: d, height: d,
        background: '#fff',
        borderRadius: '50%',
        transition: 'left .15s',
        boxShadow: '0 1px 3px rgba(0,0,0,.16)',
      }} />
    </button>
  );
}

function Card({ children, style, padding = 20 }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding,
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>{children}</div>
  );
}

function Tag({ children, color = 'neutral' }) {
  const palette = {
    neutral: { bg: '#F2F3F7', fg: 'var(--text-2)' },
    success: { bg: '#E8F6EF', fg: '#0E8A57' },
    warn: { bg: '#FEF4E1', fg: '#B57417' },
    primary: { bg: 'var(--primary-soft)', fg: 'var(--primary)' },
    danger: { bg: '#FDECEC', fg: 'var(--danger)' },
  }[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4,
      background: palette.bg, color: palette.fg,
      fontSize: 12, fontWeight: 500,
    }}>{children}</span>
  );
}

// simple date picker using native input for prototype
function DateInput({ value, onChange, placeholder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid var(--border)',
      borderRadius: 8, height: 40, background: '#fff',
      padding: '0 10px', gap: 8, flex: 1,
    }}>
      <IconCalendar size={14} stroke="var(--text-3)" />
      <input
        type="date"
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', flex: 1, background: 'transparent', color: 'var(--text)' }}
        placeholder={placeholder}
      />
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, min, suffix, step }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid var(--border)',
      borderRadius: 8, height: 40, background: '#fff',
      padding: '0 12px', flex: 1, minWidth: 0,
    }}>
      <input
        type="number"
        value={value ?? ''}
        min={min}
        step={step}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', flex: 1, background: 'transparent', color: 'var(--text)', minWidth: 0, width: '100%' }}
        placeholder={placeholder}
      />
      {suffix && <span style={{ color: 'var(--text-3)', fontSize: 13, marginLeft: 4, whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  );
}

Object.assign(window, {
  Field, TextInput, Select, Button, Radio, Checkbox, Switch, Card, Tag, DateInput, NumberInput
});
