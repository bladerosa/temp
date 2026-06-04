import { Box } from '@mui/material';
import { useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, length = 6, autoFocus = false }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  const setAt = (i: number, ch: string) => {
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join(''));
  };

  const handleChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 1);
    setAt(i, raw);
    if (raw && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const txt = (e.clipboardData.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, length);
    const next = chars.slice();
    [...txt].forEach((ch, idx) => {
      next[idx] = ch;
    });
    onChange(next.join(''));
    const focusIdx = Math.min(txt.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <Box sx={{ display: 'flex', gap: '10px' }}>
      {chars.map((ch, i) => (
        <Box
          key={i}
          component="input"
          ref={(el: HTMLInputElement | null) => {
            refs.current[i] = el;
          }}
          autoFocus={autoFocus && i === 0}
          value={ch}
          onChange={handleChange(i)}
          onKeyDown={handleKey(i)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          sx={{
            width: 52,
            height: 56,
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 600,
            border: '1px solid',
            borderColor: ch ? 'grey.300' : 'divider',
            borderRadius: '12px',
            background: '#fff',
            color: 'text.primary',
            outline: 'none',
            transition: 'border-color .15s, box-shadow .15s',
            fontFamily: 'inherit',
            '&:hover': { borderColor: 'grey.300' },
            '&:focus': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 4px rgba(60,111,245,0.12)',
            },
          }}
        />
      ))}
    </Box>
  );
}
