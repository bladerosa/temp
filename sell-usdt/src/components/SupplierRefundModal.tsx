import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  IconButton,
  InputBase,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { Check, Copy, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { SellOrderRaw } from '@/data/types';

/**
 * 供应商退款地址 modal
 *
 * Triggered from 待供应商付款 → 供应商退款.
 *
 * Per spec: the refund-address resource and monitoring are activated when an
 * order first enters 待供应商付款 and deactivated when EITHER the order moves
 * to 已完成 OR the refund completes (total received ≥ required across any one
 * network). When refund completes, the order moves to 已取消 carrying whatever
 * cancel reason is recorded at completion time. Backend/race-condition logic
 * lives outside this prototype — this modal just renders the addresses and
 * lets the operator edit the cancel reason at any time.
 */

const CANCEL_REASONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'supplier-stop', label: '供应商无法继续承兑' },
  { key: 'recipient-error', label: '收款信息有误' },
  { key: 'risk-control', label: '风控拦截' },
  { key: 'recon-anomaly', label: '系统对账异常' },
];

const OTHER_KEY = 'other';

type NetworkOption = {
  key: string;
  label: string;
  /** Address prefix used to synthesize a per-record address. */
  prefix: string;
  /** Total chars of the synthesized address (after prefix). */
  bodyLen: number;
  /** Address charset for synthesis. */
  charset: string;
};

const NETWORKS: ReadonlyArray<NetworkOption> = [
  { key: 'trc20', label: 'TRC20 (Tron)',     prefix: 'T',  bodyLen: 33, charset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnopqrstuvwxyz' },
  { key: 'erc20', label: 'ERC20 (Ethereum)', prefix: '0x', bodyLen: 40, charset: '0123456789abcdef' },
  { key: 'bep20', label: 'BEP20 (BSC)',      prefix: '0x', bodyLen: 40, charset: '0123456789abcdef' },
  { key: 'polygon', label: 'Polygon',         prefix: '0x', bodyLen: 40, charset: '0123456789abcdef' },
  { key: 'sol',   label: 'Solana',           prefix: '',   bodyLen: 44, charset: 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789abcdefghijkmnopqrstuvwxyz' },
  { key: 'arb',   label: 'Arbitrum',         prefix: '0x', bodyLen: 40, charset: '0123456789abcdef' },
  { key: 'op',    label: 'Optimism',         prefix: '0x', bodyLen: 40, charset: '0123456789abcdef' },
];

function synthAddress(seed: string, network: NetworkOption): string {
  // Deterministic per (recordId, network) so the same row always shows the
  // same address across opens — fits the spec that the resource is allocated
  // when the order enters 待供应商付款 and survives until deactivated.
  const seedKey = `${network.key}|${seed}`;
  let h = 0;
  for (let i = 0; i < seedKey.length; i++) {
    h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  const body: string[] = [];
  let state = h || 1;
  for (let i = 0; i < network.bodyLen; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    body.push(network.charset[state % network.charset.length]);
  }
  return network.prefix + body.join('');
}

export function SupplierRefundModal({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: SellOrderRaw | null;
  onClose: () => void;
}) {
  const [reasonKey, setReasonKey] = useState<string>(CANCEL_REASONS[0]!.key);
  const [otherReason, setOtherReason] = useState('');
  const [activeNetwork, setActiveNetwork] = useState<string>(NETWORKS[0]!.key);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reset transient state when the modal is opened for a different row.
  useEffect(() => {
    if (open) {
      setReasonKey(CANCEL_REASONS[0]!.key);
      setOtherReason('');
      setActiveNetwork(NETWORKS[0]!.key);
      setCopiedKey(null);
    }
  }, [open, row?.recordId]);

  const network = useMemo(
    () => NETWORKS.find((n) => n.key === activeNetwork) ?? NETWORKS[0]!,
    [activeNetwork],
  );

  const address = useMemo(
    () => (row ? synthAddress(row.recordId, network) : ''),
    [row, network],
  );

  if (!row) return null;

  const required = row.cwalletAmt ?? '—';
  // Prototype: monitoring is real on the backend; here we display 0.
  const received = '0 USDT';

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px 12px',
        }}
      >
        <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>供应商退款地址</Box>
        <IconButton onClick={onClose} sx={{ width: 32, height: 32, color: 'grey.600', borderRadius: 1.5 }}>
          <X size={20} />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: '4px 24px 8px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxHeight: '76vh',
          overflowY: 'auto',
        }}
      >
        {/* 取消原因 */}
        <Section title="取消原因">
          <Stack sx={{ gap: 1 }}>
            {CANCEL_REASONS.map((r) => (
              <RadioRow
                key={r.key}
                label={r.label}
                checked={reasonKey === r.key}
                onSelect={() => setReasonKey(r.key)}
              />
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <RadioRow
                label="其他"
                checked={reasonKey === OTHER_KEY}
                onSelect={() => setReasonKey(OTHER_KEY)}
                inline
              />
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  height: 36,
                  border: '1px solid',
                  borderColor: reasonKey === OTHER_KEY ? 'divider' : 'transparent',
                  borderRadius: 2,
                  px: 3,
                  bgcolor: reasonKey === OTHER_KEY ? 'background.paper' : 'grey.100',
                  transition: 'border-color 120ms, background 120ms',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 3px rgba(60,111,245,0.12)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="请输入其他原因"
                  value={otherReason}
                  onFocus={() => setReasonKey(OTHER_KEY)}
                  onChange={(e) => setOtherReason(e.target.value)}
                  disabled={reasonKey !== OTHER_KEY}
                  sx={{ fontSize: 13, color: 'text.primary' }}
                />
              </Box>
            </Box>
          </Stack>
        </Section>

        {/* 退款地址 */}
        <Section title="退款地址">
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {NETWORKS.map((n) => {
              const active = n.key === activeNetwork;
              return (
                <Box
                  key={n.key}
                  onClick={() => setActiveNetwork(n.key)}
                  sx={{
                    px: 3,
                    height: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 13,
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    color: active ? 'primary.main' : 'grey.700',
                    fontWeight: active ? 600 : 400,
                    bgcolor: active ? 'rgba(60,111,245,0.08)' : 'grey.100',
                    transition: 'background 120ms, color 120ms',
                    '&:hover': {
                      bgcolor: active ? 'rgba(60,111,245,0.12)' : 'grey.200',
                    },
                  }}
                >
                  {n.label}
                </Box>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={4} sx={{ alignItems: 'center', mt: 2 }}>
            <Box
              sx={{
                width: 144,
                height: 144,
                p: '8px',
                bgcolor: '#FFFFFF',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <QRCode value={address} size={128} style={{ width: '100%', height: '100%' }} />
            </Box>
            <Stack sx={{ flex: 1, gap: 1.5, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, color: 'grey.600' }}>{network.label} 退款地址</Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  minWidth: 0,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    flex: 1,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
                    fontSize: 12,
                    color: 'text.primary',
                    wordBreak: 'break-all',
                  }}
                >
                  {address}
                </Box>
                <IconButton
                  onClick={() => copy(address, 'addr')}
                  sx={{ width: 28, height: 28, color: copiedKey === 'addr' ? 'success.dark' : 'grey.600' }}
                  aria-label="复制"
                >
                  {copiedKey === 'addr' ? <Check size={16} /> : <Copy size={16} />}
                </IconButton>
              </Box>
              <Typography sx={{ fontSize: 12, color: 'grey.500' }}>
                请使用 {network.label} 网络发送 USDT 到上述地址，单笔/多笔到账金额满足需收款数量即视为退款完成。
              </Typography>
            </Stack>
          </Stack>
        </Section>

        {/* 收款进度 */}
        <Section title="收款进度">
          <ProgressRow k="需收款数量" v={required} bold />
          <ProgressRow k="供应商已支付数量" v={received} />
        </Section>
      </Box>

      <Box sx={{ height: 16 }} />
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: '16px 18px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{title}</Typography>
      {children}
    </Box>
  );
}

function RadioRow({
  label,
  checked,
  onSelect,
  inline,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  inline?: boolean;
}) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: inline ? undefined : 0,
        py: 0.5,
      }}
    >
      <Radio
        checked={checked}
        size="small"
        sx={{ p: 0.5, color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }}
      />
      <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{label}</Typography>
    </Box>
  );
}

function ProgressRow({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <Box component="span" sx={{ color: 'grey.600', fontSize: 13 }}>
        {k}
      </Box>
      <Box
        component="span"
        sx={{
          color: 'text.primary',
          fontSize: bold ? 15 : 13,
          fontWeight: bold ? 700 : 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {v}
      </Box>
    </Box>
  );
}
