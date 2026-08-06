import {
  Box,
  Button,
  Link,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { CalendarDays, Download, SearchX } from 'lucide-react';
import { CryptoBadge } from '@/components/CryptoBadge';
import { EmptyState } from '@/components/EmptyState';
import { ListPagination } from '@/components/ListPagination';
import { TableFooter, TableToolbar } from '@/components/TableCard';
import {
  WITHDRAW_MODES,
  WITHDRAW_SEARCH_FIELDS,
  type RiskWithdrawal,
  type WithdrawMode,
  type WithdrawSearchField,
} from '@/data/riskTransactions';
import { useStores } from '@/stores';
import { SearchField } from './SearchField';
import { BatchTag, SoftChip, WITHDRAW_STATUS_META } from './statusMaps';

const COLUMNS: { label: string; width: number }[] = [
  { label: '紀錄 ID', width: 290 },
  { label: '類型', width: 160 },
  { label: '數量', width: 170 },
  { label: '區塊鏈', width: 120 },
  { label: '費用', width: 210 },
  { label: '至地址', width: 270 },
  { label: 'Txid', width: 210 },
  { label: '付款時間', width: 170 },
  { label: '狀態', width: 110 },
  { label: '操作', width: 80 },
];

const RowActions = observer(function RowActions({ row }: { row: RiskWithdrawal }) {
  const { risk } = useStores();

  // 本列表只有「退款詳情」一个操作场景，不走「更多操作」菜单。
  return (
    <Box
      component="span"
      role="button"
      onClick={() => risk.openWithdrawDetail(row)}
      sx={{
        fontSize: 14,
        fontWeight: 500,
        color: 'primary.main',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        '&:hover': { color: 'primary.dark' },
      }}
    >
      退款詳情
    </Box>
  );
});

export const RiskWithdrawTable = observer(function RiskWithdrawTable() {
  const { risk } = useStores();
  const rows = risk.pagedWithdrawals;

  return (
    <>
      <TableToolbar
        left={
          <>
            <TextField
              select
              label="退款方式"
              value={risk.withdrawMode}
              onChange={(e) => risk.setWithdrawMode(e.target.value as WithdrawMode)}
              sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 44 } }}
              InputLabelProps={{ shrink: true }}
            >
              {WITHDRAW_MODES.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: 14 }}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            <SearchField<WithdrawSearchField>
              fields={WITHDRAW_SEARCH_FIELDS}
              field={risk.withdrawSearchField}
              onFieldChange={risk.setWithdrawSearchField}
              query={risk.withdrawQuery}
              onQueryChange={risk.setWithdrawQuery}
              maxWidth={620}
            />
          </>
        }
        right={
          <>
            <Button color="inherit" startIcon={<CalendarDays size={20} strokeWidth={1.6} />} sx={{ fontWeight: 500 }}>
              選擇日期
            </Button>
            <Button color="inherit" startIcon={<Download size={20} strokeWidth={1.6} />} sx={{ fontWeight: 500 }}>
              匯出
            </Button>
          </>
        }
      />

      <TableContainer sx={{ overflowX: 'auto' }}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<SearchX size={32} />}
            title="沒有符合條件的風險資金提款"
            desc="調整搜尋關鍵字或退款方式後再試一次。"
          />
        ) : (
          <Table sx={{ minWidth: 1660 }}>
            <colgroup>
              {COLUMNS.map((c) => (
                <col key={c.label} style={{ width: c.width }} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow sx={{ '&:hover': { bgcolor: 'grey.200' } }}>
                {COLUMNS.map((c) => (
                  <TableCell key={c.label} sx={{ bgcolor: 'grey.200', fontSize: 13, fontWeight: 500, py: 4 }}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const meta = WITHDRAW_STATUS_META[row.status];
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography noWrap sx={{ fontSize: 14, maxWidth: 290 }}>
                        {row.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" sx={{ gap: 1.5 }}>
                        <Box component="span" sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                          風險提款
                        </Box>
                        {row.bill && <BatchTag />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" sx={{ gap: 2.5 }}>
                        <CryptoBadge symbol={row.symbol} />
                        <Box component="span" sx={{ fontSize: 14, color: 'error.main', whiteSpace: 'nowrap' }}>
                          {row.amount}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{row.chain}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" sx={{ gap: 2.5 }}>
                        <CryptoBadge symbol="USDT" />
                        <Box component="span" sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                          {row.fee}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap sx={{ fontSize: 14, maxWidth: 270 }}>
                        {row.to}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      {row.txid ? (
                        <Link href="#" onClick={(e) => e.preventDefault()} sx={{ fontSize: 14 }}>
                          {row.txid}
                        </Link>
                      ) : (
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                          --
                        </Box>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        color: row.time === '--' ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {row.time}
                    </TableCell>
                    <TableCell>
                      <SoftChip label={meta.label} bg={meta.bg} fg={meta.fg} />
                    </TableCell>
                    <TableCell>
                      <RowActions row={row} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {rows.length > 0 && (
        <TableFooter>
          <ListPagination
            page={risk.withdrawPage}
            pageSize={risk.withdrawPageSize}
            total={risk.filteredWithdrawals.length}
            onPageChange={risk.setWithdrawPage}
            onPageSizeChange={risk.setWithdrawPageSize}
          />
        </TableFooter>
      )}
    </>
  );
});
