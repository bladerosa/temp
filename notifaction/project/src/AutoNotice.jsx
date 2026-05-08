// AutoNotice: list page + create/edit page
// Creating inherits the content+type structure from normal notice
// Additionally has 通知触发条件 (reg-time + deposit, relative range)

const MOCK_AUTO_LIST = [
{
  id: 'auto_001',
  name: '新用户7日无入金提醒',
  type: 'Email通知',
  enabled: true,
  schedule: '每日 09:00',
  triggerSummary: '注册时间 小于 7天 · 且 最近7天内 入金金额 等于 0 USD',
  totalMatched: 18492,
  lastRunAt: '2026-04-21 09:00:12',
  createdAt: '2026-02-10'
},
{
  id: 'auto_002',
  name: '高价值流失用户召回',
  type: 'Email通知',
  enabled: true,
  schedule: '每周一 10:00',
  triggerSummary: '注册时间 大于 3个月 · 且 最近30天内 入金金额 小于 10.00 USD',
  totalMatched: 3021,
  lastRunAt: '2026-04-21 10:00:04',
  createdAt: '2026-03-02'
},
{
  id: 'auto_003',
  name: '老用户年度感谢',
  type: 'Email通知',
  enabled: false,
  schedule: '每月 1 日 09:00',
  triggerSummary: '注册时间 大于 1年',
  totalMatched: 0,
  lastRunAt: '2026-04-01 09:00:02',
  createdAt: '2026-01-15'
},
{
  id: 'auto_004',
  name: '站内大促活动公告',
  type: '小铃铛',
  enabled: true,
  schedule: '每周五 18:00',
  triggerSummary: '注册时间 大于 7天',
  totalMatched: 5318,
  lastRunAt: '2026-04-17 18:00:01',
  createdAt: '2026-03-20'
},
{
  id: 'auto_005',
  name: '月度服务条款更新提示',
  type: '系统公告',
  enabled: true,
  schedule: '每月 15 日 10:00',
  triggerSummary: '注册时间 大于 30天',
  totalMatched: 12045,
  lastRunAt: '2026-04-15 10:00:03',
  createdAt: '2026-02-28'
}];


function AutoNotice() {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit' | 'history'
  const [editing, setEditing] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [list, setList] = useState(MOCK_AUTO_LIST);

  const updateItem = (id, patch) => {
    setList((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
  };

  if (view === 'history') {
    return (
      <AutoNoticeHistory
        item={viewingHistory}
        onBack={() => {setView('list');setViewingHistory(null);}} />);


  }

  if (view === 'create' || view === 'edit') {
    return (
      <AutoNoticeEditor
        initial={editing}
        onBack={() => {setView('list');setEditing(null);}}
        onSave={(data) => {
          if (view === 'edit' && editing) {
            updateItem(editing.id, data);
          } else {
            setList((prev) => [{
              ...data,
              id: 'auto_' + Date.now(),
              totalMatched: 0,
              lastRunAt: '—',
              createdAt: new Date().toISOString().slice(0, 10),
              enabled: true
            }, ...prev]);
          }
          setView('list');
          setEditing(null);
        }} />);


  }

  return (
    <div>
      <PageHeader
        title="自动通知"
        actions={
        <Button
          variant="primary"
          icon={<IconPlus size={14} />}
          onClick={() => {setEditing(null);setView('create');}}>
          
            新建自动通知
          </Button>
        } />
      

      <div style={{ padding: '0 32px 32px' }}>
        {/* Explainer */}
        <div style={{
          padding: 16,
          background: '#F5F6FF',
          border: '1px solid #D9DDF5',
          borderRadius: 10,
          marginBottom: 20,
          display: 'flex', gap: 12
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#fff', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconZap size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
              工作方式
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>
              系统会按设定频率与时间自动运行检测任务，筛选达到触发条件的用户并发送通知。
              触发条件支持「注册时间」与「入金」两个维度（至少选择其一，同时选择表示"同时满足"）。
            </div>
          </div>
        </div>

        <Card padding={0}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.2fr 2.4fr 0.8fr 0.9fr 1fr',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '.04em',
            gap: 12
          }}>
            <div>名称</div>
            <div>类型</div>
            <div>执行计划</div>
            <div>触发条件</div>
            <div style={{ textAlign: 'right' }}>累计命中</div>
            <div>最近执行</div>
            <div style={{ textAlign: 'right' }}>操作</div>
          </div>

          {list.map((item, idx) =>
          <div key={item.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.2fr 2.4fr 0.8fr 0.9fr 1fr',
            padding: '16px 20px',
            borderBottom: idx === list.length - 1 ? 'none' : '1px solid var(--border)',
            fontSize: 13,
            alignItems: 'center',
            gap: 12,
            background: item.enabled ? '#fff' : '#FAFBFD'
          }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>创建于 {item.createdAt}</div>
              </div>
              <div>
                <Tag color="primary">{item.type}</Tag>
              </div>
              <div style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconClock size={13} stroke="var(--text-3)" />
                {item.schedule}
              </div>
              <div style={{
              color: 'var(--text-2)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5
            }}>
                {item.triggerSummary}
              </div>
              <div style={{
              textAlign: 'right',
              fontWeight: 600,
              color: item.totalMatched > 0 ? 'var(--primary)' : 'var(--text-3)',
              fontFamily: 'var(--font-mono)'
            }}>
                <button
                onClick={() => {setViewingHistory(item);setView('history');}}
                disabled={!item.totalMatched}
                style={{
                  background: 'transparent', border: 'none', padding: 0,
                  font: 'inherit', color: 'inherit',
                  cursor: item.totalMatched > 0 ? 'pointer' : 'default',
                  textDecoration: item.totalMatched > 0 ? 'underline' : 'none',
                  textUnderlineOffset: 2,
                }}>
                
                  {item.totalMatched.toLocaleString()}
                </button>
              </div>
              <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
                {item.lastRunAt}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                <Switch checked={item.enabled} onChange={(on) => updateItem(item.id, { enabled: on })} size="sm" />
                <button
                onClick={() => {setEditing(item);setView('edit');}}
                style={{
                  width: 28, height: 28, border: '1px solid var(--border)', background: '#fff',
                  borderRadius: 6, cursor: 'pointer', color: 'var(--text-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="编辑">
                
                  <IconEdit size={13} />
                </button>
              </div>
            </div>
          )}

          {list.length === 0 &&
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
              暂无自动通知，点击右上角新建
            </div>
          }
        </Card>
      </div>
    </div>);

}

function AutoNoticeEditor({ initial, onBack, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState('email');
  const [title, setTitle] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState('daily'); // daily|weekly|monthly
  const [scheduleDay, setScheduleDay] = useState('1'); // day of week or day of month
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [repeat, setRepeat] = useState('off'); // 'off' | 'on'  重复接收
  const [trigger, setTrigger] = useState({
    regEnabled: true,
    regValue: { op: 'lt', n1: '7', u1: 'day', n2: '', u2: 'day' },
    depositEnabled: false,
    depositValue: null
  });

  const scheduleLabel = () => {
    if (scheduleFreq === 'daily') return `每日 ${scheduleTime}`;
    if (scheduleFreq === 'weekly') {
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      return `每${days[parseInt(scheduleDay, 10) - 1] || '一'} ${scheduleTime}`;
    }
    return `每月 ${scheduleDay} 日 ${scheduleTime}`;
  };

  const triggerSummary = () => {
    const parts = [];
    if (trigger.regEnabled) parts.push(formatRegTime(trigger.regValue, 'relative'));
    if (trigger.depositEnabled) parts.push(formatDeposit(trigger.depositValue, 'relative'));
    return parts.length ? parts.join(' · 且 ') : '未设置触发条件';
  };

  const valid = name.trim() && (trigger.regEnabled || trigger.depositEnabled);

  return (
    <div>
      <PageHeader
        title={initial ? `编辑自动通知 · ${initial.name}` : '新建自动通知'}
        backable
        onBack={onBack}
        actions={
        <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={onBack}>取消</Button>
            <Button
            variant="primary"
            disabled={!valid}
            onClick={() => onSave({
              name,
              type: type === 'email' ? 'Email通知' : type === 'sms' ? '短信通知' : type === 'bell' ? '小铃铛' : type === 'broadcast' ? '系统公告' : '站内通知',
              schedule: scheduleLabel(),
              triggerSummary: triggerSummary(),
              repeat
            })}>
            
              {initial ? '保存' : '创建'}
            </Button>
          </div>
        } />
      

      <div style={{ padding: '0 32px 32px' }}>
        {/* Basic info */}
        <Card padding={24} style={{ marginBottom: 20 }}>
          <SectionTitle>基本信息</SectionTitle>
          <Field label="自动通知名称" required hint="用于后台识别，用户不可见">
            <TextInput value={name} onChange={setName} placeholder="例如：新用户7日无入金提醒" maxLength={50} />
          </Field>
        </Card>

        {/* Trigger condition — the new important section */}
        <Card padding={24} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, background: 'var(--primary)', borderRadius: 2 }} />
              通知触发条件
              <Tag color="primary">核心</Tag>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              每次任务执行时，系统会以此筛选所有当前用户
            </span>
          </div>

          <ConditionGroup
            value={trigger}
            onChange={setTrigger}
            rangeMode="relative" />
          

          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: '#F6F7FB',
            borderRadius: 8,
            fontSize: 12, color: 'var(--text-2)',
            display: 'flex', alignItems: 'start', gap: 8
          }}>
            <IconInfo size={13} stroke="var(--text-3)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div>条件摘要：<span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{triggerSummary()}</span></div>
              <div style={{ marginTop: 4, color: 'var(--text-3)' }}>
                提示：相对时间按任务执行当天计算。例如"最近7天"指任务执行日前推 7 天的区间。
              </div>
            </div>
          </div>
        </Card>

        {/* Execution schedule */}
        <Card padding={24} style={{ marginBottom: 20 }}>
          <SectionTitle>执行计划</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Field label="频率">
              <Select
                value={scheduleFreq}
                onChange={setScheduleFreq}
                options={[
                { value: 'daily', label: '每日' },
                { value: 'weekly', label: '每周' },
                { value: 'monthly', label: '每月' }]
                } />
              
            </Field>
            {scheduleFreq === 'weekly' &&
            <Field label="星期">
                <Select
                value={scheduleDay}
                onChange={setScheduleDay}
                options={[
                { value: '1', label: '周一' }, { value: '2', label: '周二' }, { value: '3', label: '周三' },
                { value: '4', label: '周四' }, { value: '5', label: '周五' }, { value: '6', label: '周六' }, { value: '7', label: '周日' }]
                } />
              
              </Field>
            }
            {scheduleFreq === 'monthly' &&
            <Field label="日期">
                <Select
                value={scheduleDay}
                onChange={setScheduleDay}
                options={Array.from({ length: 28 }).map((_, i) => ({ value: String(i + 1), label: `${i + 1} 日` }))} />
              
              </Field>
            }
            {scheduleFreq === 'daily' && <div />}
            <Field label="执行时间">
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1px solid var(--border)',
                borderRadius: 8, height: 40, background: '#fff',
                padding: '0 12px', gap: 8
              }}>
                <IconClock size={14} stroke="var(--text-3)" />
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', flex: 1, background: 'transparent', color: 'var(--text)' }} />
              </div>
            </Field>
            <Field label="重复接收" hint="开启后，同一用户命中时可再次收到该通知；关闭则每人仅接收一次">
              <Select
                value={repeat}
                onChange={setRepeat}
                options={[
                { value: 'off', label: '关闭' },
                { value: 'on', label: '开启' }]
                } />
              
            </Field>
          </div>
        </Card>

        {/* Notification content (inherited structure from normal notice) */}
        <Card padding={24} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, background: 'var(--primary)', borderRadius: 2 }} />
              通知内容与方式
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>字段与常规通知一致</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="通知类型">
              <Select
                value={type}
                onChange={setType}
                options={[
                { value: 'email', label: 'Email通知' },
                { value: 'sms', label: '短信通知' },
                { value: 'bell', label: '小铃铛' },
                { value: 'broadcast', label: '系统公告' },
                { value: 'inapp', label: '站内通知' }]
                } />
              
            </Field>
            <Field label="邮件发送账号">
              <Select
                value="max"
                onChange={() => {}}
                options={[
                { value: 'max', label: 'max@ccpayment.com' },
                { value: 'noreply', label: 'noreply@ccpayment.com' }]
                } />
              
            </Field>
          </div>

          <Field label="标题">
            <TextInput value={title} onChange={setTitle} placeholder="请输入标题" maxLength={200} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="内容">
              <RichTextPlaceholder />
            </Field>
            <Field label="内容预览">
              <EmailPreviewPlaceholder />
            </Field>
          </div>

          <Field label="通知按钮 (非必填)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1].map((i) =>
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <TextInput placeholder="按钮文案" maxLength={50} />
                  <TextInput placeholder="按钮链接" prefix={<IconLink size={14} />} suffix={<IconCopy size={14} />} />
                </div>
              )}
            </div>
          </Field>
        </Card>
      </div>
    </div>);

}

Object.assign(window, { AutoNotice, AutoNoticeEditor });