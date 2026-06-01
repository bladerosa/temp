import {
  Box,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStores } from '@/stores';
import { FilterInput } from '@/components/FilterInput';
import { Pagination } from '@/components/Pagination';
import { StatusChip } from '@/components/StatusChip';
import { shortAddr, type WithdrawalStatus } from '@/data/withdrawals';
import { fmtNumber } from '@/utils/validators';

type WdKey = 'email' | 'merchant' | 'address';

export default observer(function Withdrawals() {
  const { withdrawal, promoter } = useStores();
  const [pageSize, setPageSize] = useState(100);

  const list = useMemo(() => {
    let out = withdrawal.withdrawals.slice();
    if (withdrawal.statusFilter !== 'all') {
      out = out.filter((r) => r.status === withdrawal.statusFilter);
    }
    const q = withdrawal.filterQuery.trim().toLowerCase();
    if (q) {
      out = out.filter((r) => {
        if (withdrawal.filterKey === 'email')
          return (r.email || '').toLowerCase().includes(q);
        if (withdrawal.filterKey === 'address')
          return (r.address || '').toLowerCase().includes(q);
        if (withdrawal.filterKey === 'merchant') {
          const m = promoter.lookupMerchant(r.email);
          if (!m) return false;
          return `${m.name} ${m.id}`.toLowerCase().includes(q);
        }
        return false;
      });
    }
    out.sort((a, b) => {
      switch (withdrawal.sortKey) {
        case 'time-asc':
          return a.createdAtMs - b.createdAtMs;
        case 'time-desc':
          return b.createdAtMs - a.createdAtMs;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
      }
    });
    return out;
  }, [
    withdrawal.withdrawals,
    withdrawal.filterKey,
    withdrawal.filterQuery,
    withdrawal.sortKey,
    withdrawal.statusFilter,
    promoter.promoters,
  ]);

  return (
    <>
      <Typography
        component="h1"
        sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px', mb: '24px' }}
      >
        佣金提现审批
      </Typography>

      <Stack direction="row" spacing="14px" useFlexGap flexWrap="wrap" sx={{ mb: '18px' }}>
        <FilterInput<WdKey>
          keyOptions={[
            { key: 'email', label: '注册邮箱' },
            { key: 'merchant', label: '绑定商户' },
            { key: 'address', label: '收款地址' },
          ]}
          activeKey={withdrawal.filterKey}
          onKeyChange={withdrawal.setFilterKey}
          query={withdrawal.filterQuery}
          onQueryChange={withdrawal.setFilterQuery}
        />
        <Box sx={{ width: 240 }}>
          <Select
            fullWidth
            size="small"
            value={withdrawal.sortKey}
            onChange={(e) => withdrawal.setSortKey(e.target.value as typeof withdrawal.sortKey)}
            IconComponent={ChevronDown}
            sx={{ height: 44, fontSize: 14, bgcolor: '#fff' }}
          >
            <MenuItem value="time-desc">创建时间降序</MenuItem>
            <MenuItem value="time-asc">创建时间升序</MenuItem>
            <MenuItem value="amount-desc">提现金额降序</MenuItem>
            <MenuItem value="amount-asc">提现金额升序</MenuItem>
          </Select>
        </Box>
        <Box sx={{ width: 240 }}>
          <Select
            fullWidth
            size="small"
            value={withdrawal.statusFilter}
            onChange={(e) =>
              withdrawal.setStatusFilter(e.target.value as WithdrawalStatus | 'all')
            }
            IconComponent={ChevronDown}
            sx={{ height: 44, fontSize: 14, bgcolor: '#fff' }}
          >
            <MenuItem value="all">全部状态</MenuItem>
            <MenuItem value="paying">打款中</MenuItem>
            <MenuItem value="paid">已打款</MenuItem>
            <MenuItem value="rejected">已拒绝</MenuItem>
            <MenuItem value="failed">已失败</MenuItem>
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
          <Table sx={{ minWidth: 1480, '& th, & td': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>发起审批时间</TableCell>
                <TableCell>绑定商户</TableCell>
                <TableCell>注册邮箱</TableCell>
                <TableCell>区块链网络</TableCell>
                <TableCell>收款地址</TableCell>
                <TableCell>申请提现金额(USD)</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>状态更新时间</TableCell>
                <TableCell sx={{ minWidth: 220 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((r, i) => {
                const m = promoter.lookupMerchant(r.email);
                return (
                  <TableRow key={`${r.email}-${r.createdAtMs}-${i}`}>
                    <TableCell>{r.createdAt}</TableCell>
                    <TableCell>
                      {m ? (
                        <Box sx={{ fontWeight: 600 }}>
                          {m.name}{' '}
                          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            ({m.id})
                          </Box>
                        </Box>
                      ) : (
                        <Box component="span" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                          --
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.email === '--' ? (
                        <Box component="span" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                          --
                        </Box>
                      ) : (
                        r.email
                      )}
                    </TableCell>
                    <TableCell>{m ? '内部转账' : r.network}</TableCell>
                    <TableCell>
                      {m ? (
                        `${m.id}商户钱包USDT余额`
                      ) : (
                        <Tooltip title={r.address}>
                          <Box
                            component="span"
                            sx={{
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                              fontSize: 12.5,
                            }}
                          >
                            {shortAddr(r.address)}
                          </Box>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{fmtNumber(r.amount)}</TableCell>
                    <TableCell>
                      <StatusChip status={r.status} />
                    </TableCell>
                    <TableCell>{r.updatedAt}</TableCell>
                    <TableCell>
                      <Box component="span" sx={actionLinkSx}>查看详情</Box>
                      {r.status === 'paying' && (
                        <>
                          <Box component="span" sx={{ color: 'grey.300', mx: '10px' }}>|</Box>
                          <Box component="span" sx={actionLinkSx}>提交打款记录</Box>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </>
  );
});

const actionLinkSx = {
  color: 'primary.main',
  cursor: 'pointer',
  fontWeight: 500,
  '&:hover': { textDecoration: 'underline' },
};
