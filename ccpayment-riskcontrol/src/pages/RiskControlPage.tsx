import { useState, type ReactNode } from 'react';
import { Box, Button, InputBase, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RiskDrawer } from '@/components/RiskDrawer';
import { useStores } from '@/stores';
import {
  expandAddress,
  levelForScore,
  statusMeta,
  type AddressRow,
  type DepositRow,
  type WithdrawRow,
} from '@/data/riskcontrol';
import type { CoinFilter, LevelFilter, NetFilter, SearchField } from '@/stores/RiskStore';

const DEPOSIT_COLS = '150px 108px 96px 132px 84px 132px 132px 132px 140px 116px 156px 100px 168px';
const DEPOSIT_MIN = 1832;
// 风险提现：与风险充值同结构，去掉「状态」「操作」两列
const WITHDRAW_COLS = '150px 108px 96px 132px 84px 132px 132px 132px 140px 116px 156px';
const WITHDRAW_MIN = 1570;
const ADDRESS_COLS = '108px 150px 96px 150px 156px 104px 108px 116px 310px';
const ADDRESS_MIN = 1470;

const NET_OPTIONS: { value: NetFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'POLYGON', label: 'POLYGON' },
  { value: 'TRX', label: 'TRX' },
  { value: 'BSC', label: 'BSC' },
];
const COIN_OPTIONS: { value: CoinFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'USDT', label: 'USDT' },
  { value: 'POL', label: 'POL' },
];
const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: '全部等级' },
  { value: 'low', label: '低风险' },
  { value: 'moderate', label: '中风险' },
  { value: 'high', label: '高风险' },
  { value: 'severe', label: '严重风险' },
];

const HEAD_SX = {
  fontSize: 12,
  fontWeight: 600,
  color: 'text.secondary',
} as const;
const CELL_ROW_SX = {
  gap: '14px',
  px: 3,
  py: '15px',
  borderTop: '1px solid',
  borderColor: 'divider',
  alignItems: 'center',
  '&:hover': { bgcolor: 'grey.100' },
} as const;

/**
 * 合体搜索框：左侧「字段下拉」+ 右侧输入框，共用一个外边框。
 * 与运营后台现有筛选组件保持一致（商户 ID / display ID / from address / to address / txid）。
 */
function FieldSearch({
  field,
  options,
  value,
  onFieldChange,
  onValueChange,
  onEnter,
}: {
  field: SearchField;
  options: { value: SearchField; label: string }[];
  value: string;
  onFieldChange: (v: SearchField) => void;
  onValueChange: (v: string) => void;
  onEnter: () => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = options.find((o) => o.value === field) ?? options[0];

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 320,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(145,158,171,0.32)',
        borderRadius: 2,
        overflow: 'hidden',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 3px rgba(60,111,245,0.14)',
        },
      }}
    >
      {/* 左侧字段下拉 */}
      <Box
        component="button"
        onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        sx={{
          height: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 2,
          border: 'none',
          bgcolor: 'transparent',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: 'text.primary',
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        {current.label}
        <Box sx={{ color: 'grey.500', display: 'inline-flex' }}>
          {anchor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Box>
      </Box>

      {/* 竖向分隔线 */}
      <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(145,158,171,0.32)', flexShrink: 0 }} />

      <InputBase
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter();
        }}
        placeholder={`搜索 ${current.label}…`}
        sx={{
          flex: 1,
          height: '100%',
          px: 2,
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          '& input::placeholder': { fontFamily: 'inherit', opacity: 0.6 },
        }}
      />

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, minWidth: 160, borderRadius: 3 } } }}
      >
        {options.map((o) => (
          <MenuItem
            key={o.value}
            selected={o.value === field}
            onClick={() => {
              onFieldChange(o.value);
              setAnchor(null);
            }}
            sx={{ fontSize: 14 }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        fontSize: 13,
        fontWeight: 600,
        color: 'primary.main',
        bgcolor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        p: 0,
        whiteSpace: 'nowrap',
        '&:hover': { textDecoration: 'underline' },
      }}
    >
      {children}
    </Box>
  );
}

function ScoreCell({ score }: { score: number }) {
  const lm = levelForScore(score);
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: lm.color }}>{score}</Typography>
      <Box sx={{ fontSize: 11, fontWeight: 600, color: lm.color, bgcolor: lm.bg, px: 1, py: 0.25, borderRadius: 1.5, whiteSpace: 'nowrap' }}>
        {lm.label}
      </Box>
    </Stack>
  );
}

function Ellipsis({ children, mono, color = 'grey.700', size = 12 }: { children: ReactNode; mono?: boolean; color?: string; size?: number }) {
  return (
    <Typography
      sx={{
        fontSize: size,
        color,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {children}
    </Typography>
  );
}

function TableCard({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 4, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {children}
    </Box>
  );
}

function Footer({ count }: { count: number }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={2.5}
      sx={{ px: 3, py: 1.75, borderTop: '1px solid', borderColor: 'divider', fontSize: 13, color: 'text.secondary' }}
    >
      <span>Rows per page: 100</span>
      <span>{count > 0 ? `1-${count} of ${count}` : `0 of 0`}</span>
      <Stack direction="row" spacing={0.75}>
        <Box sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', color: 'grey.400' }}>
          <ChevronLeft size={16} />
        </Box>
        <Box sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', color: 'grey.400' }}>
          <ChevronRight size={16} />
        </Box>
      </Stack>
    </Stack>
  );
}

function EmptyRow() {
  return (
    <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>没有符合筛选条件的记录</Box>
  );
}

const RiskControlPage = observer(function RiskControlPage() {
  const { risk, toast } = useStores();
  const isDeposit = risk.tab === 'deposit';
  const isWithdraw = risk.tab === 'withdraw';
  const isAddress = risk.tab === 'address';

  const tabSx = (on: boolean) =>
    ({
      borderRadius: 2.25,
      px: 2.5,
      py: 1.1,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      transition: 'all .12s',
      bgcolor: on ? 'rgba(60,111,245,0.10)' : 'grey.100',
      color: on ? 'primary.main' : 'grey.600',
    }) as const;

  // 充值：评估对象是付款方 From（钱从哪来）；提现：评估对象是收款方 To（钱去哪）
  const openDeposit = (r: DepositRow) =>
    risk.openDetail({
      target: expandAddress(r.from),
      network: r.network,
      score: r.score,
      meta: { kind: 'deposit', displayId: r.displayId, txid: r.txid, recordId: r.recordId },
    });
  const openWithdraw = (r: WithdrawRow) =>
    risk.openDetail({
      target: expandAddress(r.to),
      network: r.network,
      score: r.score,
      meta: { kind: 'withdraw', displayId: r.displayId, txid: r.txid, recordId: r.recordId },
    });
  const openAddress = (r: AddressRow) =>
    risk.openDetail({
      target: expandAddress(r.address),
      network: r.network,
      score: r.score,
      meta: { kind: 'address', merchantId: r.merchantId, riskAt: r.riskAt },
    });

  const depositRows = risk.depositRows;
  const withdrawRows = risk.withdrawRows;
  const addressRows = risk.addressRows;

  return (
    <>
      <PageHeader
        title="风控交易管理"
        action={
          <Button
            variant="contained"
            startIcon={<SlidersHorizontal size={16} />}
            onClick={() => toast.show({ title: '打开 MistTrack 规则配置', tone: 'info' })}
          >
            MistTrack规则配置
          </Button>
        }
      />

      {/* tabs */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
        <Box component="button" onClick={() => risk.setTab('deposit')} sx={tabSx(isDeposit)}>
          风险充值
        </Box>
        <Box component="button" onClick={() => risk.setTab('withdraw')} sx={tabSx(isWithdraw)}>
          风险提现
        </Box>
        <Box component="button" onClick={() => risk.setTab('address')} sx={tabSx(isAddress)}>
          风险地址
        </Box>
      </Stack>

      {/* filters */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5, flexWrap: 'wrap', rowGap: 2 }}>
        <TextField
          select
          size="small"
          label="网络"
          value={risk.netFilter}
          onChange={(e) => risk.setNet(e.target.value as NetFilter)}
          sx={{ width: 180 }}
        >
          {NET_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        {(isDeposit || isWithdraw) && (
          <TextField
            select
            size="small"
            label="代币"
            value={risk.coinFilter}
            onChange={(e) => risk.setCoin(e.target.value as CoinFilter)}
            sx={{ width: 160 }}
          >
            {COIN_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          select
          size="small"
          label="风险等级"
          value={risk.levelFilter}
          onChange={(e) => risk.setLevel(e.target.value as LevelFilter)}
          sx={{ width: 160 }}
        >
          {LEVEL_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        {/* 合体搜索：左侧选字段，右侧输入值（对齐现有系统的筛选组件） */}
        <FieldSearch
          field={risk.searchField}
          options={risk.searchFieldOptions}
          value={risk.search}
          onFieldChange={risk.setSearchField}
          onValueChange={risk.setSearch}
          onEnter={() => toast.show({ title: '查询完成', tone: 'success' })}
        />

        <Button variant="contained" onClick={() => toast.show({ title: '查询完成', tone: 'success' })}>
          查询
        </Button>
        <Button variant="outlined" color="inherit" onClick={risk.reset} sx={{ color: 'grey.700', borderColor: 'grey.300' }}>
          重置
        </Button>

        {isAddress && (
          <>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Download size={16} />}
              onClick={() => toast.show({ title: '正在导出数据…', tone: 'info' })}
              sx={{ color: 'grey.700', borderColor: 'grey.300' }}
            >
              导出
            </Button>
          </>
        )}
      </Stack>

      {/* table */}
      {isDeposit && (
        <TableCard>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: DEPOSIT_MIN }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: DEPOSIT_COLS, gap: '14px', px: 3, py: '15px', bgcolor: 'grey.100' }}>
                {['Time', 'Display ID', 'Network', 'Amount', 'Value', 'From', 'To', 'Txid', 'Record ID', '风险描述', '风险评分', '状态', '操作'].map((h) => (
                  <Typography key={h} sx={HEAD_SX}>
                    {h}
                  </Typography>
                ))}
              </Box>
              {depositRows.map((r, i) => {
                const sm = statusMeta(r.status);
                const rejected = r.status === 'rejected';
                const withdrawn = r.status === 'withdrawn';
                return (
                  <Box key={i} sx={{ display: 'grid', gridTemplateColumns: DEPOSIT_COLS, ...CELL_ROW_SX }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{r.time}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'grey.700' }}>{r.displayId}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'grey.600' }}>{r.network}</Typography>
                    <Ellipsis color="text.primary" size={13}>{r.amount}</Ellipsis>
                    <Typography sx={{ fontSize: 13, color: 'grey.700' }}>{r.value}</Typography>
                    <Ellipsis mono>{r.from}</Ellipsis>
                    <Ellipsis mono>{r.to}</Ellipsis>
                    <Ellipsis mono>{r.txid}</Ellipsis>
                    <Ellipsis mono>{r.recordId}</Ellipsis>
                    <LinkButton onClick={() => openDeposit(r)}>查看详情</LinkButton>
                    <ScoreCell score={r.score} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: sm.color }}>{sm.label}</Typography>
                    <Stack direction="row" spacing={1.75} alignItems="center">
                      {!rejected && !withdrawn && (
                        <LinkButton onClick={() => toast.show({ title: '跳转补充网络费', tone: 'info' })}>补充网络费</LinkButton>
                      )}
                      {!rejected && (
                        <LinkButton onClick={() => toast.show({ title: '打开充值详情', tone: 'info' })}>详情</LinkButton>
                      )}
                      {rejected && <Typography sx={{ color: 'grey.400', fontSize: 13 }}>--</Typography>}
                    </Stack>
                  </Box>
                );
              })}
              {depositRows.length === 0 && <EmptyRow />}
            </Box>
          </Box>
          <Footer count={depositRows.length} />
        </TableCard>
      )}

      {isWithdraw && (
        <TableCard>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: WITHDRAW_MIN }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: WITHDRAW_COLS, gap: '14px', px: 3, py: '15px', bgcolor: 'grey.100' }}>
                {['Time', 'Display ID', 'Network', 'Amount', 'Value', 'From', 'To', 'Txid', 'Record ID', '风险描述', '风险评分'].map((h) => (
                  <Typography key={h} sx={HEAD_SX}>
                    {h}
                  </Typography>
                ))}
              </Box>
              {withdrawRows.map((r, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: WITHDRAW_COLS, ...CELL_ROW_SX }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{r.time}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'grey.700' }}>{r.displayId}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'grey.600' }}>{r.network}</Typography>
                  <Ellipsis color="text.primary" size={13}>{r.amount}</Ellipsis>
                  <Typography sx={{ fontSize: 13, color: 'grey.700' }}>{r.value}</Typography>
                  <Ellipsis mono>{r.from}</Ellipsis>
                  <Ellipsis mono>{r.to}</Ellipsis>
                  <Ellipsis mono>{r.txid}</Ellipsis>
                  <Ellipsis mono>{r.recordId}</Ellipsis>
                  <LinkButton onClick={() => openWithdraw(r)}>查看详情</LinkButton>
                  <ScoreCell score={r.score} />
                </Box>
              ))}
              {withdrawRows.length === 0 && <EmptyRow />}
            </Box>
          </Box>
          <Footer count={withdrawRows.length} />
        </TableCard>
      )}

      {isAddress && (
        <TableCard>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: ADDRESS_MIN }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: ADDRESS_COLS, gap: '14px', px: 3, py: '15px', bgcolor: 'grey.100' }}>
                {['Merchant ID', 'Risk at', 'Network', 'Address', '风险评分', '通知结果', '停用后收款', '风险描述', '操作'].map((h) => (
                  <Typography key={h} sx={HEAD_SX}>
                    {h}
                  </Typography>
                ))}
              </Box>
              {addressRows.map((r, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: ADDRESS_COLS, ...CELL_ROW_SX }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{r.merchantId}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'grey.700' }}>{r.riskAt}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'grey.600' }}>{r.network}</Typography>
                  <Ellipsis mono>{r.address}</Ellipsis>
                  <ScoreCell score={r.score} />
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: r.notify === 'Success' ? 'success.dark' : 'grey.600' }}>
                    {r.notify}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'grey.700' }}>{r.after}</Typography>
                  <LinkButton onClick={() => openAddress(r)}>查看详情</LinkButton>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LinkButton
                      onClick={() => {
                        risk.queryDepositByAddress(r.address);
                        toast.show({ title: '已按该地址筛选风险充值', desc: `To Address：${r.address}`, tone: 'info' });
                      }}
                    >
                      查询充值交易
                    </LinkButton>
                    <LinkButton
                      onClick={() => {
                        risk.queryWithdrawByAddress(r.address);
                        toast.show({ title: '已按该地址筛选风险提现', desc: `From Address：${r.address}`, tone: 'info' });
                      }}
                    >
                      查询提现交易
                    </LinkButton>
                    <LinkButton onClick={() => toast.show({ title: '打开通知记录', tone: 'info' })}>查看通知记录</LinkButton>
                  </Stack>
                </Box>
              ))}
              {addressRows.length === 0 && <EmptyRow />}
            </Box>
          </Box>
          <Footer count={addressRows.length} />
        </TableCard>
      )}

      <RiskDrawer />
    </>
  );
});

export default RiskControlPage;
