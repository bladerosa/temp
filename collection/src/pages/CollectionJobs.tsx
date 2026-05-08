import { useEffect, useMemo, useState } from 'react';
import { initialRecords } from '../data/mockData';
import type { CollectionRecord, JobStatus, RecordTrigger } from '../data/types';
import { JOB_STATUS_META } from '../data/types';
import { CHAINS, findChain, findToken, isTrxChain, tokensByChain, TOKENS } from '../data/tokens';
import { CoinBadge, Modal, Pagination, Stat, fmtDateTime, fmtTokenAmount, usd } from '../components/Primitives';
import { useToast } from '../components/Toast';
import {
  IconLayers, IconScale, IconBolt, IconArrowDownCircle, IconLowBattery,
  IconCopy, IconSearch, IconCoin, IconAlert, IconClose, IconChevronRight,
} from '../components/Icon';

const TRIGGER_LABEL: Record<RecordTrigger, { name: string; cls: string }> = {
  auto_large_deposit:  { name: '自动 · 大额充值检测', cls: 'primary' },
  auto_inactive:       { name: '自动 · 地址未活跃',   cls: 'info' },
  auto_balance_check:  { name: '自动 · 地址余额检测', cls: 'success' },
  auto_withdraw_short: { name: '自动 · 提现不足触发', cls: 'warning' },
  manual:              { name: '手动归集',           cls: 'neutral' },
};

export default function CollectionJobs() {
  const toast = useToast();
  const [records, setRecords] = useState<CollectionRecord[]>(initialRecords);
  const [chainFilter, setChainFilter]     = useState<'all' | string>('all');
  const [tokenFilter, setTokenFilter]     = useState<'all' | string>('all');
  const [triggerFilter, setTriggerFilter] = useState<'all' | RecordTrigger>('all');
  const [statusFilter, setStatusFilter]   = useState<'all' | JobStatus>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<CollectionRecord | null>(null);
  const [confirmAbort, setConfirmAbort] = useState<CollectionRecord | null>(null);

  // ===== sorting =====
  const [sort, setSort] = useState<SortState>({ key: 'occurredAt', dir: 'desc' });

  const cycleSort = (key: SortKey) => {
    setSort((cur) => {
      if (!cur || cur.key !== key) return { key, dir: 'desc' };
      if (cur.dir === 'desc') return { key, dir: 'asc' };
      return null; // third click clears
    });
  };

  // ===== pagination — task list =====
  const [jobPage, setJobPage] = useState(1);
  const [jobPageSize, setJobPageSize] = useState(10);

  // ===== pagination — detail modal address list =====
  const [addrPage, setAddrPage] = useState(1);
  const addrPageSize = 10;

  // reset modal pagination whenever a new job opens
  useEffect(() => { setAddrPage(1); }, [detail?.id]);

  const filtered = useMemo(() => records.filter((r) => {
    if (chainFilter !== 'all' && r.chainId !== chainFilter) return false;
    if (tokenFilter !== 'all' && r.tokenId !== tokenFilter) return false;
    if (triggerFilter !== 'all' && r.trigger !== triggerFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!(r.triggerName ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [records, chainFilter, tokenFilter, triggerFilter, statusFilter, search]);

  // Apply sort, then page-slice for display.
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const valueOf = (r: CollectionRecord): number => {
      switch (sort.key) {
        case 'occurredAt':   return Date.parse(r.occurredAt);
        case 'addressCount': return r.addresses.length;
        case 'totalAmount':  return Number(r.totalAmount) || 0;
        case 'totalUsd':     return r.totalUsd ?? -Infinity;
        case 'feeUsd':       return r.feeUsd;
        case 'trx':          return isTrxChain(r.chainId) ? (r.trxConsumed ?? 0) : -Infinity;
        case 'energy':       return isTrxChain(r.chainId) ? (r.energy ?? 0) : -Infinity;
        case 'bandwidth':    return isTrxChain(r.chainId) ? (r.bandwidth ?? 0) : -Infinity;
      }
    };
    return [...filtered].sort((a, b) => (valueOf(a) - valueOf(b)) * dir);
  }, [filtered, sort]);

  const pagedRecords = useMemo(() => {
    const startIdx = (jobPage - 1) * jobPageSize;
    return sorted.slice(startIdx, startIdx + jobPageSize);
  }, [sorted, jobPage, jobPageSize]);

  // Reset to page 1 whenever filters change the result count.
  useEffect(() => { setJobPage(1); }, [chainFilter, tokenFilter, triggerFilter, statusFilter, search, jobPageSize]);

  const stats = useMemo(() => ({
    count: filtered.length,
    totalUsd:  filtered.reduce((s, r) => s + (r.totalUsd ?? 0), 0),
    addresses: filtered.reduce((s, r) => s + r.addresses.length, 0),
    fee:       filtered.reduce((s, r) => s + r.feeUsd, 0),
    energy:    filtered.reduce((s, r) => s + (isTrxChain(r.chainId) ? (r.energy ?? 0) : 0), 0),
    bandwidth: filtered.reduce((s, r) => s + (isTrxChain(r.chainId) ? (r.bandwidth ?? 0) : 0), 0),
    trx:       filtered.reduce((s, r) => s + (isTrxChain(r.chainId) ? (r.trxConsumed ?? 0) : 0), 0),
  }), [filtered]);

  const numFmt = (n: number, dp = 2) =>
    n.toLocaleString('en-US', { maximumFractionDigits: dp, minimumFractionDigits: dp === 0 ? 0 : 0 });

  const abortJob = (id: string) => {
    setRecords((prev) => prev.map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'aborted',
            abortedAt: new Date().toISOString(),
            abortedReason: r.status === 'pending'
              ? '运营人员手动终止；任务尚未开始执行，未发生归集'
              : '运营人员手动终止；任务执行中断',
          }
        : r,
    ));
    setConfirmAbort(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">归集任务</h2>
          <div className="page-sub">汇总自动 / 手动归集任务，每条 token 级原子归集独立成行；可对待执行 / 执行中任务进行终止。</div>
        </div>
      </div>

      <div className="stat-strip">
        <Stat label="任务数"     value={stats.count}             tone="primary" icon={<IconLayers size={18}/>} />
        <Stat label="归集总额"   value={usd(stats.totalUsd)}     tone="success" icon={<IconScale size={18}/>} />
        <Stat label="覆盖地址数" value={stats.addresses}         tone="info"    icon={<IconArrowDownCircle size={18}/>} />
        <Stat label="fee 消耗"   value={usd(stats.fee)}          tone="warning" icon={<IconCoin size={18}/>} />
      </div>
      <div className="stat-strip stat-strip-3">
        <Stat label="能量消耗"   value={numFmt(stats.energy, 0)}    tone="primary" icon={<IconBolt size={18}/>} />
        <Stat label="带宽消耗"   value={numFmt(stats.bandwidth, 0)} tone="info"    icon={<IconLowBattery size={18}/>} />
        <Stat label="trx 消耗"   value={`${numFmt(stats.trx, 2)} TRX`}  tone="warning" icon={<IconCoin size={18}/>} />
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="left">
            <div className="search">
              <IconSearch size={14}/>
              <input placeholder="搜索任务名" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | JobStatus)}>
              <option value="all">全部状态</option>
              {(Object.keys(JOB_STATUS_META) as JobStatus[]).map((k) => (
                <option key={k} value={k}>{JOB_STATUS_META[k].name}</option>
              ))}
            </select>
            <select className="filter-select" value={chainFilter} onChange={(e) => { setChainFilter(e.target.value); setTokenFilter('all'); }}>
              <option value="all">全部 chain</option>
              {CHAINS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="filter-select" value={tokenFilter} onChange={(e) => setTokenFilter(e.target.value)}>
              <option value="all">全部 token</option>
              {(chainFilter === 'all' ? TOKENS : tokensByChain(chainFilter)).map((t) => (
                <option key={t.id} value={t.id}>{findChain(t.chainId)?.name} · {t.symbol}</option>
              ))}
            </select>
            <select className="filter-select" value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value as 'all' | RecordTrigger)}>
              <option value="all">全部触发方式</option>
              {(Object.keys(TRIGGER_LABEL) as RecordTrigger[]).map((k) => (
                <option key={k} value={k}>{TRIGGER_LABEL[k].name}</option>
              ))}
            </select>
          </div>
          <div className="right">
            <span className="muted" style={{ fontSize: 12.5 }}>共 {filtered.length} 条</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <SortableTh sortKey="occurredAt" sort={sort} onSort={cycleSort} style={{ width: 170 }}>归集发生时间</SortableTh>
                <th>触发方式</th>
                <th>chain</th>
                <th>token</th>
                <SortableTh sortKey="addressCount" sort={sort} onSort={cycleSort} align="right">归集地址数</SortableTh>
                <SortableTh sortKey="totalAmount" sort={sort} onSort={cycleSort} align="right">归集总数量</SortableTh>
                <SortableTh sortKey="totalUsd"    sort={sort} onSort={cycleSort} align="right">归集总金额（USD）</SortableTh>
                <SortableTh sortKey="feeUsd"      sort={sort} onSort={cycleSort} align="right">fee 消耗（USD）</SortableTh>
                <SortableTh sortKey="trx"         sort={sort} onSort={cycleSort} align="right">trx 消耗（TRX）</SortableTh>
                <SortableTh sortKey="energy"      sort={sort} onSort={cycleSort} align="right">能量消耗</SortableTh>
                <SortableTh sortKey="bandwidth"   sort={sort} onSort={cycleSort} align="right">带宽消耗</SortableTh>
                <th style={{ width: 90 }}>任务状态</th>
                <th className="actions-head" style={{ width: 110 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedRecords.map((r) => {
                const c = findChain(r.chainId);
                const t = findToken(r.tokenId);
                const canAbort = r.status === 'pending' || r.status === 'running';
                return (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{fmtDateTime(r.occurredAt)}</td>
                    <td>
                      <div className="row gap-8">
                        <span className={`chip ${TRIGGER_LABEL[r.trigger].cls as 'primary'}`}><span className="dot"/>{TRIGGER_LABEL[r.trigger].name}</span>
                      </div>
                      {r.triggerName && r.trigger !== 'manual' && (
                        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{r.triggerName}</div>
                      )}
                    </td>
                    <td>
                      {c && (
                        <span className="coin-cell">
                          <CoinBadge symbol={c.id} color={c.color} size={22}/>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {t && (
                        <span className="coin-cell">
                          <CoinBadge symbol={t.symbol} color={t.color} size={22}/>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{t.symbol}</span>
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {r.addresses.length > 0 ? (
                        <span
                          className="linklike has-chev"
                          onClick={() => setDetail(r)}
                          title="查看归集地址明细"
                        >
                          {r.addresses.length}
                          <IconChevronRight size={12} className="chev" />
                        </span>
                      ) : (
                        <span className="dim">0</span>
                      )}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {fmtTokenAmount(r.totalAmount)}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {r.totalUsd != null ? usd(r.totalUsd) : <span className="dim">-</span>}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{usd(r.feeUsd)}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {isTrxChain(r.chainId) ? numFmt(r.trxConsumed ?? 0, 2) : <span className="dim">-</span>}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {isTrxChain(r.chainId) ? (r.energy ?? 0).toLocaleString() : <span className="dim">-</span>}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {isTrxChain(r.chainId) ? (r.bandwidth ?? 0).toLocaleString() : <span className="dim">-</span>}
                    </td>
                    <td>
                      <span className={`chip ${JOB_STATUS_META[r.status].cls as 'primary'}`}>
                        <span className="dot"/>
                        {r.status === 'running' ? <span className="pulse">{JOB_STATUS_META[r.status].name}</span> : JOB_STATUS_META[r.status].name}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {canAbort ? (
                        <button className="btn ghost sm" style={{ color: 'var(--error-dark)' }} onClick={() => setConfirmAbort(r)}>
                          <IconClose size={14}/> 终止任务
                        </button>
                      ) : (
                        <span className="dim" style={{ fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={13}>
                  <div className="empty">
                    <div className="empty-art"><IconLayers size={32}/></div>
                    <div className="title">暂无任务记录</div>
                    <div className="desc">调整筛选条件后再试。</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <Pagination
            total={filtered.length}
            page={jobPage}
            pageSize={jobPageSize}
            onPageChange={setJobPage}
            onPageSizeChange={setJobPageSize}
          />
        )}
      </div>

      {/* ===== Address detail modal ===== */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="归集地址明细"
        size="lg"
        footer={<><div style={{ flex: 1 }}/><button className="btn ghost" onClick={() => setDetail(null)}>关闭</button></>}
      >
        {detail && (
          <>
            <div className="row gap-12 mb-12" style={{ alignItems: 'center' }}>
              <div className="coin-cell">
                {(() => { const t = findToken(detail.tokenId); const c = findChain(detail.chainId);
                  return t && c ? (
                    <>
                      <CoinBadge symbol={t.symbol} color={t.color} size={36}/>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name} · {t.symbol}</div>
                        <div className="muted" style={{ fontSize: 12 }}>记录 {detail.id} · {fmtDateTime(detail.occurredAt)}</div>
                      </div>
                    </>
                  ) : null; })()}
              </div>
              <div style={{ flex: 1 }}/>
              <span className={`chip ${TRIGGER_LABEL[detail.trigger].cls as 'primary'}`}>
                <span className="dot"/>{TRIGGER_LABEL[detail.trigger].name}
              </span>
              <span className={`chip ${JOB_STATUS_META[detail.status].cls as 'primary'}`}>
                <span className="dot"/>{JOB_STATUS_META[detail.status].name}
              </span>
            </div>

            {detail.status === 'aborted' && detail.abortedReason && (
              <div className="warn-tip mb-12" style={{ background: 'var(--error-lighter)', borderColor: 'var(--error-light)', color: 'var(--error-darker)' }}>
                <IconAlert size={16} className="ico" style={{ color: 'var(--error-dark)' }}/>
                <div>
                  <b>任务已终止</b>
                  {detail.abortedAt && <span className="muted" style={{ fontSize: 11.5, marginLeft: 8 }}>{fmtDateTime(detail.abortedAt)}</span>}
                  <div style={{ marginTop: 4 }}>{detail.abortedReason}</div>
                </div>
              </div>
            )}

            <div className="stat-strip" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <Stat label="覆盖地址数" value={detail.addresses.length} tone="primary" icon={<IconArrowDownCircle size={18}/>}/>
              <Stat label="归集总数量"
                    value={fmtTokenAmount(detail.totalAmount)}
                    tone="info" icon={<IconLayers size={18}/>}/>
              <Stat label="归集总额（USD）"
                    value={detail.totalUsd != null ? usd(detail.totalUsd) : '—'}
                    tone="success" icon={<IconScale size={18}/>}/>
              <Stat label="fee 消耗（USD）"
                    value={usd(detail.feeUsd)}
                    tone="warning" icon={<IconBolt size={18}/>}/>
            </div>

            <div className="section-title mt-16">地址清单</div>
            <div className="addr-list">
              {detail.addresses
                .slice((addrPage - 1) * addrPageSize, (addrPage - 1) * addrPageSize + addrPageSize)
                .map((a, i) => (
                  <div key={(addrPage - 1) * addrPageSize + i} className="addr-item">
                    <div className="addr">{a.address}</div>
                    <div style={{ textAlign: 'right' }}>
                      {a.amountUsd != null && <div className="usd">{usd(a.amountUsd)}</div>}
                      <div className="amount">{fmtTokenAmount(a.amount)} <span className="muted" style={{ fontWeight: 500 }}>{findToken(detail.tokenId)?.symbol}</span></div>
                    </div>
                    <button
                      className="btn ghost icon-only"
                      title="复制地址"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(a.address);
                          toast.show({ title: '地址已复制到剪贴板', tone: 'success', durationMs: 3000 });
                        } catch {
                          toast.show({ title: '复制失败，请手动选择地址', tone: 'error' });
                        }
                      }}
                    >
                      <IconCopy size={14}/>
                    </button>
                  </div>
                ))}
              {detail.addresses.length === 0 && (
                <div className="empty" style={{ padding: '24px 16px' }}>
                  <div className="title">尚无地址</div>
                  <div className="desc">该任务尚未开始执行</div>
                </div>
              )}
            </div>
            {detail.addresses.length > addrPageSize && (
              <Pagination
                total={detail.addresses.length}
                page={addrPage}
                pageSize={addrPageSize}
                onPageChange={setAddrPage}
                variant="compact"
              />
            )}

            {isTrxChain(detail.chainId) && (
              <div className="row gap-16 mt-12">
                <div className="chip neutral"><IconBolt size={12}/> 能量 {(detail.energy ?? 0).toLocaleString()}</div>
                <div className="chip neutral"><IconLowBattery size={12}/> 带宽 {(detail.bandwidth ?? 0).toLocaleString()}</div>
                <div className="chip neutral"><IconCoin size={12}/> trx {(detail.trxConsumed ?? 0).toFixed(2)}</div>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ===== Abort confirm ===== */}
      <Modal
        open={!!confirmAbort}
        onClose={() => setConfirmAbort(null)}
        title="终止归集任务"
        dismissable={false}
        footer={
          <>
            <div style={{ flex: 1 }}/>
            <button className="btn ghost" onClick={() => setConfirmAbort(null)}>取消</button>
            <button className="btn danger" onClick={() => confirmAbort && abortJob(confirmAbort.id)}>
              <IconClose size={14}/> 确认终止
            </button>
          </>
        }
      >
        <div className="warn-tip"><IconAlert size={16} className="ico"/>
          <div>
            将终止任务 <b>{confirmAbort?.id}</b>
            （<b>{findChain(confirmAbort?.chainId ?? '')?.name} · {findToken(confirmAbort?.tokenId ?? '')?.symbol}</b>）。
            {confirmAbort?.status === 'running'
              ? ' 任务执行中可能已对部分地址完成归集，这部分统计信息会保留。'
              : ' 任务尚未开始执行，终止后不会发生归集。'}
          </div>
        </div>
      </Modal>

      <style>{`
        .pulse {
          display: inline-block;
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
      `}</style>
    </>
  );
}

// ===========================================================================
// SortableTh — column header with tri-state sort (none → desc → asc → none)
// ===========================================================================
type SortKey = 'occurredAt' | 'addressCount' | 'totalAmount' | 'totalUsd' | 'feeUsd' | 'trx' | 'energy' | 'bandwidth';
type SortState = { key: SortKey; dir: 'asc' | 'desc' } | null;

function SortableTh({
  sortKey, sort, onSort, align, style, children,
}: {
  sortKey: SortKey;
  sort: SortState;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const isActive = sort?.key === sortKey;
  const dir = isActive ? sort!.dir : null;
  return (
    <th style={{ textAlign: align ?? 'left', ...style }}>
      <button
        type="button"
        className={`th-sort ${isActive ? 'active' : ''} ${align === 'right' ? 'right' : ''}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{children}</span>
        <span className={`sort-arrow ${dir ?? ''}`} aria-hidden="true">
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
            <path d="M3 5L6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="up"/>
            <path d="M3 7L6 10L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="down"/>
          </svg>
        </span>
      </button>
    </th>
  );
}
