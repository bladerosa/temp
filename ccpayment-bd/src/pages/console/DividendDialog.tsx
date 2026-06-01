import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FilterInput } from '@/components/FilterInput';
import { Pagination } from '@/components/Pagination';
import { makeDividendRecords, type DividendRecord } from '@/data/dividends';

type SortKey = 'time-desc' | 'time-asc';

export function DividendDialog({
  open,
  promoterName,
  onClose,
}: {
  open: boolean;
  promoterName: string | null;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<DividendRecord[]>(() => makeDividendRecords());
  const [filterKey, setFilterKey] = useState<'merchant-id'>('merchant-id');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('time-desc');
  const [pageSize, setPageSize] = useState(10);

  const [ratioEdit, setRatioEdit] = useState<DividendRecord | null>(null);
  const [endEdit, setEndEdit] = useState<DividendRecord | null>(null);

  const list = useMemo(() => {
    let out = rows.slice();
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((r) => r.merchantId.toLowerCase().includes(q));
    out.sort((a, b) =>
      sortKey === 'time-asc'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );
    return out;
  }, [rows, query, sortKey]);

  const saveRatio = (id: string, ratio: number) => {
    setRows((prev) => prev.map((r) => (r.merchantId === id ? { ...r, ratio } : r)));
  };
  const saveEnd = (id: string, endAt: string) => {
    setRows((prev) => prev.map((r) => (r.merchantId === id ? { ...r, endAt } : r)));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { width: 1000, maxWidth: 'calc(100vw - 48px)', borderRadius: '16px' } }}
    >
      <Box
        sx={{
          p: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ fontSize: 18, fontWeight: 700 }}>
          分红比例
          {promoterName ? (
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: 14, ml: 1 }}>
              · {promoterName}
            </Box>
          ) : null}
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: '24px', pb: '24px', pt: 0 }}>
        <Stack direction="row" spacing="14px" useFlexGap flexWrap="wrap" sx={{ mb: '18px' }}>
          <FilterInput<'merchant-id'>
            keyOptions={[{ key: 'merchant-id', label: '商户id' }]}
            activeKey={filterKey}
            onKeyChange={setFilterKey}
            query={query}
            onQueryChange={setQuery}
            width={360}
          />
          <Box sx={{ width: 240 }}>
            <Select
              fullWidth
              size="small"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              IconComponent={ChevronDown}
              sx={{ height: 44, fontSize: 14, bgcolor: '#fff' }}
            >
              <MenuItem value="time-desc">创建时间降序</MenuItem>
              <MenuItem value="time-asc">创建时间升序</MenuItem>
            </Select>
          </Box>
        </Stack>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 880, '& th, & td': { whiteSpace: 'nowrap' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>创建时间</TableCell>
                  <TableCell>结束分佣时间</TableCell>
                  <TableCell>商户ID</TableCell>
                  <TableCell>商户名称</TableCell>
                  <TableCell>当前分红比例</TableCell>
                  <TableCell sx={{ minWidth: 220 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.merchantId}>
                    <TableCell>{r.createdAt}</TableCell>
                    <TableCell>{r.endAt}</TableCell>
                    <TableCell>{r.merchantId}</TableCell>
                    <TableCell>{r.merchantName}</TableCell>
                    <TableCell>{r.ratio}%</TableCell>
                    <TableCell>
                      <Box component="span" sx={linkSx} onClick={() => setRatioEdit(r)}>
                        编辑分红比例
                      </Box>
                      <Box component="span" sx={{ color: 'grey.300', mx: '10px' }}>
                        |
                      </Box>
                      <Box component="span" sx={linkSx} onClick={() => setEndEdit(r)}>
                        编辑结束分佣时间
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Pagination
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            rangeLabel={`1–${list.length} of ${list.length}`}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </Box>
      </DialogContent>

      <RatioEditDialog
        record={ratioEdit}
        onClose={() => setRatioEdit(null)}
        onSave={(ratio) => {
          if (ratioEdit) saveRatio(ratioEdit.merchantId, ratio);
          setRatioEdit(null);
        }}
      />
      <EndTimeEditDialog
        record={endEdit}
        onClose={() => setEndEdit(null)}
        onSave={(endAt) => {
          if (endEdit) saveEnd(endEdit.merchantId, endAt);
          setEndEdit(null);
        }}
      />
    </Dialog>
  );
}

const linkSx = {
  color: 'primary.main',
  cursor: 'pointer',
  fontWeight: 500,
  '&:hover': { textDecoration: 'underline' },
};

function RatioEditDialog({
  record,
  onClose,
  onSave,
}: {
  record: DividendRecord | null;
  onClose: () => void;
  onSave: (ratio: number) => void;
}) {
  const [value, setValue] = useState('');

  const num = Number(value);
  const valid = value !== '' && Number.isFinite(num) && num >= 0 && num <= 100;

  return (
    <Dialog
      open={!!record}
      onClose={onClose}
      PaperProps={{ sx: { width: 440, maxWidth: 'calc(100vw - 32px)' } }}
      TransitionProps={{ onEntering: () => record && setValue(String(record.ratio)) }}
    >
      <SubHeader title="编辑分红比例" onClose={onClose} />
      <DialogContent sx={{ p: '20px' }}>
        <Box sx={{ p: '10px 12px', bgcolor: 'grey.100', borderRadius: '8px', mb: 2, fontSize: 13, color: 'text.secondary' }}>
          商户{' '}
          <Box component="b" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {record ? `${record.merchantName} (${record.merchantId})` : '--'}
          </Box>
        </Box>
        <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 1, fontWeight: 500 }}>分红比例</Box>
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0 – 100"
          error={value !== '' && !valid}
          helperText={value !== '' && !valid ? '请输入 0–100 之间的数值' : ' '}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '14px 20px', borderTop: '1px solid', borderColor: 'divider', gap: 1.25 }}>
        <Button variant="outlined" onClick={onClose} sx={{ height: 38 }}>
          取消
        </Button>
        <Button variant="contained" disabled={!valid} onClick={() => onSave(num)} sx={{ height: 38 }}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EndTimeEditDialog({
  record,
  onClose,
  onSave,
}: {
  record: DividendRecord | null;
  onClose: () => void;
  onSave: (endAt: string) => void;
}) {
  const [value, setValue] = useState<Dayjs | null>(null);

  const valid = value != null && value.isValid();

  return (
    <Dialog
      open={!!record}
      onClose={onClose}
      PaperProps={{ sx: { width: 440, maxWidth: 'calc(100vw - 32px)' } }}
      TransitionProps={{
        onEntering: () => record && setValue(dayjs(record.endAt, 'YYYY-MM-DD HH:mm:ss')),
      }}
    >
      <SubHeader title="编辑结束分佣时间" onClose={onClose} />
      <DialogContent sx={{ p: '20px' }}>
        <Box sx={{ p: '10px 12px', bgcolor: 'grey.100', borderRadius: '8px', mb: 2, fontSize: 13, color: 'text.secondary' }}>
          商户{' '}
          <Box component="b" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {record ? `${record.merchantName} (${record.merchantId})` : '--'}
          </Box>
        </Box>
        <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 1, fontWeight: 500 }}>结束分佣时间</Box>
        <DateTimePicker
          value={value}
          onChange={(v) => setValue(v)}
          format="YYYY-MM-DD HH:mm:ss"
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '14px 20px', borderTop: '1px solid', borderColor: 'divider', gap: 1.25 }}>
        <Button variant="outlined" onClick={onClose} sx={{ height: 38 }}>
          取消
        </Button>
        <Button
          variant="contained"
          disabled={!valid}
          onClick={() => value && onSave(value.format('YYYY-MM-DD HH:mm:ss'))}
          sx={{ height: 38 }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SubHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Box
      sx={{
        p: '18px 20px',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Box>
      <IconButton size="small" onClick={onClose} aria-label="关闭">
        <X size={18} />
      </IconButton>
    </Box>
  );
}
