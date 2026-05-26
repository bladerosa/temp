import { useState } from 'react';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStores } from '@/stores';
import { PATHS } from '@/routes/paths';
import { FiatWithdrawFeeModal } from '@/components/FiatWithdrawFeeModal';

type TabKey =
  | 'info'
  | 'members'
  | 'fees'
  | 'stats'
  | 'api'
  | 'logs'
  | 'api-logs'
  | 'collect';

const MERCHANT_TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'info', label: '商户信息' },
  { key: 'members', label: '成员信息' },
  { key: 'fees', label: '收费配置' },
  { key: 'stats', label: '数据概览' },
  { key: 'api', label: '接口配置' },
  { key: 'logs', label: '操作日志' },
  { key: 'api-logs', label: 'API请求记录' },
  { key: 'collect', label: '商家归集费' },
];

export const MerchantDetailPage = observer(function MerchantDetailPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('fees');

  return (
    <Box sx={{ pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 5 }}>
        <IconButton
          onClick={() => navigate(PATHS.sellUsdt)}
          sx={{ width: 36, height: 36, color: 'text.primary', borderRadius: 2 }}
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </IconButton>
        <Typography
          component="h1"
          sx={{ fontSize: 22, lineHeight: 1.3, fontWeight: 700, color: 'text.primary' }}
        >
          商户详情
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          pl: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 6,
          overflowX: 'auto',
        }}
      >
        {MERCHANT_TABS.map((t) => (
          <Box
            key={t.key}
            onClick={() => setTab(t.key)}
            sx={{
              position: 'relative',
              px: 4.5,
              pt: 3.5,
              pb: 4,
              fontSize: 14,
              fontFamily: 'inherit',
              color: tab === t.key ? 'primary.main' : 'grey.700',
              fontWeight: tab === t.key ? 500 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 120ms ease-out',
              '&:hover': { color: tab === t.key ? 'primary.main' : 'text.primary' },
              '&::after': tab === t.key
                ? {
                    content: '""',
                    position: 'absolute',
                    left: 18,
                    right: 18,
                    bottom: '-1px',
                    height: '2px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px',
                  }
                : undefined,
            }}
          >
            {t.label}
          </Box>
        ))}
      </Box>

      {tab === 'fees' ? (
        <FeeConfigTable />
      ) : (
        <Box sx={{ py: 12, textAlign: 'center', color: 'grey.500', fontSize: 13.5 }}>
          该 tab 内容未在此原型中实现。
        </Box>
      )}
    </Box>
  );
});

const FeeConfigTable = observer(function FeeConfigTable() {
  const { fee } = useStores();
  const [editFiat, setEditFiat] = useState(false);

  const rows: Array<{
    key: string;
    item: string;
    rate: React.ReactNode;
    action: string;
    cumulative: React.ReactNode;
  }> = [
    { key: 'collect', item: '归集费', rate: '商户支付', action: '编辑', cumulative: '--' },
    { key: 'deposit', item: '代币充值', rate: '0.5%', action: '编辑', cumulative: '--' },
    { key: 'deposit-t', item: '代币充值临时费率', rate: '--', action: '添加', cumulative: '--' },
    { key: 'swap-api', item: 'API换币', rate: '0.5%', action: '编辑', cumulative: '--' },
    { key: 'swap-auto', item: '自动换币', rate: '0.6%', action: '编辑', cumulative: '--' },
    { key: 'wd-auto', item: '自动提现', rate: '0.5%', action: '编辑', cumulative: '--' },
    {
      key: 'wd-fiat',
      item: '法币提现',
      rate: `${fee.fiatWithdraw}%  +${fee.platformFlat} USDT`,
      action: '编辑',
      cumulative: '--',
    },
    {
      key: 'wd-risk',
      item: '风险资产提现',
      rate: '8倍',
      action: '编辑',
      cumulative: (
        <>
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', mr: 4 }}>
            网络费
          </Box>
          <Box component="span" sx={{ color: 'grey.600', fontSize: 13 }}>
            风险资产提现费用=商家入金服务费+n倍网络费
          </Box>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <TableContainer>
        <Table sx={{ width: '100%', fontSize: 14 }}>
          <TableHead>
            <TableRow>
              {['服务项目', '费率', '', '累计收费'].map((h, i) => (
                <TableCell
                  key={i}
                  sx={{
                    textAlign: 'left',
                    bgcolor: '#F4F6F9',
                    color: 'grey.600',
                    fontWeight: 400,
                    fontSize: 13,
                    height: 48,
                    px: 6,
                    whiteSpace: 'nowrap',
                    borderBottom: 'none',
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.key}>
                <TableCell sx={{ py: 5.5, px: 6, fontSize: 14, color: 'text.primary', borderBottom: '1px solid rgba(145,158,171,0.24)' }}>
                  {r.item}
                </TableCell>
                <TableCell sx={{ py: 5.5, px: 6, fontSize: 14, color: 'text.primary', borderBottom: '1px solid rgba(145,158,171,0.24)' }}>
                  {r.rate}
                </TableCell>
                <TableCell sx={{ py: 5.5, px: 6, fontSize: 14, borderBottom: '1px solid rgba(145,158,171,0.24)' }}>
                  <Box
                    component="span"
                    onClick={() => {
                      if (r.key === 'wd-fiat') setEditFiat(true);
                    }}
                    sx={{
                      color: 'primary.main',
                      cursor: 'pointer',
                      fontWeight: 500,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {r.action}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 5.5, px: 6, fontSize: 14, color: 'text.primary', borderBottom: '1px solid rgba(145,158,171,0.24)' }}>
                  {r.cumulative}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <FiatWithdrawFeeModal
        open={editFiat}
        initialRate={fee.fiatWithdraw}
        platformFlat={fee.platformFlat}
        supplier={fee.supplier}
        onClose={() => setEditFiat(false)}
        onSave={(next) => {
          fee.saveFiatWithdraw(next);
          setEditFiat(false);
        }}
      />
    </Box>
  );
});
