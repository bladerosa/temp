import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Link,
  Menu,
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
import { CalendarDays, Download, MoreVertical, SearchX } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { CryptoBadge } from '@/components/CryptoBadge';
import { EmptyState } from '@/components/EmptyState';
import { ListPagination } from '@/components/ListPagination';
import { TableFooter, TableToolbar } from '@/components/TableCard';
import {
  PAY_SEARCH_FIELDS,
  type PaySearchField,
  type RiskPayment,
} from '@/data/riskTransactions';
import { useStores } from '@/stores';
import type { ReprocessFilter } from '@/stores/RiskTransactionStore';
import { SearchField } from './SearchField';
import { BatchTag, OutlineChip, REPROCESS_META, SoftChip } from './statusMaps';

const COLUMNS: { label: string; width: number }[] = [
  { label: '紀錄 ID', width: 290 },
  { label: '類型', width: 104 },
  { label: '數量', width: 172 },
  { label: '區塊鏈', width: 104 },
  { label: '從地址', width: 246 },
  { label: 'Txid', width: 214 },
  { label: '狀態', width: 88 },
  { label: '付款時間', width: 176 },
  { label: '備註', width: 76 },
  { label: '重新處理狀態', width: 168 },
  { label: '操作', width: 116 },
];

const REPROCESS_OPTIONS: { value: ReprocessFilter; label: string }[] = [
  { value: '全部', label: '全部' },
  { value: 'pending', label: '等待中' },
  { value: 'refunded', label: '已退款' },
  { value: 'rejected', label: '已拒絕' },
  { value: 'failed', label: '失敗' },
];

/** 只有已退款 / 已拒絕 / 失敗 的记录能看「重新處理詳情」。 */
const hasReprocessDetail = (row: RiskPayment) =>
  row.reprocess === 'refunded' || row.reprocess === 'rejected' || row.reprocess === 'failed';

const RowActions = observer(function RowActions({ row }: { row: RiskPayment }) {
  const { risk } = useStores();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const canOpenMenu = hasReprocessDetail(row);
  const canRefund = row.reprocess !== 'refunded';

  return (
    <Stack direction="row" alignItems="center" sx={{ gap: 3.5 }}>
      <Box
        component="span"
        onClick={() => canRefund && risk.openRefund(row)}
        sx={{
          fontSize: 14,
          fontWeight: 500,
          cursor: canRefund ? 'pointer' : 'default',
          color: canRefund ? 'primary.main' : 'text.disabled',
          '&:hover': canRefund ? { color: 'primary.dark' } : undefined,
        }}
      >
        退款
      </Box>

      <IconButton
        aria-label="更多操作"
        size="small"
        onClick={(e) => canOpenMenu && setAnchor(e.currentTarget)}
        sx={{
          width: 24,
          height: 24,
          color: anchor ? 'primary.main' : 'text.secondary',
          cursor: canOpenMenu ? 'pointer' : 'default',
        }}
      >
        <MoreVertical size={18} strokeWidth={2} />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 196, mt: 1 } } }}
      >
        <MenuItem
          sx={{ fontSize: 14, py: 3 }}
          onClick={() => {
            setAnchor(null);
            risk.openReprocessDetail(row);
          }}
        >
          重新處理詳情
        </MenuItem>
        <MenuItem sx={{ fontSize: 14, py: 3 }}>發送 Webhook</MenuItem>
        <MenuItem sx={{ fontSize: 14, py: 3 }}>查看報告</MenuItem>
      </Menu>
    </Stack>
  );
});

export const RiskPayTable = observer(function RiskPayTable() {
  const { risk } = useStores();
  const rows = risk.pagedPayments;

  return (
    <>
      <TableToolbar
        left={
          <>
            <TextField
              select
              label="重新處理狀態"
              value={risk.payReprocess}
              onChange={(e) => risk.setPayReprocess(e.target.value as ReprocessFilter)}
              sx={{ width: 236, '& .MuiOutlinedInput-root': { height: 44 } }}
              InputLabelProps={{ shrink: true }}
            >
              {REPROCESS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: 14 }}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>

            <SearchField<PaySearchField>
              fields={PAY_SEARCH_FIELDS}
              field={risk.paySearchField}
              onFieldChange={risk.setPaySearchField}
              query={risk.payQuery}
              onQueryChange={risk.setPayQuery}
              maxWidth={520}
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
            <Button
              variant="outlined"
              color="inherit"
              onClick={risk.openBatch}
              sx={{
                fontWeight: 500,
                bgcolor: 'grey.100',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'grey.200', borderColor: 'grey.300' },
              }}
            >
              批量退款
            </Button>
          </>
        }
      />

      <TableContainer sx={{ overflowX: 'auto' }}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<SearchX size={32} />}
            title="沒有符合條件的風險付款"
            desc="調整搜尋關鍵字或重新處理狀態後再試一次。"
          />
        ) : (
          <Table sx={{ minWidth: 1700 }}>
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
                const meta = row.reprocess ? REPROCESS_META[row.reprocess] : null;
                return (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontSize: 14 }}>
                      <Typography noWrap sx={{ fontSize: 14, maxWidth: 290 }}>
                        {row.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{row.type}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" sx={{ gap: 2.5 }}>
                        <CryptoBadge symbol={row.symbol} />
                        <Box component="span" sx={{ fontSize: 14, color: 'success.dark', whiteSpace: 'nowrap' }}>
                          {row.amount}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{row.chain}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
                        <Box component="span" sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                          {row.from}
                        </Box>
                        <CopyButton value={row.from} />
                      </Stack>
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
                    <TableCell>
                      <SoftChip label="成功" bg="success.lighter" fg="success.dark" />
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{row.time}</TableCell>
                    <TableCell sx={{ fontSize: 14, color: 'text.secondary' }}>--</TableCell>
                    <TableCell>
                      {meta ? (
                        <Stack direction="row" alignItems="center" sx={{ gap: 1.5 }}>
                          <OutlineChip label={meta.label} fg={meta.fg} border={meta.border} />
                          {risk.isBatchRefund(row.refundId ?? '') && <BatchTag />}
                        </Stack>
                      ) : (
                        <Box component="span" sx={{ fontSize: 14, color: 'text.secondary' }}>
                          --
                        </Box>
                      )}
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
            page={risk.payPage}
            pageSize={risk.payPageSize}
            total={risk.filteredPayments.length}
            onPageChange={risk.setPayPage}
            onPageSizeChange={risk.setPayPageSize}
          />
        </TableFooter>
      )}
    </>
  );
});
