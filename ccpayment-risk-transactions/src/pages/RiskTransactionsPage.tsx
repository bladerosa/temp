import { useEffect } from 'react';
import { Box, Button, Card, Container, Stack, Tab, Tabs, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { TableCard } from '@/components/TableCard';
import { useStores } from '@/stores';
import type { RiskTab } from '@/stores/RiskTransactionStore';
import { BatchConfirmDialog } from './risk-transactions/BatchConfirmDialog';
import { BatchRefundDrawer } from './risk-transactions/BatchRefundDrawer';
import { HighRiskManageDrawer } from './risk-transactions/HighRiskManageDrawer';
import { RefundDialog } from './risk-transactions/RefundDialog';
import { ReprocessDetailDialog } from './risk-transactions/ReprocessDetailDialog';
import { RiskPayTable } from './risk-transactions/RiskPayTable';
import { RiskWithdrawTable } from './risk-transactions/RiskWithdrawTable';
import { WithdrawDetailDialog } from './risk-transactions/WithdrawDetailDialog';

const RiskTransactionsPage = observer(function RiskTransactionsPage() {
  const { risk, ui } = useStores();
  const { search } = useLocation();

  // 从详情弹窗新开标签页进来时，按地址栏参数直接筛到目标记录
  useEffect(() => {
    risk.applyFromQuery(search);
  }, [risk, search]);

  return (
    <Container maxWidth={ui.themeStretch ? false : 'xl'} disableGutters>
      <PageHeader
        title="風險交易列表"
        crumbs={[{ label: '交易' }, { label: '風險交易列表' }]}
        action={
          <Button
            sx={{
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 2.25,
              '&:hover': { bgcolor: 'primary.light' },
            }}
          >
            風險地址
          </Button>
        }
      />

      <Typography sx={{ mt: 5, fontSize: 14, fontWeight: 600 }}>
        風險付款將不會入帳，可退款或提款。
      </Typography>

      <Card
        sx={{
          mt: 4,
          px: 6,
          py: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
            高風險支付管理
          </Typography>
          <Typography
            sx={{ fontSize: 13, lineHeight: '20px', color: 'text.secondary', mt: 0.5 }}
          >
            大於 {risk.settings.threshold} 美元的風險付款將自動提款至您指定的地址。
          </Typography>
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          onClick={risk.openManage}
          sx={{
            gap: 1,
            color: 'primary.main',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          <span>管理</span>
          <Box sx={{ display: 'inline-flex' }}>
            <ChevronRight size={18} strokeWidth={1.8} />
          </Box>
        </Stack>
      </Card>

      <Box sx={{ mt: 4 }}>
        <TableCard>
          <Tabs
            value={risk.tab}
            onChange={(_e, value: RiskTab) => risk.setTab(value)}
            sx={{
              px: 6,
              pt: 2,
              minHeight: 48,
              borderBottom: 'none',
              '& .MuiTabs-indicator': { bgcolor: 'text.primary', height: 2 },
              '& .MuiTab-root': {
                minHeight: 48,
                minWidth: 0,
                px: 0.5,
                mr: 8,
                fontSize: 14,
                fontWeight: 400,
                color: 'text.secondary',
              },
              '& .Mui-selected': { color: 'text.primary !important', fontWeight: 600 },
            }}
          >
            <Tab value="pay" label="風險付款" />
            <Tab value="withdraw" label="風險資金提款" />
          </Tabs>

          {risk.tab === 'pay' ? <RiskPayTable /> : <RiskWithdrawTable />}
        </TableCard>
      </Box>

      <HighRiskManageDrawer />
      <BatchRefundDrawer />
      <BatchConfirmDialog />
      <RefundDialog />
      <ReprocessDetailDialog />
      <WithdrawDetailDialog />
    </Container>
  );
});

export default RiskTransactionsPage;
