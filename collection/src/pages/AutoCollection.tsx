import { useMemo, useState } from 'react';
import { initialTasks } from '../data/mockData';
import type {
  AutoTask, BalanceCheckTask, InactiveTask, LargeDepositTask,
  Schedule, TaskType, WithdrawShortTask,
} from '../data/types';
import { TASK_TYPE_META } from '../data/types';
import { findChain, findToken, hasNonConvertible } from '../data/tokens';
import { Modal, Switch, TokenPills, Stat, fmtDateTime } from '../components/Primitives';
import { MultiTokenPicker } from '../components/TokenPicker';
import { ScheduleEditor } from '../components/ScheduleEditor';
import { AmountInput, defaultAmountSpec, formatAmountSpec, isAmountSpecValid } from '../components/AmountInput';
import { useToast } from '../components/Toast';
import {
  IconPlus, IconEdit, IconTrash, IconLayers, IconArrowDownCircle,
  IconClock, IconScale, IconLowBattery, IconChevronRight,
  IconAlert, IconInfo, IconRefresh,
} from '../components/Icon';

type Step = 'pick-type' | 'configure';

const TASK_TYPE_ICON: Record<TaskType, () => JSX.Element> = {
  large_deposit:  () => <IconArrowDownCircle size={16} />,
  inactive:       () => <IconClock size={16} />,
  balance_check:  () => <IconScale size={16} />,
  withdraw_short: () => <IconLowBattery size={16} />,
};

const defaultSchedule: Schedule = { every: 1, unit: 'day', anchorTime: '03:00' };

export default function AutoCollection() {
  const toast = useToast();
  const [tasks, setTasks] = useState<AutoTask[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | TaskType>('all');
  const [editor, setEditor] = useState<{ open: boolean; mode: 'create' | 'edit'; step: Step; draft: AutoTask | null }>({
    open: false, mode: 'create', step: 'pick-type', draft: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AutoTask | null>(null);

  const stats = useMemo(() => {
    const enabled = tasks.filter((t) => t.enabled).length;
    return {
      total: tasks.length,
      enabled,
      disabled: tasks.length - enabled,
      types: new Set(tasks.map((t) => t.type)).size,
    };
  }, [tasks]);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.type === filter);

  // ===== Open / save =====
  const openCreate = () => {
    setEditor({ open: true, mode: 'create', step: 'pick-type', draft: null });
  };
  const openEdit = (t: AutoTask) => {
    setEditor({ open: true, mode: 'edit', step: 'configure', draft: { ...t } });
  };
  const closeEditor = () => {
    setEditor((s) => ({ ...s, open: false }));
    setFormError(null);
  };

  const pickType = (type: TaskType) => {
    const id = 'tk_' + Math.random().toString(36).slice(2, 8);
    const base = { id, name: '', targets: [] as string[], enabled: false, createdAt: new Date().toISOString() };
    let draft: AutoTask;
    if (type === 'large_deposit') {
      draft = {
        ...base, type,
        triggerAmount: defaultAmountSpec(5000),
        cooldown: { value: 1, unit: 'hour' },
      } as LargeDepositTask;
    } else if (type === 'inactive') {
      draft = {
        ...base, type,
        inactiveWindow: { value: 30, unit: 'day' },
        minCollectAmount: defaultAmountSpec(50),
        schedule: { ...defaultSchedule },
      } as InactiveTask;
    } else if (type === 'balance_check') {
      draft = { ...base, type, minCollectAmount: defaultAmountSpec(50), schedule: { ...defaultSchedule } } as BalanceCheckTask;
    } else {
      draft = {
        ...base, type,
        minCollectAmount: defaultAmountSpec(30),
        cooldown: { value: 6, unit: 'hour' },
      } as WithdrawShortTask;
    }
    setEditor({ open: true, mode: 'create', step: 'configure', draft });
  };

  // ===== Validation =====
  const validateDraft = (draft: AutoTask): string | null => {
    if (!draft.name.trim()) return '请填写任务名称';
    if (draft.targets.length === 0) return '至少选择一个目标 chain → token';

    if (draft.type === 'large_deposit') {
      if (!isAmountSpecValid(draft.triggerAmount, draft.targets))
        return '触发金额必须大于 0（每个目标 token 都需填写）';
      if (!(draft.cooldown.value > 0)) return '重复触发最短间隔必须大于 0';
    } else {
      if (!isAmountSpecValid(draft.minCollectAmount, draft.targets))
        return '最小归集金额必须大于 0（每个目标 token 都需填写）';
      if (draft.type === 'withdraw_short' && !(draft.cooldown.value > 0))
        return '重复触发最短间隔必须大于 0';
    }

    // Same-type tasks may not target the same token-id.
    const conflicts: string[] = [];
    for (const tokenId of draft.targets) {
      const dup = tasks.find(
        (t) => t.id !== draft.id && t.type === draft.type && t.targets.includes(tokenId)
      );
      if (dup) {
        const t = findToken(tokenId);
        const c = t ? findChain(t.chainId) : null;
        conflicts.push(`${c?.name}·${t?.symbol}（已被「${dup.name}」占用）`);
      }
    }
    if (conflicts.length > 0) {
      return `同一任务类型下，目标 token 不可重复配置：\n${conflicts.join('；')}`;
    }
    return null;
  };

  const saveDraft = () => {
    const draft = editor.draft;
    if (!draft) return;
    const err = validateDraft(draft);
    if (err) { setFormError(err); return; }
    setFormError(null);
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === draft.id);
      return exists ? prev.map((t) => (t.id === draft.id ? draft : t)) : [draft, ...prev];
    });
    closeEditor();
  };

  // ===== Toggle / delete =====
  const toggle = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        const enabled = !target.enabled;
        toast.show({
          title: `任务「${target.name}」已${enabled ? '启用' : '停用'}`,
          tone: enabled ? 'success' : 'info',
          durationMs: 3000,
        });
      }
      return prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t));
    });
  };
  const remove = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <>
      <div className="page-head">
        <div>
          <h2 className="page-title">自动归集</h2>
          <div className="page-sub">配置定时或事件触发的自动归集任务，命中条件后自动将资产归集到系统热钱包。</div>
        </div>
        <div className="row gap-8">
          <button className="btn outlined sm"><IconRefresh size={14}/> 刷新</button>
          <button className="btn primary" onClick={openCreate}><IconPlus size={16}/> 新建任务</button>
        </div>
      </div>

      <div className="stat-strip">
        <Stat label="总任务数"  value={stats.total}    hint="包含全部类型" tone="primary" icon={<IconLayers size={18}/>} />
        <Stat label="运行中"    value={stats.enabled}  hint={`占比 ${stats.total ? Math.round(stats.enabled / stats.total * 100) : 0}%`} tone="success" icon={<IconScale size={18}/>} />
        <Stat label="已停用"    value={stats.disabled} hint="可在列表内开启" tone="warning" icon={<IconLowBattery size={18}/>} />
        <Stat label="任务类型数" value={stats.types}    hint="共 4 种类型可选" tone="info" icon={<IconClock size={18}/>} />
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="left">
            <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">全部类型</option>
              {(Object.keys(TASK_TYPE_META) as TaskType[]).map((k) => (
                <option key={k} value={k}>{TASK_TYPE_META[k].name}</option>
              ))}
            </select>
            <span className="muted" style={{ fontSize: 12.5 }}>共 {filtered.length} 个任务</span>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>任务</th>
              <th>类型</th>
              <th>目标 chain · token</th>
              <th>关键参数</th>
              <th>下次执行</th>
              <th>状态</th>
              <th style={{ width: 130, textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div className="mono muted" style={{ fontSize: 11 }}>{t.id}</div>
                </td>
                <td>
                  <span className={`chip ${TASK_TYPE_META[t.type].cls as 'primary'}`}>
                    <span className="dot" />{TASK_TYPE_META[t.type].name}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 280 }}>
                    {t.targets.slice(0, 4).map((id) => {
                      const tok = findToken(id);
                      const c = tok ? findChain(tok.chainId) : null;
                      return (
                        <span key={id} className="chip neutral">
                          {c?.name} · {tok?.symbol}
                        </span>
                      );
                    })}
                    {t.targets.length > 4 && (
                      <span className="chip neutral">+{t.targets.length - 4}</span>
                    )}
                  </div>
                </td>
                <td>{renderKeyParams(t)}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {t.type === 'large_deposit' || t.type === 'withdraw_short'
                    ? <span className="muted">事件驱动</span>
                    : t.nextRunAt ? fmtDateTime(t.nextRunAt) : <span className="muted">—</span>}
                </td>
                <td>
                  <div className="row gap-8">
                    <Switch checked={t.enabled} onChange={() => toggle(t.id)} />
                    <span className={`chip ${t.enabled ? 'success' : 'neutral'}`} style={{ fontSize: 11 }}>
                      <span className="dot"/>{t.enabled ? '运行中' : '已停用'}
                    </span>
                  </div>
                </td>
                <td className="actions-cell" style={{ textAlign: 'right' }}>
                  <button className="btn ghost sm" onClick={() => openEdit(t)} title="编辑"><IconEdit size={14}/> 编辑</button>
                  <button className="btn ghost sm" onClick={() => setConfirmDelete(t)} title="删除" style={{ color: 'var(--error-dark)' }}><IconTrash size={14}/></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><div className="empty">
                <div className="empty-art"><IconLayers size={32}/></div>
                <div className="title">暂无任务</div>
                <div className="desc">点击右上角「新建任务」开始配置自动归集。</div>
              </div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Create / edit modal ===== */}
      <Modal
        open={editor.open}
        onClose={closeEditor}
        title={editor.mode === 'create' ? (editor.step === 'pick-type' ? '选择任务类型' : '新建归集任务') : '编辑归集任务'}
        size="lg"
        footer={
          editor.step === 'configure' ? (
            <>
              {editor.mode === 'create' && (
                <button className="btn ghost" onClick={() => setEditor((s) => ({ ...s, step: 'pick-type', draft: null }))}>
                  返回上一步
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn ghost" onClick={closeEditor}>取消</button>
              <button className="btn primary" onClick={saveDraft}>保存任务</button>
            </>
          ) : (
            <>
              <div style={{ flex: 1 }} />
              <button className="btn ghost" onClick={closeEditor}>取消</button>
            </>
          )
        }
      >
        {editor.step === 'pick-type' ? (
          <>
            <div className="muted mb-12" style={{ fontSize: 13 }}>
              选择一种触发方式，下一步将填写该类型的具体参数。允许多种类型并存运行；同类型对同一 chain·token 的配置不可重复。
            </div>
            <div className="type-grid">
              {(Object.keys(TASK_TYPE_META) as TaskType[]).map((k) => {
                const meta = TASK_TYPE_META[k];
                return (
                  <button key={k} className="type-card" onClick={() => pickType(k)}>
                    <div className="row gap-8">
                      <span className="badge">{TASK_TYPE_ICON[k]()}</span>
                      <span className="name">{meta.name}</span>
                      <span style={{ flex: 1 }} />
                      <IconChevronRight size={14} className="muted"/>
                    </div>
                    <div className="desc">{meta.desc}</div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          editor.draft && <>
            <ConfigureForm
              draft={editor.draft}
              onChange={(d) => { setEditor((s) => ({ ...s, draft: d })); if (formError) setFormError(null); }}
            />
            {formError && (
              <div className="form-error mt-12" role="alert">
                <IconAlert size={16} className="ico"/>
                <div style={{ whiteSpace: 'pre-line' }}>{formError}</div>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ===== Delete confirm ===== */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="删除归集任务"
        dismissable={false}
        footer={
          <>
            <div style={{ flex: 1 }} />
            <button className="btn ghost" onClick={() => setConfirmDelete(null)}>取消</button>
            <button className="btn danger" onClick={() => { if (confirmDelete) { remove(confirmDelete.id); setConfirmDelete(null); } }}>确认删除</button>
          </>
        }
      >
        <div className="warn-tip"><IconAlert size={16} className="ico"/>
          <div>
            将删除任务「<b>{confirmDelete?.name}</b>」。删除后该任务的循环执行将立即停止，已发生的归集记录会保留。
          </div>
        </div>
      </Modal>
    </>
  );
}

// ====== sub-components ======

function ConfigureForm({
  draft, onChange,
}: { draft: AutoTask; onChange: (next: AutoTask) => void }) {
  const meta = TASK_TYPE_META[draft.type];

  return (
    <div className="field-grid full" style={{ gap: 18 }}>
      <div className="tip">
        <IconInfo size={16} className="ico"/>
        <div><b>{meta.name}</b> · {meta.desc}</div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>任务名称</label>
          <input
            className="input"
            placeholder="如：稳定币每日余额扫描"
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>任务类型</label>
          <input className="input" value={meta.name} readOnly style={{ background: 'var(--bg-subtle)' }}/>
        </div>
      </div>

      <div className="field">
        <label>目标 chain · token（多选）</label>
        <TokenPills tokenIds={draft.targets} onRemove={(id) => onChange({ ...draft, targets: draft.targets.filter((x) => x !== id) })}/>
        <MultiTokenPicker
          value={draft.targets}
          onChange={(next) => onChange({ ...draft, targets: next })}
        />
      </div>

      {draft.type === 'large_deposit' && (
        <>
          <AmountInput
            label="触发金额"
            targets={draft.targets}
            value={draft.triggerAmount}
            onChange={(s) => onChange({ ...draft, triggerAmount: s } as LargeDepositTask)}
            hint="目标 token 上的入金 ≥ 此金额时立刻归集该笔资产到热钱包。"
          />
          <CooldownField
            value={draft.cooldown}
            onChange={(c) => onChange({ ...draft, cooldown: c } as LargeDepositTask)}
            hint="同一 chain · token 的下一笔大额充值距离上次触发的归集任务完成须超过此时长，否则跳过。"
          />
        </>
      )}

      {draft.type === 'inactive' && (
        <>
          <div className="field-grid">
            <div className="field">
              <label>未活跃时长</label>
              <div className="row gap-8">
                <input
                  type="number" min={1} className="input" style={{ width: 100 }}
                  value={draft.inactiveWindow.value}
                  onChange={(e) => onChange({ ...draft, inactiveWindow: { ...draft.inactiveWindow, value: Math.max(1, Number(e.target.value) || 1) } } as InactiveTask)}
                />
                <select className="select" style={{ width: 110 }}
                  value={draft.inactiveWindow.unit}
                  onChange={(e) => onChange({ ...draft, inactiveWindow: { ...draft.inactiveWindow, unit: e.target.value as InactiveTask['inactiveWindow']['unit'] } } as InactiveTask)}
                >
                  <option value="day">天</option>
                  <option value="week">周</option>
                  <option value="month">月</option>
                </select>
              </div>
              <span className="hint">在此时间范围内地址无任何出入金，则视为「未活跃」。</span>
            </div>
            <AmountInput
              targets={draft.targets}
              value={draft.minCollectAmount}
              onChange={(s) => onChange({ ...draft, minCollectAmount: s } as InactiveTask)}
              hint="仅归集余额 ≥ 此金额的地址。"
            />
          </div>
          <div className="field">
            <label>检测周期</label>
            <ScheduleEditor
              value={draft.schedule}
              onChange={(s) => onChange({ ...draft, schedule: s } as InactiveTask)}
            />
          </div>
        </>
      )}

      {draft.type === 'balance_check' && (
        <>
          <AmountInput
            targets={draft.targets}
            value={draft.minCollectAmount}
            onChange={(s) => onChange({ ...draft, minCollectAmount: s } as BalanceCheckTask)}
            hint="扫描所有地址中目标 token 的余额，达到此金额则归集。"
          />
          <div className="field">
            <label>检测周期</label>
            <ScheduleEditor
              value={draft.schedule}
              onChange={(s) => onChange({ ...draft, schedule: s } as BalanceCheckTask)}
            />
          </div>
        </>
      )}

      {draft.type === 'withdraw_short' && (
        <>
          <AmountInput
            targets={draft.targets}
            value={draft.minCollectAmount}
            onChange={(s) => onChange({ ...draft, minCollectAmount: s } as WithdrawShortTask)}
            hint="仅归集余额 ≥ 此金额的地址。"
          />
          <CooldownField
            value={draft.cooldown}
            onChange={(c) => onChange({ ...draft, cooldown: c } as WithdrawShortTask)}
            hint="上一次归集完成后，需经过此时长才会再次触发本任务。"
          />
          <div className="warn-tip">
            <IconAlert size={16} className="ico"/>
            <div style={{ lineHeight: 1.7 }}>
              <b>触发条件</b>：当系统提现因热钱包余额不足失败，且检测到当前全量地址的「未归集金额」≥ 本次提现金额时，将异步发起一次目标 chain · token 的全地址归集请求。<br/>
              <b>间隔规则</b>：
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>上一次归集任务<b>处理中</b>时，对同 chain · token 的新提现不再触发本任务，<b>永远</b>跳过；</li>
                <li>上一次归集完成后，需经过「重复触发最短间隔」时长，期间内对同 chain · token 的提现直接跳过本任务的检测与执行。</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CooldownField({
  value, onChange, hint,
}: { value: { value: number; unit: 'minute' | 'hour' | 'day' }; onChange: (c: { value: number; unit: 'minute' | 'hour' | 'day' }) => void; hint: string }) {
  return (
    <div className="field" style={{ maxWidth: 360 }}>
      <label>重复触发最短间隔</label>
      <div className="row gap-8">
        <input
          type="number" min={1} className="input" style={{ width: 110 }}
          value={value.value}
          onChange={(e) => onChange({ ...value, value: Math.max(1, Number(e.target.value) || 1) })}
        />
        <select
          className="select" style={{ width: 110 }}
          value={value.unit}
          onChange={(e) => onChange({ ...value, unit: e.target.value as 'minute' | 'hour' | 'day' })}
        >
          <option value="minute">分钟</option>
          <option value="hour">小时</option>
          <option value="day">天</option>
        </select>
      </div>
      <span className="hint">{hint}</span>
    </div>
  );
}

function renderKeyParams(t: AutoTask) {
  if (t.type === 'large_deposit') {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <div><span className="muted">触发金额 </span> <b>{formatAmountSpec(t.triggerAmount, t.targets)}</b></div>
        <div className="muted" style={{ fontSize: 11.5 }}>冷却 {t.cooldown.value} {unitName(t.cooldown.unit)}</div>
      </div>
    );
  }
  if (t.type === 'withdraw_short') {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <div><span className="muted">最小归集 </span> <b>{formatAmountSpec(t.minCollectAmount, t.targets)}</b></div>
        <div className="muted" style={{ fontSize: 11.5 }}>冷却 {t.cooldown.value} {unitName(t.cooldown.unit)}</div>
      </div>
    );
  }
  if (t.type === 'balance_check') {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <div><span className="muted">最小归集 </span> <b>{formatAmountSpec(t.minCollectAmount, t.targets)}</b></div>
        <div className="muted" style={{ fontSize: 11.5 }}>每 {t.schedule.every} {unitName(t.schedule.unit)}@{t.schedule.anchorTime}</div>
      </div>
    );
  }
  // inactive
  return (
    <div style={{ lineHeight: 1.5 }}>
      <div><span className="muted">未活跃</span> <b>{t.inactiveWindow.value} {unitName(t.inactiveWindow.unit)}</b> · <b>{formatAmountSpec(t.minCollectAmount, t.targets)}</b></div>
      <div className="muted" style={{ fontSize: 11.5 }}>每 {t.schedule.every} {unitName(t.schedule.unit)}@{t.schedule.anchorTime}</div>
    </div>
  );
}

function unitName(u: 'minute' | 'hour' | 'day' | 'week' | 'month') {
  return ({ minute: '分钟', hour: '小时', day: '天', week: '周', month: '月' } as const)[u];
}

// satisfy unused-import linter when `hasNonConvertible` is referenced indirectly
void hasNonConvertible;
