import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import {
  COMPLETED_ROWS,
  PAYING_ROWS,
  PENDING_ROWS,
  REJECTED_ROWS,
  TRANSFER_PENDING_ROWS,
} from '@/data/mockData';
import type { SellOrderRaw, FeeConfig, CompletedRow } from '@/data/types';
import { deriveRow, fmtFiat, fmtMarketRate, fmtUSDT } from '@/utils/pricing';
import { FeeSettingsModal } from '@/components/FeeSettingsModal';
import {
  OrderDetailModal,
  type DetailStatusSection,
  type CwalletTransferSection,
  type SupplierCwalletInfoSection,
  type FiatProofSection,
} from '@/components/OrderDetailModal';
import { ApproveOrderModal } from '@/components/ApproveOrderModal';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';
import { SearchBox } from '@/components/SearchBox';
import { Pagination } from '@/components/Pagination';
import { ProofIcon } from '@/components/ProofIcon';

type TabKey = 'pending' | 'transfer-pending' | 'paying' | 'rejected' | 'completed';
type DetailKind = 'pending' | 'transfer-pending' | 'paying' | 'completed';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: '待审核' },
  { key: 'transfer-pending', label: '待转账给供应商' },
  { key: 'paying', label: '待供应商付款' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'completed', label: '已完成' },
];

export const SellUsdtPage = observer(function SellUsdtPage() {
  const { fee } = useStores();
  const [tab, setTab] = useState<TabKey>('pending');
  const [feeOpen, setFeeOpen] = useState(false);
  const [detail, setDetail] = useState<{ row: SellOrderRaw; kind: DetailKind } | null>(null);
  const [approveRow, setApproveRow] = useState<SellOrderRaw | null>(null);
  const [confirm, setConfirm] = useState<{ row: SellOrderRaw; kind: 'transfer' | 'payment' } | null>(null);

  const confirmModalConfig = (() => {
    if (!confirm) return null;
    const row = confirm.row;
    if (confirm.kind === 'transfer') {
      return {
        title: '转账给供应商凭证',
        subtitle: '请核对向供应商cwallet账户的转账信息并填写转账凭证',
        cardTitle: '供应商cwallet账户转账信息',
        cardRows: [
          { k: 'cwallet账户id', v: '34575837' },
          { k: '转账币种', v: 'USDT' },
          { k: '转账数量', v: row.cwalletAmt ?? '' },
        ],
        uploadHint: '上传转账凭证截图(最多5张，必传)',
        uploadRequired: true,
        proofLabel: '转账记录id号',
        amountLabel: '转账数量',
        amountSuffix: 'USDT',
        warning: undefined as string | undefined,
      };
    }
    // payment (供应商法币履约凭证)
    return {
      title: '供应商法币履约凭证',
      subtitle: '联系供应商收集法币转账凭证信息并在此页面进行记录以完成本交易',
      cardTitle: '收款信息',
      cardRows: [
        { k: 'Bank Name:', v: row.bank },
        { k: 'Account Holder:', v: 'Jasee' },
        { k: 'BIC/SWIFT:', v: '000009527' },
        { k: 'IBAN/Account Number:', v: '000000001' },
        { k: 'Bank Address:', v: '1.1' },
        { k: 'Recipient’s Address:', v: '1.1' },
      ],
      uploadHint: '上传付款凭证截图(最多5张，必传)',
      uploadRequired: true,
      proofLabel: '付款凭证号',
      amountLabel: '付款金额',
      amountSuffix: row.ccy,
      warning:
        '商家已冻结资产将在确认后在余额中扣除，划转给系统热钱包平对cwallet运营账户的USDT支出以及记录平台服务费收入。',
    };
  })();

  const total =
    tab === 'pending'
      ? PENDING_ROWS.length
      : tab === 'transfer-pending'
        ? TRANSFER_PENDING_ROWS.length
        : tab === 'paying'
          ? PAYING_ROWS.length
          : tab === 'rejected'
            ? REJECTED_ROWS.length
            : COMPLETED_ROWS.length;

  const detailModalProps: {
    title: string;
    statusSection?: DetailStatusSection;
    cwalletSection?: CwalletTransferSection;
    supplierCwalletSection?: SupplierCwalletInfoSection;
    fiatProofSection?: FiatProofSection;
  } = (() => {
    if (!detail) return { title: '付款单信息' };
    const row = detail.row;
    switch (detail.kind) {
      case 'pending':
        return { title: '付款单信息' };
      case 'transfer-pending': {
        const status = row.transferStatus ?? '转账中';
        return {
          title: '付款单信息',
          statusSection: {
            title: '已通过审核',
            timeLabel: '过审时间',
            time: row.time,
            operator: row.operator ?? '',
          },
          cwalletSection: {
            amount: row.cwalletAmt ?? '',
            id: row.cwalletId ?? '',
            time: status === '已完成' ? (row.transferAt ?? '') : '',
            status,
          },
        };
      }
      case 'paying':
        return {
          title: '付款单信息',
          statusSection: {
            title: '已通过审核',
            timeLabel: '过审时间',
            time: row.approvedAt ?? '',
            operator: row.approvedBy ?? '',
          },
          cwalletSection: {
            amount: row.cwalletAmt ?? '',
            id: row.cwalletId ?? '',
            time: row.transferAt ?? '',
            status: '已完成',
          },
          supplierCwalletSection: {
            uploadedAt: row.proofUploadedAt ?? '',
            uploadedBy: row.proofUploadedBy ?? '',
          },
        };
      case 'completed': {
        const c = row as CompletedRow;
        return {
          title: '付款单信息',
          statusSection: {
            title: '已通过审核',
            timeLabel: '过审时间',
            time: c.approvedAt,
            operator: c.approvedBy,
          },
          cwalletSection: {
            amount: c.cwalletAmt,
            id: c.cwalletId,
            time: c.transferAt,
            status: '已完成',
          },
          supplierCwalletSection: {
            uploadedAt: c.proofUploadedAt ?? '',
            uploadedBy: c.proofUploadedBy ?? '',
          },
          fiatProofSection: {
            proofId: c.proofId,
            uploadedAt: c.completedAt,
            uploadedBy: c.operator ?? '',
          },
        };
      }
    }
  })();

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
          Sell USDT 申请
        </Typography>
        <Stack direction="row" alignItems="center" spacing={4} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, fontSize: 13, color: 'grey.700' }}>
            cwallet运营账户id：
            <Box
              component="span"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
              }}
            >
              9527321
            </Box>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, fontSize: 13, color: 'grey.700' }}>
            cwallet供应商账户id：
            <Box
              component="span"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
              }}
            >
              34575837
            </Box>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, fontSize: 13, color: 'grey.700' }}>
            供应商汇率加点：
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {fee.supplier}%
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setFeeOpen(true)}
            sx={{ height: 36, px: 4, fontSize: 13.5 }}
          >
            服务费设置
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 6,
            pt: 2,
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            {TABS.map((t) => (
              <Box
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                sx={{
                  position: 'relative',
                  px: 4.5,
                  pt: 4,
                  pb: 4.5,
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
                        bottom: 8,
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
          <SearchBox />
        </Box>

        {tab === 'pending' && (
          <PendingPayingTable
            rows={PENDING_ROWS}
            fee={fee.config}
            timeLabel="提交时间"
            primaryAction="通过并发送至Lark"
            rejectLabel="拒绝"
            onDetail={(r) => setDetail({ row: r, kind: 'pending' })}
            onPrimary={setApproveRow}
          />
        )}
        {tab === 'transfer-pending' && (
          <PendingPayingTable
            rows={TRANSFER_PENDING_ROWS}
            fee={fee.config}
            timeLabel="过审时间"
            primaryAction="确认转账"
            onDetail={(r) => setDetail({ row: r, kind: 'transfer-pending' })}
            onPrimary={(r) => setConfirm({ row: r, kind: 'transfer' })}
            canPrimary={(r) => r.transferStatus === '已完成'}
          />
        )}
        {tab === 'paying' && (
          <PendingPayingTable
            rows={PAYING_ROWS}
            fee={fee.config}
            timeLabel="标记时间"
            primaryAction="确认付款"
            rejectLabel="供应商退款"
            onDetail={(r) => setDetail({ row: r, kind: 'paying' })}
            onPrimary={(r) => setConfirm({ row: r, kind: 'payment' })}
          />
        )}
        {tab === 'rejected' && <RejectedTable />}
        {tab === 'completed' && (
          <CompletedTable onDetail={(r) => setDetail({ row: r, kind: 'completed' })} />
        )}

        <Pagination total={total} />
      </Box>

      <FeeSettingsModal
        open={feeOpen}
        initial={{ platform: fee.platform, supplier: fee.supplier }}
        onClose={() => setFeeOpen(false)}
        onSave={(next) => {
          fee.saveSellFee(next);
          setFeeOpen(false);
        }}
      />

      <OrderDetailModal
        open={!!detail}
        row={detail?.row ?? null}
        fee={fee.config}
        title={detailModalProps.title}
        statusSection={detailModalProps.statusSection}
        cwalletSection={detailModalProps.cwalletSection}
        supplierCwalletSection={detailModalProps.supplierCwalletSection}
        fiatProofSection={detailModalProps.fiatProofSection}
        onClose={() => setDetail(null)}
      />

      <ApproveOrderModal
        open={!!approveRow}
        row={approveRow}
        fee={fee.config}
        onClose={() => setApproveRow(null)}
        onApprove={() => setApproveRow(null)}
        onReject={() => setApproveRow(null)}
      />

      {confirmModalConfig && confirm && (
        <ConfirmActionModal
          open={!!confirm}
          rowKey={`${confirm.kind}-${confirm.row.recordId}`}
          title={confirmModalConfig.title}
          subtitle={confirmModalConfig.subtitle}
          cardTitle={confirmModalConfig.cardTitle}
          cardRows={confirmModalConfig.cardRows}
          uploadHint={confirmModalConfig.uploadHint}
          uploadRequired={confirmModalConfig.uploadRequired}
          proofLabel={confirmModalConfig.proofLabel}
          amountLabel={confirmModalConfig.amountLabel}
          amountSuffix={confirmModalConfig.amountSuffix}
          warning={confirmModalConfig.warning}
          onClose={() => setConfirm(null)}
          onConfirm={() => setConfirm(null)}
        />
      )}
    </Box>
  );
});

const headCellSx = {
  textAlign: 'left' as const,
  bgcolor: '#F4F6F9',
  color: 'grey.600',
  fontWeight: 400,
  fontSize: 13,
  height: 48,
  px: 4,
  whiteSpace: 'nowrap' as const,
  borderBottom: 'none',
  '&:first-of-type': { pl: 6 },
  '&:last-of-type': { pr: 6, textAlign: 'right' },
};

const bodyCellSx = {
  py: 4.5,
  px: 4,
  fontSize: 14,
  color: 'text.primary',
  whiteSpace: 'nowrap' as const,
  borderBottom: '1px solid rgba(145,158,171,0.16)',
  '&:first-of-type': { pl: 6 },
  '&:last-of-type': { pr: 6, textAlign: 'right' },
};

function PendingPayingTable({
  rows,
  fee,
  timeLabel,
  primaryAction,
  rejectLabel,
  onDetail,
  onPrimary,
  canPrimary,
}: {
  rows: SellOrderRaw[];
  fee: FeeConfig;
  timeLabel: string;
  primaryAction: string;
  /** Label for the trailing danger button (e.g. 拒绝 / 供应商退款). Omit to hide it entirely. */
  rejectLabel?: string;
  onDetail: (row: SellOrderRaw) => void;
  onPrimary?: (row: SellOrderRaw) => void;
  /** Per-row predicate: when it returns false, the primary action button is hidden for that row. */
  canPrimary?: (row: SellOrderRaw) => boolean;
}) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ width: '100%', fontSize: 13.5 }}>
        <TableHead>
          <TableRow>
            {[
              timeLabel,
              'Record ID',
              '商户ID',
              'Sell Amount',
              '外显服务费',
              '平台服务费',
              '供应商承兑Amount',
              '汇率',
              '供应商汇率',
              '得到资产',
              '收款信息',
              '',
            ].map((h, i) => (
              <TableCell key={i} sx={headCellSx}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => {
            const d = deriveRow(r, fee);
            return (
              <TableRow key={i} sx={{ transition: 'background 120ms ease-out', '&:hover': { bgcolor: '#FAFBFD' } }}>
                <TableCell sx={bodyCellSx}>{r.time}</TableCell>
                <TableCell sx={bodyCellSx}>{r.recordId}</TableCell>
                <TableCell sx={bodyCellSx}>
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    {r.mid}
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellSx}>{fmtUSDT(r.sellAmt)}</TableCell>
                <TableCell sx={bodyCellSx}>{fmtUSDT(d.extFee)}</TableCell>
                <TableCell sx={bodyCellSx}>{fmtUSDT(d.platFee)}</TableCell>
                <TableCell sx={bodyCellSx}>{fmtUSDT(d.supAmt)}</TableCell>
                <TableCell sx={bodyCellSx}>{fmtMarketRate(r.market, r.ccy)}</TableCell>
                <TableCell sx={bodyCellSx}>{fmtMarketRate(d.supRate, r.ccy)}</TableCell>
                <TableCell sx={bodyCellSx}>{fmtFiat(d.userGot, r.ccy)}</TableCell>
                <TableCell sx={bodyCellSx}>
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    BankName:{' '}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    {r.bank}
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <ActionButton variant="outlined" onClick={() => onDetail(r)}>
                      详情
                    </ActionButton>
                    {(!canPrimary || canPrimary(r)) && (
                      <ActionButton variant="primary" onClick={onPrimary ? () => onPrimary(r) : undefined}>
                        {primaryAction}
                      </ActionButton>
                    )}
                    {rejectLabel && <ActionButton variant="danger">{rejectLabel}</ActionButton>}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ActionButton({
  variant,
  onClick,
  children,
}: {
  variant: 'primary' | 'outlined' | 'danger';
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const styles =
    variant === 'primary'
      ? { bgcolor: 'primary.main', color: '#FFFFFF', '&:hover': { bgcolor: 'primary.dark' } }
      : variant === 'outlined'
        ? {
            bgcolor: '#FFFFFF',
            color: 'primary.main',
            boxShadow: 'inset 0 0 0 1px var(--primary, #3C6FF5)',
            '&:hover': { bgcolor: 'rgba(60,111,245,0.06)' },
          }
        : { bgcolor: '#F0563A', color: '#FFFFFF', '&:hover': { bgcolor: '#D53E22' } };

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1,
        border: 0,
        borderRadius: 1.5,
        px: 3,
        height: 30,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 120ms ease-out, color 120ms',
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {children}
    </Box>
  );
}

function RejectedTable() {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ width: '100%', fontSize: 13.5 }}>
        <TableHead>
          <TableRow>
            {['拒绝时间', 'Record Id', '商户ID', '已返还代币', '拒绝原因', '拒绝人', ''].map((h, i) => (
              <TableCell key={i} sx={headCellSx}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {REJECTED_ROWS.map((r, i) => (
            <TableRow key={i} sx={{ transition: 'background 120ms ease-out', '&:hover': { bgcolor: '#FAFBFD' } }}>
              <TableCell sx={bodyCellSx}>{r.time}</TableCell>
              <TableCell sx={bodyCellSx}>{r.recordId}</TableCell>
              <TableCell sx={bodyCellSx}>{r.mid}</TableCell>
              <TableCell sx={bodyCellSx}>{r.refund}</TableCell>
              <TableCell sx={bodyCellSx}>{r.reason}</TableCell>
              <TableCell sx={bodyCellSx}>{r.operator}</TableCell>
              <TableCell sx={bodyCellSx}>
                <ActionButton variant="outlined">详情</ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function CompletedTable({ onDetail }: { onDetail: (row: CompletedRow) => void }) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ width: '100%', fontSize: 13.5 }}>
        <TableHead>
          <TableRow>
            {[
              '完成时间',
              'Order id',
              '商户ID',
              '法币付款',
              '付款银行',
              '付款凭证号',
              '上传人',
              '',
            ].map((h, i) => (
              <TableCell key={i} sx={headCellSx}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {COMPLETED_ROWS.map((r, i) => (
            <TableRow key={i} sx={{ transition: 'background 120ms ease-out', '&:hover': { bgcolor: '#FAFBFD' } }}>
              <TableCell sx={bodyCellSx}>{r.completedAt}</TableCell>
              <TableCell sx={bodyCellSx}>{r.recordId}</TableCell>
              <TableCell sx={bodyCellSx}>{r.mid}</TableCell>
              <TableCell sx={bodyCellSx}>{r.fiatPaid}</TableCell>
              <TableCell sx={bodyCellSx}>{r.payBank}</TableCell>
              <TableCell sx={bodyCellSx}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'bottom',
                    }}
                  >
                    {r.proofId}
                  </Box>
                  <Box sx={{ color: 'grey.500', cursor: 'pointer', display: 'inline-flex' }}>
                    <ProofIcon />
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={bodyCellSx}>{r.operator}</TableCell>
              <TableCell sx={bodyCellSx}>
                <ActionButton variant="outlined" onClick={() => onDetail(r)}>
                  详情
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
