import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  InputBase,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { AlertTriangle, Check, Copy, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { copyToClipboard } from '@/utils/clipboard';
import type { SellOrderRaw } from '@/data/types';

type BoundTx = { txid: string; amount: number };

/** Parse "97,000 USDT" → 97000. */
function parseRequiredAmount(s: string): number {
  return Number(s.replace(/[^\d.]/g, '')) || 0;
}

function fmtUsdtAmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' USDT';
}

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

export const SupplierRefundModal = observer(function SupplierRefundModal({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: SellOrderRaw | null;
  onClose: () => void;
}) {
  const { hotWallet } = useStores();
  const [reasonKey, setReasonKey] = useState<string>(CANCEL_REASONS[0]!.key);
  const [otherReason, setOtherReason] = useState('');
  const [activeNetwork, setActiveNetwork] = useState<string>(NETWORKS[0]!.key);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [bound, setBound] = useState<BoundTx[]>([]);
  const [txInput, setTxInput] = useState('');
  const [bindError, setBindError] = useState('');

  // Reset transient state + re-hydrate bound list from the store whenever
  // the modal opens for a (possibly different) row.
  useEffect(() => {
    if (open && row) {
      setReasonKey(CANCEL_REASONS[0]!.key);
      setOtherReason('');
      setActiveNetwork(NETWORKS[0]!.key);
      setCopiedKey(null);
      setTxInput('');
      setBindError('');
      const existing = hotWallet
        .listBoundForOrder(row.recordId)
        .map((r) => ({ txid: r.txid, amount: r.amount }));
      setBound(existing);
    }
  }, [open, row, hotWallet]);

  const network = useMemo(
    () => NETWORKS.find((n) => n.key === activeNetwork) ?? NETWORKS[0]!,
    [activeNetwork],
  );

  const address = useMemo(
    () => (row ? synthAddress(row.recordId, network) : ''),
    [row, network],
  );

  const requiredNum = row ? parseRequiredAmount(row.cwalletAmt ?? '0') : 0;
  const receivedNum = useMemo(() => bound.reduce((sum, b) => sum + b.amount, 0), [bound]);
  const isComplete = requiredNum > 0 && receivedNum >= requiredNum;

  if (!row) return null;

  const requiredDisplay = row.cwalletAmt ?? '—';
  const receivedDisplay = fmtUsdtAmt(receivedNum);

  const copy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    }
  };

  const submitBind = () => {
    if (isComplete) return;
    const t = txInput.trim();
    if (!t) {
      setBindError('请输入 TxID');
      return;
    }
    if (bound.some((b) => b.txid === t)) {
      setBindError('该 TxID 已绑定');
      return;
    }
    const result = hotWallet.bindAsSupplierRefund(t, row!.recordId);
    if (!result.ok) {
      setBindError(
        result.reason === 'not-found'
          ? '未在热钱包入账流水中找到该 TxID'
          : result.reason === 'wrong-account'
            ? '该 TxID 不是入账流水'
            : result.reason === 'already-bound-other'
              ? '该 TxID 已绑定到其他订单'
              : '该 TxID 已被标记了，无法绑定',
      );
      return;
    }
    // Use the resolved (full) txid from the matched record, not the user's
    // typed string — so 解绑 looks up by the same canonical value.
    if (bound.some((b) => b.txid === result.record.txid)) {
      setBindError('该 TxID 已绑定');
      return;
    }
    setBound([...bound, { txid: result.record.txid, amount: result.record.amount }]);
    setTxInput('');
    setBindError('');
  };

  const unbind = (txid: string) => {
    hotWallet.unbindSupplierRefund(txid);
    setBound(bound.filter((b) => b.txid !== txid));
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
        {/* 拒绝原因 */}
        <Section title="拒绝原因">
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

        {/* 热钱包入账流水绑定 */}
        <Section
          title="热钱包入账流水绑定"
          trailing={
            <Box
              component="a"
              href="/dashboard/hot-wallet/assets"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: 13,
                color: 'primary.main',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              打开热钱包入账列表
            </Box>
          }
        >
          {isComplete && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: '10px 12px',
                borderRadius: 1.5,
                bgcolor: 'rgba(231,178,43,0.10)',
                border: '1px solid',
                borderColor: 'rgba(231,178,43,0.32)',
              }}
            >
              <Box sx={{ display: 'inline-flex', color: 'warning.dark', mt: '2px', flexShrink: 0 }}>
                <AlertTriangle size={14} strokeWidth={2} />
              </Box>
              <Box sx={{ fontSize: 12, lineHeight: '18px', color: 'warning.darker', fontWeight: 500 }}>
                已绑定金额已满足需收款数量，订单将流转至 已拒绝 状态。
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 36,
                  border: '1px solid',
                  borderColor: bindError ? 'error.main' : 'divider',
                  borderRadius: 1.5,
                  px: 3,
                  bgcolor: isComplete ? 'grey.100' : 'background.paper',
                  transition: 'border-color 120ms, box-shadow 120ms',
                  '&:focus-within': {
                    borderColor: bindError ? 'error.main' : 'primary.main',
                    boxShadow: bindError
                      ? '0 0 0 3px rgba(236,104,76,0.16)'
                      : '0 0 0 3px rgba(60,111,245,0.12)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="输入热钱包入账 TxID"
                  value={txInput}
                  disabled={isComplete}
                  onChange={(e) => {
                    setTxInput(e.target.value);
                    if (bindError) setBindError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitBind();
                    }
                  }}
                  sx={{ fontSize: 13, color: 'text.primary' }}
                />
              </Box>
              {bindError && (
                <Box sx={{ fontSize: 12, color: 'error.main' }}>{bindError}</Box>
              )}
            </Box>
            <Button
              variant="contained"
              disabled={isComplete}
              onClick={submitBind}
              sx={{
                height: 36,
                minHeight: 36,
                px: 3,
                fontSize: 13,
                '&.Mui-disabled': { bgcolor: 'grey.200', color: 'grey.400' },
              }}
            >
              提交
            </Button>
          </Box>

          {bound.length === 0 ? (
            <Box
              sx={{
                py: 3,
                textAlign: 'center',
                color: 'grey.500',
                fontSize: 12,
                bgcolor: 'grey.100',
                borderRadius: 1.5,
              }}
            >
              暂无绑定流水
            </Box>
          ) : (
            <Stack sx={{ gap: 1 }}>
              <Box sx={{ fontSize: 12, color: 'grey.600' }}>
                已绑定 {bound.length} 笔流水
              </Box>
              <Stack sx={{ gap: 1 }}>
                {bound.map((b) => (
                  <Box
                    key={b.txid}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 3,
                      py: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1.5,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
                        fontSize: 12,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={b.txid}
                    >
                      {b.txid}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                      }}
                    >
                      {fmtUsdtAmt(b.amount)}
                    </Box>
                    <Box
                      component="button"
                      onClick={() => unbind(b.txid)}
                      sx={{
                        flexShrink: 0,
                        fontFamily: 'inherit',
                        fontSize: 12,
                        fontWeight: 500,
                        height: 26,
                        px: 2,
                        border: 0,
                        borderRadius: 1,
                        bgcolor: 'transparent',
                        color: 'error.dark',
                        cursor: 'pointer',
                        transition: 'background 120ms',
                        '&:hover': { bgcolor: 'rgba(236,104,76,0.08)' },
                      }}
                    >
                      解绑
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Section>

        {/* 收款进度 */}
        <Section title="收款进度">
          <ProgressRow k="需收款数量" v={requiredDisplay} bold />
          <ProgressRow
            k="供应商已支付数量"
            v={receivedDisplay}
            valueColor={isComplete ? 'success.dark' : undefined}
          />
        </Section>
      </Box>

      <Box sx={{ height: 16 }} />
    </Dialog>
  );
});

function Section({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{title}</Typography>
        {trailing}
      </Box>
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

function ProgressRow({
  k,
  v,
  bold,
  valueColor,
}: {
  k: string;
  v: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <Box component="span" sx={{ color: 'grey.600', fontSize: 13 }}>
        {k}
      </Box>
      <Box
        component="span"
        sx={{
          color: valueColor ?? 'text.primary',
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
