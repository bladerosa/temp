import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ChevronDown, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { useStores } from '@/stores';
import type { Promoter } from '@/data/promoters';
import { FilterInput } from '@/components/FilterInput';
import { Pagination } from '@/components/Pagination';
import { fmtNumber } from '@/utils/validators';
import { DividendDialog } from './DividendDialog';

type PromKey = 'email' | 'remark';

export default observer(function Promoters() {
  const { promoter } = useStores();
  const [remarkFor, setRemarkFor] = useState<Promoter | null>(null);
  const [dividendFor, setDividendFor] = useState<Promoter | null>(null);
  const [pageSize, setPageSize] = useState(100);

  const list = promoter.filtered;
  const total = list.length;

  return (
    <>
      <Typography
        component="h1"
        sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px', mb: '24px' }}
      >
        推广者列表
      </Typography>

      <Stack direction="row" spacing="14px" useFlexGap flexWrap="wrap" sx={{ mb: '18px' }}>
        <FilterInput<PromKey>
          keyOptions={[
            { key: 'email', label: '注册邮箱' },
            { key: 'remark', label: '备注' },
          ]}
          activeKey={promoter.filterKey}
          onKeyChange={promoter.setFilterKey}
          query={promoter.filterQuery}
          onQueryChange={promoter.setFilterQuery}
        />
        <Box sx={{ position: 'relative', width: 240 }}>
          <Select
            fullWidth
            size="small"
            value={promoter.sortKey}
            onChange={(e) => promoter.setSortKey(e.target.value as typeof promoter.sortKey)}
            IconComponent={(p) => (
              <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <ChevronDown size={14} {...p} />
              </Box>
            )}
            sx={{ height: 44, fontSize: 14, bgcolor: '#fff' }}
          >
            <MenuItem value="time-desc">加入推广时间降序</MenuItem>
            <MenuItem value="time-asc">加入推广时间升序</MenuItem>
            <MenuItem value="commission-desc">总佣金降序</MenuItem>
            <MenuItem value="commission-asc">总佣金升序</MenuItem>
          </Select>
        </Box>
      </Stack>

      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1360, '& th, & td': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200 }}>推广账号</TableCell>
                <TableCell>加入推广时间</TableCell>
                <TableCell>链接点击ip数</TableCell>
                <TableCell>绑定商户数量</TableCell>
                <TableCell>入金商户数量</TableCell>
                <TableCell>商户总入金(USD)</TableCell>
                <TableCell>计算佣金金额(USD)</TableCell>
                <TableCell>分成比例</TableCell>
                <TableCell>总佣金(USD)</TableCell>
                <TableCell>已提现佣金(USD)</TableCell>
                <TableCell>待提现佣金(USD)</TableCell>
                <TableCell>备注</TableCell>
                <TableCell sx={{ minWidth: 200 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.email}>
                  <TableCell>
                    <Box sx={{ fontWeight: 600, lineHeight: 1.2 }}>{p.name}</Box>
                    <Box sx={{ fontSize: 12, color: 'text.secondary', mt: '4px' }}>{p.email}</Box>
                  </TableCell>
                  <TableCell>{p.joined}</TableCell>
                  <TableCell>{fmtNumber(p.ip)}</TableCell>
                  <TableCell>
                    {p.bound > 0 ? (
                      <Box component="span" sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}>
                        {fmtNumber(p.bound)}
                      </Box>
                    ) : (
                      '0'
                    )}
                  </TableCell>
                  <TableCell>
                    {p.funded > 0 ? (
                      <Box component="span" sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}>
                        {fmtNumber(p.funded)}
                      </Box>
                    ) : (
                      '0'
                    )}
                  </TableCell>
                  <TableCell>{fmtNumber(p.total)}</TableCell>
                  <TableCell>{fmtNumber(p.commission)}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      onClick={() => setDividendFor(p)}
                      sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      点击查看
                    </Box>
                  </TableCell>
                  <TableCell>{fmtNumber(p.totalCom)}</TableCell>
                  <TableCell>{fmtNumber(p.withdrawn)}</TableCell>
                  <TableCell>{fmtNumber(p.pending)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', maxWidth: 160 }}>
                      <Box
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 130,
                          color: p.remark ? 'text.primary' : 'text.secondary',
                        }}
                        title={p.remark || '--'}
                      >
                        {p.remark || '--'}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setRemarkFor(p)}
                        sx={{ color: 'primary.main', width: 22, height: 22 }}
                        aria-label="编辑备注"
                      >
                        <Pencil size={14} />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <ActionLink>佣金结算记录</ActionLink>
                    <ActionSep />
                    <ActionLink danger disabled={!p.has2fa}>
                      解绑2FA
                    </ActionLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Pagination
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          rangeLabel={`1–${total} of ${total}`}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </Box>

      <RemarkDialog
        promoter={remarkFor}
        onClose={() => setRemarkFor(null)}
      />
      <DividendDialog
        open={!!dividendFor}
        promoterName={dividendFor ? dividendFor.email : null}
        onClose={() => setDividendFor(null)}
      />
    </>
  );
});

function ActionLink({
  children,
  danger,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      component="span"
      onClick={disabled ? undefined : onClick}
      sx={{
        color: disabled ? 'text.disabled' : danger ? 'error.main' : 'primary.main',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        pointerEvents: disabled ? 'none' : 'auto',
        '&:hover': { textDecoration: disabled ? 'none' : 'underline' },
      }}
    >
      {children}
    </Box>
  );
}

function ActionSep() {
  return (
    <Box component="span" sx={{ color: 'grey.300', mx: '10px', userSelect: 'none' }}>
      |
    </Box>
  );
}

function RemarkDialog({ promoter, onClose }: { promoter: Promoter | null; onClose: () => void }) {
  const { promoter: store } = useStores();
  const [value, setValue] = useState('');

  return (
    <Dialog
      open={!!promoter}
      onClose={onClose}
      PaperProps={{ sx: { width: 440, maxWidth: 'calc(100vw - 32px)' } }}
      TransitionProps={{
        onEntering: () => {
          if (promoter) setValue(promoter.remark);
        },
      }}
    >
      <DialogHeader title="编辑备注" onClose={onClose} />
      <DialogContent sx={{ p: '20px' }}>
        <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 1, fontWeight: 500 }}>备注</Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 50))}
          placeholder="请输入备注（最多 50 字）"
        />
        <Box sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'right', mt: '6px' }}>
          {value.length}/50
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '14px 20px', borderTop: '1px solid', borderColor: 'divider', gap: 1.25 }}>
        <Button variant="outlined" onClick={onClose} sx={{ height: 38 }}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (promoter) store.updateRemark(promoter.email, value.trim());
            onClose();
          }}
          sx={{ height: 38 }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DialogHeader({ title, onClose }: { title: string; onClose: () => void }) {
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
