import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { ModalShell } from '@/components/ModalShell';
import { modalInputSx, modalGhostSx } from './modalStyles';
import { useStores } from '@/stores';
import { MAX_WHITELIST, type WebhookKind } from '@/stores/OnboardingStore';
import { DOC_URLS } from '@/data/guide';

interface WhitelistModalProps {
  kind: WebhookKind;
  open: boolean;
  onClose: () => void;
}

/* notifyUrl whitelist manager: entries normalize to root domains, first entry
   mirrors the outer webhook URL (locked), max 10, edit/delete on the rest. */
export const WhitelistModal = observer(function WhitelistModal({ kind, open, onClose }: WhitelistModalProps) {
  const { onboarding } = useStores();
  const [input, setInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [flash, setFlash] = useState('');
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setInput('');
      setEditingIndex(null);
      setFlash('');
    }
  }, [open]);

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  const showFlash = (msg: string) => {
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(''), 1800);
  };

  const all = onboarding.whitelist(kind);
  const atMax = all.length >= MAX_WHITELIST;
  const apiName = kind === 'withdraw' ? 'Withdrawal' : 'Deposit';

  const addDomain = () => {
    if (!input.trim()) return;
    const err = onboarding.addWhitelistDomain(kind, input);
    setInput('');
    if (err) showFlash(err);
  };

  const saveEdit = (index: number) => {
    const err = onboarding.editWhitelistDomain(kind, index, editValue);
    if (err) {
      showFlash(err);
      return;
    }
    setEditingIndex(null);
  };

  return (
    <ModalShell open={open} onClose={onClose} title="notifyUrl Whitelist">
      <Box component="p" sx={{ fontSize: 17, lineHeight: 1.5, color: 'text.primary', m: 0 }}>
        You can pass a{' '}
        <Box
          component="a"
          href={DOC_URLS.notifyUrlWebhook}
          target="_blank"
          rel="noopener"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
            fontSize: 15,
            fontWeight: 700,
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
            p: '2px 10px',
            borderRadius: '8px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background 120ms ease-out, color 120ms ease-out',
            verticalAlign: 'middle',
            '&:hover': { bgcolor: 'primary.main', color: '#fff' },
          }}
        >
          notifyUrl
          <ArrowUpRight size={12} strokeWidth={2.4} />
        </Box>{' '}
        parameter in the {apiName} API to receive the webhook at a different URL for that single request — as long as
        its domain is on this whitelist. Any value you add is normalized to its <strong>root domain</strong>. Up to{' '}
        <strong>10</strong> domains are supported.
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mt: 6 }}>
        <Box
          component="input"
          type="text"
          value={input}
          disabled={atMax}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') addDomain();
          }}
          placeholder={atMax ? 'Whitelist is full (10 / 10)' : 'Enter a webhook URL root domain, e.g. abc.com'}
          sx={{ ...modalInputSx, flex: 1 }}
        />
        <Box
          component="button"
          onClick={addDomain}
          disabled={atMax}
          sx={{
            ...modalGhostSx,
            px: '30px',
            flexShrink: 0,
            '&:disabled': { opacity: 0.45, cursor: 'not-allowed' },
          }}
        >
          Add
        </Box>
      </Box>

      {flash && (
        <Box sx={{ mt: '10px', fontSize: 14, color: 'warning.darker' }}>{flash}</Box>
      )}

      <Box sx={{ mt: 5, fontSize: 14, fontWeight: 600, color: 'text.secondary' }}>
        {all.length} / {MAX_WHITELIST} domains
      </Box>

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: '12px 0 0',
          p: 0,
          maxHeight: 320,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
        }}
      >
        {all.map((domain, i) => {
          const locked = i === 0;
          const editing = editingIndex === i;
          return (
            <Box
              component="li"
              key={`${domain}-${i}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                height: 60,
                px: editing ? '12px 0 18px' : '18px',
                pl: '18px',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              {editing ? (
                <>
                  <Box
                    component="input"
                    autoFocus
                    value={editValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') saveEdit(i);
                    }}
                    sx={{ ...modalInputSx, height: 44, flex: 1, fontSize: 16, px: '14px' }}
                  />
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box
                      component="button"
                      onClick={() => saveEdit(i)}
                      sx={{
                        height: 40,
                        px: '18px',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 15,
                        fontWeight: 700,
                        border: 'none',
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      Save
                    </Box>
                    <Box
                      component="button"
                      onClick={() => setEditingIndex(null)}
                      sx={{
                        height: 40,
                        px: '18px',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 15,
                        fontWeight: 700,
                        border: 'none',
                        bgcolor: 'grey.100',
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'grey.200' },
                      }}
                    >
                      Cancel
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ fontSize: 17, fontWeight: 600, color: 'text.primary' }}>{domain}</Box>
                  {locked && (
                    <Box
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'text.secondary',
                        bgcolor: 'grey.100',
                        p: '3px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      Default
                    </Box>
                  )}
                  {!locked && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ButtonBase
                        title="Edit"
                        onClick={() => {
                          setEditingIndex(i);
                          setEditValue(domain);
                        }}
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          color: 'grey.600',
                          '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
                        }}
                      >
                        <Pencil size={18} strokeWidth={1.8} />
                      </ButtonBase>
                      <ButtonBase
                        title="Delete"
                        onClick={() => onboarding.removeWhitelistDomain(kind, i)}
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          color: 'grey.600',
                          '&:hover': { bgcolor: 'grey.100', color: 'error.main' },
                        }}
                      >
                        <Trash2 size={18} strokeWidth={1.8} />
                      </ButtonBase>
                    </Box>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </ModalShell>
  );
});
