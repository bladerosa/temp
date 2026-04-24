// ConditionBuilder: shared by both normal and auto notifications
// Supports: registration time condition + deposit amount condition
// Mode difference: normal=absolute date range, auto=relative range ("last x days/weeks/months/years")

const OPERATOR_OPTIONS = [
  { value: 'lt', label: '小于 (<)' },
  { value: 'gt', label: '大于 (>)' },
  { value: 'eq', label: '等于 (=)' },
  { value: 'between', label: '区间' },
];

const TIME_UNIT_OPTIONS = [
  { value: 'day', label: '天' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

// Reg-time comparison block
// mode='relative': operator + numeric value + unit (day/week/month/year) — relative to "now"
// mode='absolute': start date / end date range
function RegTimeCondition({ value, onChange, mode = 'relative' }) {
  const v = value || (mode === 'absolute'
    ? { mode: 'absolute', startDate: '', endDate: '' }
    : { mode: 'relative', op: 'lt', n1: '', u1: 'month', n2: '', u2: 'month' });
  const update = (patch) => onChange({ ...v, ...patch });

  return (
    <div style={{
      padding: 16,
      background: '#FAFBFD',
      border: '1px dashed var(--border-strong)',
      borderRadius: 8,
    }}>
      {mode === 'absolute' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)', width: 84 }}>注册时间</span>
          <div style={{ flex: 1, minWidth: 160 }}>
            <DateInput value={v.startDate} onChange={startDate => update({ startDate })} />
          </div>
          <span style={{ color: 'var(--text-3)' }}>—</span>
          <div style={{ flex: 1, minWidth: 160 }}>
            <DateInput value={v.endDate} onChange={endDate => update({ endDate })} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>注册时间</span>
          <div style={{ width: 120 }}>
            <Select
              value={v.op}
              onChange={op => update({ op })}
              options={OPERATOR_OPTIONS}
            />
          </div>
          {v.op !== 'between' ? (
            <>
              <div style={{ width: 100 }}>
                <NumberInput value={v.n1} onChange={n1 => update({ n1 })} placeholder="数值" min={0} />
              </div>
              <div style={{ width: 90 }}>
                <Select value={v.u1} onChange={u1 => update({ u1 })} options={TIME_UNIT_OPTIONS} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>(相对执行日)</span>
            </>
          ) : (
            <>
              <div style={{ width: 110 }}>
                <Select
                  value={v.leftOp || 'gt'}
                  onChange={leftOp => update({ leftOp })}
                  options={[
                    { value: 'gt', label: '大于 (>)' },
                    { value: 'gte', label: '大于等于 (≥)' },
                  ]}
                />
              </div>
              <div style={{ width: 80 }}>
                <NumberInput value={v.n1} onChange={n1 => update({ n1 })} placeholder="起始" min={0} />
              </div>
              <div style={{ width: 80 }}>
                <Select value={v.u1} onChange={u1 => update({ u1 })} options={TIME_UNIT_OPTIONS} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>且</span>
              <div style={{ width: 110 }}>
                <Select
                  value={v.rightOp || 'lt'}
                  onChange={rightOp => update({ rightOp })}
                  options={[
                    { value: 'lt', label: '小于 (<)' },
                    { value: 'lte', label: '小于等于 (≤)' },
                  ]}
                />
              </div>
              <div style={{ width: 80 }}>
                <NumberInput value={v.n2} onChange={n2 => update({ n2 })} placeholder="结束" min={0} />
              </div>
              <div style={{ width: 80 }}>
                <Select value={v.u2} onChange={u2 => update({ u2 })} options={TIME_UNIT_OPTIONS} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>(相对执行日)</span>
            </>
          )}
        </div>
      )}
      <ConditionPreview text={formatRegTime(v, mode)} />
    </div>
  );
}

function formatRegTime(v, mode = 'relative') {
  if (!v) return '—';
  const resolvedMode = v.mode || mode;
  if (resolvedMode === 'absolute') {
    if (!v.startDate || !v.endDate) return '请选择注册时间起止日期';
    return `注册时间 在 ${v.startDate} 至 ${v.endDate}`;
  }
  const unitText = (u) => ({day:'天', week:'周', month:'个月', year:'年'})[u] || '';
  if (v.op === 'between') {
    if (!v.n1 || !v.n2) return '请填写完整区间';
    const lo = v.leftOp === 'gte' ? '大于等于' : '大于';
    const ro = v.rightOp === 'lte' ? '小于等于' : '小于';
    return `注册时间 ${lo} ${v.n1}${unitText(v.u1)} 且 ${ro} ${v.n2}${unitText(v.u2)}`;
  }
  if (!v.n1) return '请填写数值';
  const opMap = { lt: '小于', gt: '大于', eq: '等于' };
  return `注册时间 ${opMap[v.op]} ${v.n1}${unitText(v.u1)}`;
}

// Deposit condition: time-range (absolute OR relative) + amount comparison
function DepositCondition({ value, onChange, rangeMode }) {
  // rangeMode: 'absolute' (normal notice) or 'relative' (auto notice)
  const v = value || {
    // absolute
    startDate: '', endDate: '',
    // relative
    recentN: '', recentU: 'day',
    // amount
    op: 'lt', a1: '', a2: '',
  };
  const update = (patch) => onChange({ ...v, ...patch });

  return (
    <div style={{
      padding: 16,
      background: '#FAFBFD',
      border: '1px dashed var(--border-strong)',
      borderRadius: 8,
    }}>
      {/* Time range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)', width: 84 }}>统计时间</span>
        {rangeMode === 'absolute' ? (
          <>
            <div style={{ flex: 1, minWidth: 160 }}>
              <DateInput value={v.startDate} onChange={startDate => update({ startDate })} />
            </div>
            <span style={{ color: 'var(--text-3)' }}>—</span>
            <div style={{ flex: 1, minWidth: 160 }}>
              <DateInput value={v.endDate} onChange={endDate => update({ endDate })} />
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>最近</span>
            <div style={{ width: 100 }}>
              <NumberInput value={v.recentN} onChange={recentN => update({ recentN })} placeholder="数值" min={1} />
            </div>
            <div style={{ width: 90 }}>
              <Select value={v.recentU} onChange={recentU => update({ recentU })} options={TIME_UNIT_OPTIONS} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>(相对执行日)</span>
          </>
        )}
      </div>

      {/* Amount */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>入金金额（相对执行日）</span>
        <div style={{ width: 120 }}>
          <Select value={v.op} onChange={op => update({ op })} options={OPERATOR_OPTIONS} />
        </div>
        {v.op !== 'between' ? (
          <div style={{ width: 180 }}>
            <NumberInput value={v.a1} onChange={a1 => update({ a1 })} placeholder="0.00" min={0} step="0.01" suffix="USD" />
          </div>
        ) : (
          <>
            <div style={{ width: 90 }}>
              <Select
                value={v.leftOp || 'gt'}
                onChange={leftOp => update({ leftOp })}
                options={[
                  { value: 'gt', label: '大于 (>)' },
                  { value: 'gte', label: '大于等于 (≥)' },
                ]}
              />
            </div>
            <div style={{ width: 140 }}>
              <NumberInput value={v.a1} onChange={a1 => update({ a1 })} placeholder="0.00" min={0} step="0.01" suffix="USD" />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>且</span>
            <div style={{ width: 90 }}>
              <Select
                value={v.rightOp || 'lt'}
                onChange={rightOp => update({ rightOp })}
                options={[
                  { value: 'lt', label: '小于 (<)' },
                  { value: 'lte', label: '小于等于 (≤)' },
                ]}
              />
            </div>
            <div style={{ width: 140 }}>
              <NumberInput value={v.a2} onChange={a2 => update({ a2 })} placeholder="0.00" min={0} step="0.01" suffix="USD" />
            </div>
          </>
        )}
      </div>

      <ConditionPreview text={formatDeposit(v, rangeMode)} />
    </div>
  );
}

function formatDeposit(v, rangeMode) {
  if (!v) return '—';
  const unitText = (u) => ({day:'天', week:'周', month:'个月', year:'年'})[u] || '';
  const rangePart = rangeMode === 'absolute'
    ? (v.startDate && v.endDate ? `${v.startDate} 至 ${v.endDate}` : '请选择时间范围')
    : (v.recentN ? `最近 ${v.recentN}${unitText(v.recentU)}内` : '请填写相对时间');

  let amtPart;
  const opMap = { lt: '小于', gt: '大于', eq: '等于' };
  if (v.op === 'between') {
    if (!v.a1 || !v.a2) amtPart = '请填写完整区间';
    else {
      const lo = v.leftOp === 'gte' ? '大于等于' : '大于';
      const ro = v.rightOp === 'lte' ? '小于等于' : '小于';
      // interval bracket notation
      const lb = v.leftOp === 'gte' ? '[' : '(';
      const rb = v.rightOp === 'lte' ? ']' : ')';
      amtPart = `入金金额 ${lo} ${v.a1} USD 且 ${ro} ${v.a2} USD  ${lb}${v.a1}, ${v.a2}${rb}`;
    }
  } else {
    if (!v.a1) amtPart = '请填写金额';
    else amtPart = `入金金额 ${opMap[v.op]} ${v.a1} USD`;
  }
  return `${rangePart} ${amtPart}`;
}

function ConditionPreview({ text }) {
  return (
    <div style={{
      marginTop: 12,
      padding: '8px 12px',
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--text-2)',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <IconInfo size={12} stroke="var(--text-3)" />
      <span style={{ flex: 1 }}>预览：{text}</span>
    </div>
  );
}

// ConditionGroup: combines reg-time + deposit with per-block enable switches
function ConditionGroup({ value, onChange, rangeMode, showHintNone = true }) {
  const v = value || {
    regEnabled: false,
    regValue: null,
    depositEnabled: false,
    depositValue: null,
  };
  const update = (patch) => onChange({ ...v, ...patch });

  const bothOn = v.regEnabled && v.depositEnabled;
  const noneOn = !v.regEnabled && !v.depositEnabled;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ConditionBlock
        title="注册时间条件"
        description="按用户注册距今的时长筛选"
        enabled={v.regEnabled}
        onToggle={(on) => update({ regEnabled: on })}
      >
        {v.regEnabled && (
          <RegTimeCondition
            value={v.regValue}
            onChange={regValue => update({ regValue })}
            mode={rangeMode}
          />
        )}
      </ConditionBlock>

      {bothOn && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '2px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <div style={{
            padding: '3px 12px',
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            fontSize: 12, fontWeight: 600, borderRadius: 10,
            letterSpacing: '.02em',
          }}>AND · 且</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
      )}

      <ConditionBlock
        title="入金条件"
        description={rangeMode === 'absolute' ? '在指定日期区间内的入金金额' : '在相对时间窗口内的入金金额'}
        enabled={v.depositEnabled}
        onToggle={(on) => update({ depositEnabled: on })}
      >
        {v.depositEnabled && (
          <DepositCondition
            value={v.depositValue}
            onChange={depositValue => update({ depositValue })}
            rangeMode={rangeMode}
          />
        )}
      </ConditionBlock>

      {showHintNone && noneOn && (
        <div style={{
          padding: 12,
          background: '#FDF5E6',
          border: '1px solid #F3D98A',
          borderRadius: 8,
          fontSize: 13,
          color: '#8A6A18',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <IconInfo size={14} />
          请至少启用一个条件块
        </div>
      )}
    </div>
  );
}

function ConditionBlock({ title, description, enabled, onToggle, children }) {
  return (
    <div style={{
      border: `1px solid ${enabled ? 'var(--border-strong)' : 'var(--border)'}`,
      borderRadius: 10,
      background: enabled ? '#fff' : '#FAFBFD',
      transition: 'border-color .15s, background .15s',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: enabled ? '1px solid var(--border)' : 'none',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {description}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: enabled ? 'var(--primary)' : 'var(--text-3)', fontWeight: 500 }}>
            {enabled ? '已启用' : '未启用'}
          </span>
          <Switch checked={enabled} onChange={onToggle} size="sm" />
        </div>
      </div>
      {enabled && (
        <div style={{ padding: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  ConditionGroup, RegTimeCondition, DepositCondition, formatRegTime, formatDeposit
});
