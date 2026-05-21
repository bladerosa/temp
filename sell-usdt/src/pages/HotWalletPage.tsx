import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Check,
  Copy,
  FilePlus2,
  type LucideIcon,
  ListChecks,
  Search,
  Wallet,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { copyToClipboard } from '@/utils/clipboard';
import type { HotWalletCategory, HotWalletRecord } from '@/data/types';

type SubTab = 'all' | 'out' | 'in';

const SUB_TABS: Array<{ key: SubTab; label: string; Icon: LucideIcon }> = [
  { key: 'all', label: '所有账目', Icon: ArrowLeftRight },
  { key: 'out', label: '热钱包出账', Icon: ArrowUpFromLine },
  { key: 'in',  label: '热钱包入账', Icon: ArrowDownToLine },
];

const CURRENCY_OPTIONS = ['', 'USDT', 'TRX', 'ETH'];
const NETWORK_OPTIONS = ['', 'TRON', 'Polygon', 'BSC', 'ERC20', 'Arbitrum', 'Optimism', 'Solana'];
const TYPE_OPTIONS: Array<{ value: '' | HotWalletCategory; label: string }> = [
  { value: '',         label: '所有类型' },
  { value: '借入',     label: '借入' },
  { value: '供应商退款', label: '供应商退款' },
  { value: '其他',     label: '其他' },
];

export const HotWalletPage = observer(function HotWalletPage() {
  const { hotWallet } = useStores();
  const [tab, setTab] = useState<SubTab>('in');
  const [typeFilter, setTypeFilter] = useState<'' | HotWalletCategory>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [networkFilter, setNetworkFilter] = useState<string>('');
  const [txidDraft, setTxidDraft] = useState('');
  const [idDraft, setIdDraft] = useState('');
  const [txidQuery, setTxidQuery] = useState('');
  const [idQuery, setIdQuery] = useState('');
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return hotWallet.records.filter((r) => {
      if (tab === 'in' && r.accountType !== '入账') return false;
      if (tab === 'out' && r.accountType !== '出账') return false;
      if (typeFilter && r.category !== typeFilter) return false;
      if (currencyFilter && r.currency !== currencyFilter) return false;
      if (networkFilter && r.network !== networkFilter) return false;
      if (txidQuery && !r.txid.toLowerCase().includes(txidQuery.toLowerCase())) return false;
      if (idQuery && !String(r.id).includes(idQuery)) return false;
      return true;
    });
  }, [hotWallet.records, tab, typeFilter, currencyFilter, networkFilter, txidQuery, idQuery]);

  const runSearch = () => {
    setTxidQuery(txidDraft.trim());
    setIdQuery(idDraft.trim());
  };

  const copyTxid = async (txid: string) => {
    const ok = await copyToClipboard(txid);
    if (ok) {
      setCopiedTxid(txid);
      window.setTimeout(() => setCopiedTxid((c) => (c === txid ? null : c)), 1500);
    }
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          mt: 2,
          mb: 5,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          component="h1"
          sx={{ fontSize: 22, lineHeight: 1.3, fontWeight: 700, color: 'text.primary' }}
        >
          热钱包资产管理
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FilePlus2 size={16} strokeWidth={2} />}
            sx={{ height: 36, px: 4, fontSize: 13.5 }}
          >
            申请提现
          </Button>
          <Button
            variant="contained"
            startIcon={<ListChecks size={16} strokeWidth={2} />}
            sx={{ height: 36, px: 4, fontSize: 13.5 }}
          >
            出账申请记录
          </Button>
          <Button
            variant="contained"
            startIcon={<Wallet size={16} strokeWidth={2} />}
            sx={{ height: 36, px: 4, fontSize: 13.5 }}
          >
            热钱包管理
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Sub-tabs */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 6,
            pt: 5,
            pb: 0,
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          <Stack direction="row" spacing={2}>
            {SUB_TABS.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <Box
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    height: 36,
                    px: 4,
                    borderRadius: 2,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    color: active ? 'primary.main' : 'grey.700',
                    bgcolor: active ? 'rgba(60,111,245,0.08)' : 'grey.100',
                    transition: 'background 120ms, color 120ms',
                    '&:hover': {
                      bgcolor: active ? 'rgba(60,111,245,0.12)' : 'grey.200',
                    },
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{label}</span>
                </Box>
              );
            })}
          </Stack>
          <Box
            component="a"
            sx={{
              fontSize: 13,
              color: 'primary.main',
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            展开统计图
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ px: 6, py: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Stack
            direction="row"
            spacing={3}
            sx={{ flexWrap: 'wrap', rowGap: 2, alignItems: 'flex-end' }}
          >
            <FilterField label="交易类型">
              <Select
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as '' | HotWalletCategory)}
                sx={{ width: 180, height: 40, fontSize: 14 }}
              >
                {TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FilterField>
            <FilterField label="代币">
              <Select
                size="small"
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                sx={{ width: 180, height: 40, fontSize: 14 }}
              >
                {CURRENCY_OPTIONS.map((v) => (
                  <MenuItem key={v || 'all'} value={v}>
                    {v || '所有代币'}
                  </MenuItem>
                ))}
              </Select>
            </FilterField>
            <FilterField label="网络">
              <Select
                size="small"
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                sx={{ width: 180, height: 40, fontSize: 14 }}
              >
                {NETWORK_OPTIONS.map((v) => (
                  <MenuItem key={v || 'all'} value={v}>
                    {v || '所有网络'}
                  </MenuItem>
                ))}
              </Select>
            </FilterField>
            <PlainInput placeholder="Txid" value={txidDraft} onChange={setTxidDraft} icon />
            <PlainInput placeholder="主键ID" value={idDraft} onChange={setIdDraft} icon />
          </Stack>
          <Box>
            <Button
              variant="contained"
              startIcon={<Search size={16} />}
              onClick={runSearch}
              sx={{ height: 36, px: 4, fontSize: 13.5 }}
            >
              查询
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                {['账目类型', '主键ID', '交易类型', '交易数量', '网络', 'Txid', '交易时间', '备注'].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{
                        textAlign: 'left',
                        bgcolor: '#F4F6F9',
                        color: 'grey.600',
                        fontWeight: 400,
                        fontSize: 13,
                        height: 48,
                        px: 4,
                        whiteSpace: 'nowrap',
                        borderBottom: 'none',
                      }}
                    >
                      {h}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ py: 12, textAlign: 'center', color: 'grey.500', fontSize: 13.5 }}
                  >
                    暂无匹配的流水
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <Row
                    key={r.id}
                    r={r}
                    copiedTxid={copiedTxid}
                    onCopy={copyTxid}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
});

function Row({
  r,
  copiedTxid,
  onCopy,
}: {
  r: HotWalletRecord;
  copiedTxid: string | null;
  onCopy: (txid: string) => void;
}) {
  const cellSx = {
    py: 4.5,
    px: 4,
    fontSize: 14,
    color: 'text.primary',
    whiteSpace: 'nowrap' as const,
    borderBottom: '1px solid rgba(145,158,171,0.16)',
  };

  return (
    <TableRow sx={{ transition: 'background 120ms ease-out', '&:hover': { bgcolor: '#FAFBFD' } }}>
      <TableCell sx={cellSx}>{r.accountType}</TableCell>
      <TableCell sx={cellSx}>{r.id}</TableCell>
      <TableCell sx={cellSx}>
        {r.category === '' ? (
          <Box
            component="span"
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' },
            }}
            title="点击标记此笔流水类型"
          >
            点击标记
          </Box>
        ) : (
          <CategoryBadge category={r.category} />
        )}
      </TableCell>
      <TableCell sx={cellSx}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TokenIcon currency={r.currency} />
          <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtAmount(r.amount)} {r.currency}
          </Box>
        </Stack>
      </TableCell>
      <TableCell sx={cellSx}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <NetworkDot network={r.network} />
          <Box component="span">{r.network}</Box>
        </Stack>
      </TableCell>
      <TableCell sx={cellSx}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            component="span"
            onClick={() => onCopy(r.txid)}
            sx={{
              color: 'primary.main',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
              fontSize: 12.5,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              cursor: 'pointer',
            }}
            title={`点击复制：${r.txid}`}
          >
            {truncateTxid(r.txid)}
          </Box>
          <Tooltip title={copiedTxid === r.txid ? '已复制' : '复制'}>
            <IconButton
              onClick={() => onCopy(r.txid)}
              sx={{ width: 24, height: 24, color: copiedTxid === r.txid ? 'success.dark' : 'grey.500' }}
            >
              {copiedTxid === r.txid ? <Check size={14} /> : <Copy size={14} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell sx={cellSx}>{r.time}</TableCell>
      <TableCell sx={cellSx}>
        {r.remark ? (
          <Box
            component="span"
            sx={{
              color: 'primary.main',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
              fontSize: 12.5,
            }}
          >
            {r.remark}
          </Box>
        ) : (
          '--'
        )}
      </TableCell>
    </TableRow>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography sx={{ fontSize: 12, color: 'grey.600' }}>{label}</Typography>
      {children}
    </Box>
  );
}

function PlainInput({
  placeholder,
  value,
  onChange,
  icon,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: 220,
        height: 40,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 3,
        bgcolor: 'background.paper',
        transition: 'border-color 120ms, box-shadow 120ms',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 3px rgba(60,111,245,0.12)',
        },
      }}
    >
      {icon && (
        <Box sx={{ color: 'grey.500', display: 'inline-flex' }}>
          <Search size={16} />
        </Box>
      )}
      <Box
        component="input"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
          flex: 1,
          border: 0,
          outline: 'none',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'text.primary',
          bgcolor: 'transparent',
          '&::placeholder': { color: 'grey.400' },
        }}
      />
    </Box>
  );
}

function CategoryBadge({ category }: { category: HotWalletCategory }) {
  if (!category) return null;
  const color =
    category === '供应商退款' ? 'primary.main' :
    category === '借入'       ? 'grey.700' :
                                  'grey.700';
  return (
    <Box component="span" sx={{ color, fontWeight: 500 }}>
      {category}
    </Box>
  );
}

function TokenIcon({ currency }: { currency: string }) {
  const bg =
    currency === 'USDT' ? '#26A17B' :
    currency === 'TRX'  ? '#E84142' :
    currency === 'ETH'  ? '#627EEA' :
                          '#71757E';
  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        bgcolor: bg,
        color: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {currency.charAt(0)}
    </Box>
  );
}

function NetworkDot({ network }: { network: string }) {
  const bg =
    network === 'TRON'     ? '#E84142' :
    network === 'Polygon'  ? '#8247E5' :
    network === 'BSC'      ? '#F3BA2F' :
    network === 'ERC20'    ? '#627EEA' :
    network === 'Arbitrum' ? '#2D374B' :
    network === 'Optimism' ? '#FF0420' :
    network === 'Solana'   ? '#9945FF' :
                              '#71757E';
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        bgcolor: bg,
        flexShrink: 0,
      }}
    />
  );
}

function fmtAmount(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function truncateTxid(txid: string): string {
  if (txid.length <= 22) return txid;
  return `${txid.slice(0, 10)}...${txid.slice(-8)}`;
}
