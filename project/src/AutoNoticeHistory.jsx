// AutoNoticeHistory: per-task history of sent notifications
// Columns: id, 执行通知时间, 通知商户id, 注册时间(相对执行日), 最近x天内入金金额, 通知地址, 通知状态
// Sortable: sentAt (default desc) / regTime / depositAmount
// Filters (toolbar): id / sentAt / merchantId / channel / status

const STATUS_OPTIONS = [
  { value: 'sending', label: '通知中', color: 'warn' },
  { value: 'sent', label: '已通知', color: 'success' },
  { value: 'failed', label: '通知失败', color: 'danger' },
];

const FAIL_REASONS = [
  'SMTP timeout (后端邮件服务连接超时)',
  'Invalid recipient address (邮箱地址不合法)',
  'Rate limit exceeded (发送频率超限)',
];

function generateMockHistory(item) {
  if (!item) return [];
  const count = Math.min(item.totalMatched || 0, 120);
  const out = [];
  const typeIsEmail = item.type === 'Email通知';
  // Non-email types that show the type name as the channel
  const channelByType = item.type;
  for (let i = 0; i < count; i++) {
    const seed = i * 37 + 7;
    const statusRoll = seed % 20;
    const status = statusRoll < 2 ? 'failed' : statusRoll < 4 ? 'sending' : 'sent';
    const dayOffset = Math.floor(i / 6);
    const d = new Date(2026, 3, 21 - dayOffset, 9, (seed % 50), (seed % 59));
    const regDays = 1 + (seed * 3) % 180;
    const amount = ((seed % 1500) / 100).toFixed(2);
    out.push({
      id: `ntf_${String(1000000 + seed * 131).slice(-7)}`,
      sentAt: d.toISOString().slice(0,19).replace('T',' '),
      merchantId: `M${String(seed * 79 % 10000000).padStart(7, '0')}`,
      regTime: `${regDays}天`,
      regDaysSort: regDays,
      depositAmount: `${amount} USD`,
      depositSort: parseFloat(amount),
      channel: typeIsEmail ? `user${seed % 200}@example.com` : channelByType,
      status,
      failReason: status === 'failed' ? FAIL_REASONS[seed % FAIL_REASONS.length] : null,
    });
  }
  return out;
}

function AutoNoticeHistory({ item, onBack }) {
  const allRows = useMemo(() => generateMockHistory(item), [item]);

  // Toolbar filters
  const [filters, setFilters] = useState({
    id: '',
    sentAtStart: '',
    sentAtEnd: '',
    merchantId: '',
    channel: '',
    status: '',
  });
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const resetFilters = () => setFilters({
    id: '', sentAtStart: '', sentAtEnd: '', merchantId: '', channel: '', status: '',
  });
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== '').length;

  // Sort: only sentAt / regTime / depositAmount. Default: sentAt desc.
  const [sort, setSort] = useState({ key: 'sentAt', dir: 'desc' });
  const toggleSort = (key) => {
    setSort(s => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'sentAt' ? 'desc' : 'asc' });
  };

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // Reset to page 1 when filters or sort change
  useEffect(() => { setPage(1); }, [filters, sort, pageSize]);

  const filtered = useMemo(() => {
    let rows = allRows.filter(r => {
      if (filters.id && !r.id.toLowerCase().includes(filters.id.toLowerCase())) return false;
      if (filters.merchantId && !r.merchantId.toLowerCase().includes(filters.merchantId.toLowerCase())) return false;
      if (filters.channel && !r.channel.toLowerCase().includes(filters.channel.toLowerCase())) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.sentAtStart) {
        // compare as date-only (YYYY-MM-DD) vs row's YYYY-MM-DD prefix
        if (r.sentAt.slice(0, 10) < filters.sentAtStart) return false;
      }
      if (filters.sentAtEnd) {
        if (r.sentAt.slice(0, 10) > filters.sentAtEnd) return false;
      }
      return true;
    });
    const { key, dir } = sort;
    const cmp = (a, b) => {
      let va = a[key], vb = b[key];
      if (key === 'regTime') { va = a.regDaysSort; vb = b.regDaysSort; }
      if (key === 'depositAmount') { va = a.depositSort; vb = b.depositSort; }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    };
    return [...rows].sort(cmp);
  }, [allRows, filters, sort]);

  // Stats always reflect the currently-visible rows (= filtered).
  // When no filters active, "总数据" == all rows.
  const stats = useMemo(() => ({
    total: filtered.length,
    sent: filtered.filter(r => r.status === 'sent').length,
    failed: filtered.filter(r => r.status === 'failed').length,
    sending: filtered.filter(r => r.status === 'sending').length,
  }), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  // Deposit column label
  const depositLabel = useMemo(() => {
    const m = (item?.triggerSummary || '').match(/最近(\d+)([天周月年])/);
    return m ? `最近${m[1]}${m[2]}内入金金额` : '入金金额';
  }, [item]);

  const COLS = [
    { key: 'id', label: 'ID', width: 120, sortable: false },
    { key: 'sentAt', label: '执行通知时间', width: 170, sortable: true },
    { key: 'merchantId', label: '通知商户 ID', width: 130, sortable: false },
    { key: 'channel', label: '通知地址', width: 220, sortable: false },
    { key: 'status', label: '通知状态', width: 200, sortable: false },
  ];
  const totalWidth = COLS.reduce((s, c) => s + c.width, 0);

  return (
    <div>
      <PageHeader
        title={
          <span>
            <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 14 }}>自动通知 · 历史记录 / </span>
            {item?.name}
          </span>
        }
        backable
        onBack={onBack}
        actions={
          <Button variant="secondary" size="sm" icon={<IconDownload size={14} />}>
            导出当前列表
          </Button>
        }
      />

      <div style={{ padding: '0 32px 32px' }}>
        {/* summary bar */}
        <div style={{
          display: 'flex', gap: 18, marginBottom: 16, flexWrap: 'wrap',
        }}>
          <StatPill label="总数据" value={stats.total.toLocaleString()} accent hint={activeFilterCount > 0 ? '筛选后统计' : '全部数据'} />
          <StatPill label="成功" value={stats.sent.toLocaleString()} />
          <StatPill label="失败" value={stats.failed.toLocaleString()} tone="danger" />
          <StatPill label="执行中" value={stats.sending.toLocaleString()} tone="warn" />
        </div>

        {/* Filter toolbar */}
        <Card padding={0} style={{ marginBottom: 16 }}>
          <div style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'flex-end', gap: 12,
            flexWrap: 'wrap',
          }}>
            <FilterField label="ID">
              <input
                value={filters.id}
                onChange={e => setF('id', e.target.value)}
                placeholder="ntf_xxxxxxx"
                style={inputStyle(160)}
              />
            </FilterField>
            <FilterField label="执行通知时间">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="date"
                  value={filters.sentAtStart}
                  onChange={e => setF('sentAtStart', e.target.value)}
                  style={inputStyle(150)}
                />
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>至</span>
                <input
                  type="date"
                  value={filters.sentAtEnd}
                  onChange={e => setF('sentAtEnd', e.target.value)}
                  style={inputStyle(150)}
                />
              </div>
            </FilterField>
            <FilterField label="通知商户 ID">
              <input
                value={filters.merchantId}
                onChange={e => setF('merchantId', e.target.value)}
                placeholder="Mxxxxxxx"
                style={inputStyle(140)}
              />
            </FilterField>
            <FilterField label="通知地址">
              <input
                value={filters.channel}
                onChange={e => setF('channel', e.target.value)}
                placeholder={item?.type === 'Email通知' ? 'user@example.com' : '关键词'}
                style={inputStyle(200)}
              />
            </FilterField>
            <FilterField label="通知状态">
              <select
                value={filters.status}
                onChange={e => setF('status', e.target.value)}
                style={{ ...inputStyle(130), appearance: 'auto' }}
              >
                <option value="">全部</option>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FilterField>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeFilterCount > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  已应用 <b style={{ color: 'var(--primary)' }}>{activeFilterCount}</b> 项筛选
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0}>
                重置
              </Button>
            </div>
          </div>
        </Card>

        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: totalWidth }}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: COLS.map(c => `${c.width}px`).join(' '),
                borderBottom: '1px solid var(--border)',
                background: '#FAFBFD',
                fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
                letterSpacing: '.04em',
              }}>
                {COLS.map(col => (
                  <div key={col.key} style={{
                    padding: '12px',
                    display: 'flex', alignItems: 'center', gap: 4,
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }} onClick={() => col.sortable && toggleSort(col.key)}>
                    <span style={{ textTransform: 'uppercase' }}>{col.label}</span>
                    {col.sortable && <SortCaret active={sort.key === col.key} dir={sort.dir} />}
                  </div>
                ))}
              </div>

              {/* Body */}
              {filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
                  {activeFilterCount > 0 ? '暂无匹配的通知记录，可尝试调整筛选条件' : '该自动通知暂未执行'}
                </div>
              ) : pageRows.map((r, idx) => (
                <div key={r.id} style={{
                  display: 'grid',
                  gridTemplateColumns: COLS.map(c => `${c.width}px`).join(' '),
                  borderBottom: idx === pageRows.length - 1 ? 'none' : '1px solid var(--border)',
                  fontSize: 13, alignItems: 'center',
                }}>
                  <CellMono>{r.id}</CellMono>
                  <CellMono muted>{r.sentAt}</CellMono>
                  <CellMono>{r.merchantId}</CellMono>
                  <Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item?.type === 'Email通知' && <IconMail size={12} stroke="var(--text-3)" />}
                      <span style={{
                        fontFamily: item?.type === 'Email通知' ? "'JetBrains Mono', monospace" : 'inherit',
                        fontSize: item?.type === 'Email通知' ? 12 : 13,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{r.channel}</span>
                    </div>
                  </Cell>
                  <Cell>
                    <StatusCell status={r.status} reason={r.failReason} />
                  </Cell>
                </div>
              ))}
            </div>
          </div>

          {filtered.length > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function inputStyle(width) {
  return {
    width,
    height: 32,
    border: '1px solid var(--border)',
    borderRadius: 6,
    fontSize: 13,
    padding: '0 10px',
    background: '#fff',
    color: 'var(--text)',
    fontFamily: 'inherit',
    outline: 'none',
  };
}

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, letterSpacing: '.02em' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Cell({ children, style }) {
  return <div style={{ padding: '12px', color: 'var(--text)', ...style }}>{children}</div>;
}
function CellMono({ children, muted }) {
  return <div style={{
    padding: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: muted ? 'var(--text-2)' : 'var(--text)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  }}>{children}</div>;
}

function SortCaret({ active, dir }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      marginLeft: 2,
      color: active ? 'var(--primary)' : 'var(--text-3)',
      opacity: active ? 1 : 0.55,
    }}>
      <svg width="8" height="5" viewBox="0 0 8 5" style={{ opacity: active && dir === 'asc' ? 1 : 0.4 }}>
        <path d="M4 0l4 5H0z" fill="currentColor" />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" style={{ marginTop: 1, opacity: active && dir === 'desc' ? 1 : 0.4 }}>
        <path d="M4 5L0 0h8z" fill="currentColor" />
      </svg>
    </div>
  );
}

function StatusCell({ status, reason }) {
  const s = STATUS_OPTIONS.find(x => x.value === status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
      <Tag color={s.color}>{s.label}</Tag>
      {reason && (
        <span title={reason} style={{
          fontSize: 11, color: 'var(--danger)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: 160,
        }}>
          {reason}
        </span>
      )}
    </div>
  );
}

function StatPill({ label, value, accent, tone, hint }) {
  const toneColor = tone === 'danger' ? 'var(--danger)'
    : tone === 'warn' ? '#B77A00'
    : accent ? 'var(--primary)' : 'var(--text)';
  const toneBorder = accent ? '#D9DDF5' : 'var(--border)';
  const toneBg = accent ? 'var(--primary-soft)' : '#fff';
  return (
    <div style={{
      padding: '10px 18px',
      background: toneBg,
      border: `1px solid ${toneBorder}`,
      borderRadius: 10,
      minWidth: 130,
    }}>
      <div style={{
        fontSize: 12,
        color: accent ? 'var(--primary)' : 'var(--text-3)',
        marginBottom: 2, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>{label}</span>
        {hint && <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 10,
          background: '#fff', border: '1px solid #D9DDF5', color: 'var(--primary)', fontWeight: 500,
        }}>{hint}</span>}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: toneColor,
        fontFamily: "'JetBrains Mono', monospace",
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { AutoNoticeHistory });

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (p - 1) * pageSize + 1;
  const end = Math.min(p * pageSize, total);

  // Build a compact page list: 1 ... p-1, p, p+1 ... N
  const pages = [];
  const push = (v) => { if (pages[pages.length - 1] !== v) pages.push(v); };
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (p > 3) push('…');
    for (let i = Math.max(2, p - 1); i <= Math.min(totalPages - 1, p + 1); i++) push(i);
    if (p < totalPages - 2) push('…');
    push(totalPages);
  }

  const btn = (disabled) => ({
    minWidth: 30, height: 30, padding: '0 8px',
    border: '1px solid var(--border)',
    background: '#fff',
    borderRadius: 6,
    fontSize: 12, color: disabled ? 'var(--text-3)' : 'var(--text-2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit',
  });
  const activeBtn = {
    ...btn(false),
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#fff',
    fontWeight: 600,
  };

  return (
    <div style={{
      padding: '12px 16px', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
        显示第 <b style={{ color: 'var(--text-2)' }}>{start}–{end}</b> 条，共 <b style={{ color: 'var(--text-2)' }}>{total.toLocaleString()}</b> 条
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={btn(p === 1)} disabled={p === 1} onClick={() => onPageChange(p - 1)}>‹</button>
        {pages.map((pg, i) => pg === '…' ? (
          <span key={`e${i}`} style={{ fontSize: 12, color: 'var(--text-3)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={pg}
            style={pg === p ? activeBtn : btn(false)}
            onClick={() => onPageChange(pg)}
          >
            {pg}
          </button>
        ))}
        <button style={btn(p === totalPages)} disabled={p === totalPages} onClick={() => onPageChange(p + 1)}>›</button>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          style={{
            height: 30, border: '1px solid var(--border)',
            borderRadius: 6, fontSize: 12, padding: '0 6px', background: '#fff',
            color: 'var(--text-2)', fontFamily: 'inherit', outline: 'none', marginLeft: 4,
          }}
        >
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} 条/页</option>)}
        </select>
      </div>
    </div>
  );
}
