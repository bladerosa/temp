import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Download, X } from 'lucide-react';
import type { IndustryCode } from '@/data/types';
import { industryLabel } from '@/data/industries';
import { downloadCsv } from '@/utils/csv';

/** One merchant row inside a shared-email group. Fields mirror the columns
 *  shown in 查看交易统计 so the group table stays consistent with the page.
 *  `deposit` is the 交易金额 (USDT) figure. */
export interface LinkedMember {
  id: string;
  name: string;
  country: string;
  industry: IndustryCode;
  deposit: number;
  count: number;
  firstDepositAt: string;
  lastDepositAt: string;
}

export interface LinkedMerchantsCtx {
  email: string;
  anchorName: string;
  /** Ordered: index 0 = the clicked merchant itself, rest = linked merchants. */
  members: LinkedMember[];
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'risk' }) {
  return (
    <Box
      sx={{
        flex: '1 1 150px',
        minWidth: 150,
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'grey.100',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mb: 0.75 }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: tone === 'risk' ? 'error.main' : 'text.primary',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function LinkedMerchantsModal({
  ctx,
  onClose,
}: {
  ctx: LinkedMerchantsCtx | null;
  onClose: () => void;
}) {
  if (!ctx) return null;

  const { email, anchorName, members } = ctx;
  const sum = members.reduce(
    (a, m) => ({
      deposit: a.deposit + m.deposit,
      count: a.count + m.count,
    }),
    { deposit: 0, count: 0 }
  );

  const exportCsv = () => {
    const rows: (string | number)[][] = [];
    rows.push(['关联商户汇总']);
    rows.push(['邮箱', '交易金额 (USDT)', '交易笔数']);
    rows.push([email, sum.deposit, sum.count]);
    rows.push([]); // spacer
    rows.push(['关联商户明细']);
    rows.push([
      '商户',
      'Display ID',
      '地区',
      '行业',
      '交易金额 (USDT)',
      '交易笔数',
      '首充时间',
      '最后充值时间',
    ]);
    members.forEach((m, i) => {
      rows.push([
        i === 0 ? `${m.name}（本商户）` : m.name,
        m.id,
        m.country,
        industryLabel(m.industry),
        m.deposit,
        m.count,
        m.firstDepositAt,
        m.lastDepositAt,
      ]);
    });
    downloadCsv(`关联商户_${email.replace(/[@.]/g, '_')}.csv`, rows);
  };

  const num = (n: number) => n.toLocaleString();

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 4 }}>
        <Stack sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>关联商户 · {anchorName}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
            邮箱 <Box component="span" sx={{ fontFamily: 'var(--font-mono)', color: 'text.primary' }}>{email}</Box>
            {' '}· 共 {members.length} 家商户（含本商户）
          </Typography>
        </Stack>
        <Button size="small" variant="outlined" startIcon={<Download size={13} />} onClick={exportCsv}>
          导出 CSV
        </Button>
        <IconButton onClick={onClose} size="small">
          <X size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* 顶部：汇总数据展示区 */}
        <Box sx={{ px: 4, pb: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 2 }}>
            汇总数据（本商户 + 关联商户合计）
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <StatCard label="交易金额 (USDT)" value={num(sum.deposit)} />
            <StatCard label="交易笔数" value={num(sum.count)} />
          </Stack>
        </Box>

        {/* 下方：关联商户明细表 */}
        <Box sx={{ px: 4, pb: 1 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 1.5 }}>
            关联商户明细（第一行为本商户）
          </Typography>
        </Box>
        <Box sx={{ maxHeight: '46vh', overflow: 'auto' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 4, minWidth: 180 }}>商户</TableCell>
                <TableCell>地区</TableCell>
                <TableCell>行业</TableCell>
                <TableCell align="right">交易金额 (USDT)</TableCell>
                <TableCell align="right">交易笔数</TableCell>
                <TableCell>首充时间</TableCell>
                <TableCell sx={{ pr: 4 }}>最后充值时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m, i) => {
                const self = i === 0;
                return (
                  <TableRow key={m.id} sx={self ? { bgcolor: 'rgba(60,111,245,0.06)' } : undefined}>
                    <TableCell sx={{ pl: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                              {m.name}
                            </Typography>
                            {self && (
                              <Chip
                                label="本商户"
                                size="small"
                                sx={{ height: 18, fontSize: 10.5, fontWeight: 600, bgcolor: 'primary.main', color: '#fff' }}
                              />
                            )}
                          </Stack>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'var(--font-mono)' }}>
                            {m.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={m.country} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.5 }} noWrap>
                        {industryLabel(m.industry)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {num(m.deposit)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {num(m.count)}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary', fontSize: 12.5 }}>
                      {m.firstDepositAt}
                    </TableCell>
                    <TableCell sx={{ pr: 4, fontVariantNumeric: 'tabular-nums', color: 'text.secondary', fontSize: 12.5 }}>
                      {m.lastDepositAt}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
