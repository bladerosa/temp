import { Box, IconButton, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { AlertTriangle, ArrowRight, Copy, Download, ExternalLink, Lightbulb, Tag, X } from 'lucide-react';
import { useStores } from '@/stores';
import {
  buildResult,
  coinMeta,
  expandRecordId,
  expandTxid,
  levelMeta,
  looksAddr,
  riskTypeMeta,
  trunc,
  fmtUSD,
  type DrawerTarget,
} from '@/data/riskcontrol';

const R = 54;
const CIRC = 2 * Math.PI * R;

interface HopChip {
  label: string;
  full: string;
  isAddr: boolean;
  firstInGroup: boolean;
}
interface MetaRow {
  label: string;
  value: string;
  copyFull?: string;
}

export const RiskDrawer = observer(function RiskDrawer() {
  const { risk, toast } = useStores();
  const sel = risk.sel;
  if (!sel) return null;

  const copy = (text: string, msg: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
    toast.show({ title: msg, tone: 'success' });
  };

  const s: DrawerTarget = sel;
  const cm = coinMeta(s.network);
  const res = buildResult(s.score, s.target);
  const lv = levelMeta(res.risk_level);
  const dash = (Math.max(0, Math.min(100, res.score)) / 100) * CIRC;
  const labels = (res.address_label || '').split(',').map((x) => x.trim()).filter(Boolean);

  const metaRows: MetaRow[] =
    s.meta.kind === 'deposit' || s.meta.kind === 'withdraw'
      ? [
          { label: 'coin', value: cm.coin },
          { label: 'Display ID', value: s.meta.displayId ?? '' },
          { label: 'Txid', value: s.meta.txid ?? '', copyFull: expandTxid(s.meta.txid ?? '') },
          { label: 'Record ID', value: s.meta.recordId ?? '', copyFull: expandRecordId(s.meta.recordId ?? '') },
          { label: '查询方向', value: s.meta.kind === 'deposit' ? '充值 deposit' : '提现 withdraw' },
          { label: 'address_label', value: res.address_label || '(空)' },
        ]
      : [
          { label: 'coin', value: cm.coin },
          { label: 'Merchant ID', value: s.meta.merchantId ?? '' },
          { label: 'Risk at', value: s.meta.riskAt ?? '' },
          { label: '查询方向', value: '地址查询 (—)' },
          { label: 'has_result', value: 'true' },
          { label: 'address_label', value: res.address_label || '(空)' },
        ];

  const cardSx = {
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3.5,
    p: 2.25,
  } as const;

  return (
    <>
      <Box
        onClick={risk.closeDrawer}
        sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(31,32,37,0.32)', zIndex: 1200 }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 540,
          maxWidth: '94vw',
          bgcolor: 'background.default',
          zIndex: 1201,
          boxShadow: '-40px 40px 80px -8px rgba(145,158,171,0.24)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header */}
        <Box
          sx={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2.5,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>风险评估详情</Typography>
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: 'info.dark',
                bgcolor: 'info.lighter',
                px: 1,
                py: 0.4,
                borderRadius: 1.5,
              }}
            >
              MistTrack
            </Box>
          </Stack>
          <IconButton onClick={risk.closeDrawer} sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'grey.100' }}>
            <X size={18} />
          </IconButton>
        </Box>

        {/* body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.75, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* coin + target */}
          <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: cm.color,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  flex: 'none',
                }}
              >
                {cm.symbol}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{cm.coin}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {cm.networkLabel} ·{' '}
                  {s.meta.kind === 'deposit' ? '充值交易' : s.meta.kind === 'withdraw' ? '提现交易' : '风险地址'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'grey.100', borderRadius: 2, p: 1.25 }}>
              <Typography
                sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'text.primary', wordBreak: 'break-all', flex: 1, lineHeight: 1.5 }}
              >
                {s.target}
              </Typography>
              <IconButton
                onClick={() => copy(s.target, '已复制到剪贴板')}
                sx={{ width: 30, height: 30, borderRadius: 1.75, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
              >
                <Copy size={15} />
              </IconButton>
            </Stack>
            {labels.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
                  地址标签 (address_label)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                  {labels.map((t) => (
                    <Stack
                      key={t}
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'grey.800',
                        bgcolor: 'secondary.lighter',
                        border: '1px solid',
                        borderColor: 'secondary.light',
                        px: 1.25,
                        py: 0.6,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ color: 'secondary.dark', display: 'inline-flex' }}>
                        <Tag size={13} />
                      </Box>
                      <span>{t}</span>
                    </Stack>
                  ))}
                </Box>
              </Box>
            ) : (
              <Stack direction="row" spacing={0.9} alignItems="center" sx={{ fontSize: 12, color: 'text.disabled' }}>
                <Tag size={13} />
                <span>该地址暂无实体标签 (address_label 为空)</span>
              </Stack>
            )}
          </Box>

          {/* gauge */}
          <Box sx={{ ...cardSx, display: 'flex', gap: 2.75, alignItems: 'center' }}>
            <Box sx={{ position: 'relative', width: 140, height: 140, flex: 'none' }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={R} fill="none" stroke="#E8ECF2" strokeWidth="13" />
                <g transform="rotate(-90 70 70)">
                  <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={lv.gauge}
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={`${dash.toFixed(1)} ${CIRC.toFixed(1)}`}
                  />
                </g>
              </svg>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 38, fontWeight: 700, lineHeight: 1, color: lv.gauge }}>{res.score}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.4 }}>/ 100</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box sx={{ fontSize: 14, fontWeight: 700, color: lv.color, bgcolor: lv.bg, px: 1.6, py: 0.6, borderRadius: 2 }}>
                  {lv.label}
                </Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{lv.range}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ fontSize: 13, color: 'grey.700', lineHeight: 1.5 }}>
                <Box sx={{ mt: '2px', color: 'grey.500', display: 'inline-flex', flex: 'none' }}>
                  <Lightbulb size={15} />
                </Box>
                <span>
                  <b style={{ fontWeight: 600 }}>建议操作：</b>
                  {lv.sugg}
                </span>
              </Stack>
            </Box>
          </Box>

          {/* hacking event */}
          {res.hacking_event && (
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{ bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', borderRadius: 3, px: 2, py: 1.75 }}
            >
              <Box sx={{ color: 'error.dark', display: 'inline-flex', mt: '1px', flex: 'none' }}>
                <AlertTriangle size={18} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'error.dark' }}>关联安全事件</Typography>
                <Typography sx={{ fontSize: 13, color: 'error.darker' }}>{res.hacking_event}</Typography>
              </Box>
            </Stack>
          )}

          {/* detail_list */}
          {res.detail_list.length > 0 && (
            <Box sx={cardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>风险指标 (detail_list)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {res.detail_list.map((d) => (
                  <Stack
                    key={d}
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    sx={{ fontSize: 12, fontWeight: 500, color: 'grey.800', bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider', px: 1.4, py: 0.75, borderRadius: 2 }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main' }} />
                    <span>{d}</span>
                  </Stack>
                ))}
              </Box>
            </Box>
          )}

          {/* risk_detail */}
          {res.risk_detail.length > 0 && (
            <Box sx={cardSx}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>风险敞口溯源 (risk_detail)</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{res.risk_detail.length} 个关联实体</Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {res.risk_detail.map((rd, i) => {
                  const tm = riskTypeMeta(rd.risk_type);
                  const chips: HopChip[] = [];
                  const keys = Object.keys(rd.hop_dic).sort((a, b) => Number(a) - Number(b));
                  keys.forEach((k, ki) => {
                    (rd.hop_dic[k] || []).forEach((addr) => {
                      const isAddr = looksAddr(addr);
                      chips.push({ label: isAddr ? trunc(addr) : addr, full: addr, isAddr, firstInGroup: ki === 0 });
                    });
                  });
                  const expanded = risk.expandedHop === i;
                  const pct = Math.max(1.5, rd.percent);
                  return (
                    <Box key={`${rd.entity}-${i}`} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1.6 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box sx={{ fontSize: 11, fontWeight: 700, color: tm.color, bgcolor: tm.bg, px: 1, py: 0.4, borderRadius: 1.5, flex: 'none' }}>
                          {tm.label}
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rd.entity}
                        </Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: rd.exposure_type === 'direct' ? '#A92926' : 'grey.500' }}>
                          {rd.exposure_type === 'direct' ? '直接敞口' : '间接敞口'}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{rd.hop_num} 跳</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.1 }}>
                        <Box sx={{ flex: 1, height: 7, borderRadius: 999, bgcolor: 'grey.200', overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 999, bgcolor: tm.color }} />
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'grey.800', width: 54, textAlign: 'right' }}>
                          {rd.percent.toFixed(rd.percent < 1 ? 2 : 1)}%
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', width: 96, textAlign: 'right' }}>
                          {fmtUSD(rd.volume)}
                        </Typography>
                      </Stack>
                      <Box
                        component="button"
                        onClick={() => risk.toggleHop(i)}
                        sx={{
                          mt: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.6,
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'primary.main',
                          bgcolor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          p: 0,
                        }}
                      >
                        <Box sx={{ display: 'inline-flex', transition: 'transform .15s', transform: expanded ? 'rotate(90deg)' : 'none' }}>
                          <ArrowRight size={13} />
                        </Box>
                        {expanded ? '收起溯源路径' : '展开溯源路径 (hop_dic)'}
                      </Box>
                      {expanded && (
                        <Box sx={{ mt: 1.25, bgcolor: 'grey.100', borderRadius: 2.5, p: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.9 }}>
                          {chips.map((hop, hi) => (
                            <Box key={hi} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.9 }}>
                              {hi > 0 && (
                                <Box sx={{ color: 'grey.400', display: 'inline-flex' }}>
                                  <ArrowRight size={14} />
                                </Box>
                              )}
                              <Box
                                component="span"
                                onClick={hop.isAddr ? () => copy(hop.full, '已复制完整地址') : undefined}
                                title={hop.isAddr ? '点击复制完整地址' : undefined}
                                sx={{
                                  fontSize: 11,
                                  fontFamily: hop.isAddr ? 'var(--font-mono)' : 'inherit',
                                  px: 1.1,
                                  py: 0.6,
                                  borderRadius: 1.75,
                                  whiteSpace: 'nowrap',
                                  cursor: hop.isAddr ? 'pointer' : 'default',
                                  ...(hop.firstInGroup
                                    ? { bgcolor: tm.bg, color: tm.color, fontWeight: 600 }
                                    : { bgcolor: 'background.paper', color: 'grey.700', border: '1px solid', borderColor: 'divider' }),
                                }}
                              >
                                {hop.label}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* task info */}
          <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.1 }}>任务信息</Typography>
            {metaRows.map((m) => (
              <Stack key={m.label} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', flex: 'none' }}>{m.label}</Typography>
                {m.copyFull ? (
                  <Box
                    component="span"
                    onClick={() => copy(m.copyFull as string, `已复制完整${m.label}`)}
                    title="点击复制完整内容"
                    sx={{
                      fontSize: 12,
                      color: 'primary.main',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      wordBreak: 'break-all',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.6,
                      justifyContent: 'flex-end',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {m.value}
                    <Copy size={13} style={{ flex: 'none' }} />
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 12, color: 'grey.800', fontFamily: 'var(--font-mono)', textAlign: 'right', wordBreak: 'break-all' }}>
                    {m.value}
                  </Typography>
                )}
              </Stack>
            ))}
          </Box>
        </Box>

        {/* footer */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flex: 'none', px: 3, py: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Box
            component="button"
            onClick={() => {
              try {
                window.open(res.risk_report_url, '_blank');
              } catch {
                /* popup blocked */
              }
              toast.show({ title: '正在打开 MistTrack AML 风险报告', tone: 'info' });
            }}
            sx={{
              flex: 1,
              height: 46,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              bgcolor: 'primary.main',
              color: '#fff',
              border: 'none',
              borderRadius: 2.5,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 16px 0 rgba(60,111,245,0.24)',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <Download size={17} />
            下载 AML 风险报告
          </Box>
          <Box
            component="button"
            onClick={() => {
              try {
                window.open(res.risk_report_url, '_blank');
              } catch {
                /* popup blocked */
              }
              toast.show({ title: '正在打开 MistTrack AML 风险报告', tone: 'info' });
            }}
            sx={{
              flex: 'none',
              height: 46,
              px: 2.25,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.9,
              bgcolor: 'background.paper',
              color: 'grey.700',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2.5,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <ExternalLink size={15} />
            MistTrack
          </Box>
        </Stack>
      </Box>
    </>
  );
});
