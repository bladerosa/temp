import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Plus,
  ArrowDown,
  ChevronRight,
  Trash2,
  Pencil,
  AlertCircle,
  Download,
  RefreshCw,
  Scale,
  Clock,
  ArrowLeftRight,
} from 'lucide-react';
import {
  TASK_TYPE_META,
  type AutoTask,
  type BalanceCheckTask,
  type Cooldown,
  type InactiveTask,
  type LargeDepositTask,
  type Schedule,
  type TaskType,
  type WithdrawShortTask,
} from '@/data/types';
import { findChain, findToken } from '@/data/tokens';
import { useStores } from '@/stores';
import { MultiTokenPicker } from '@/components/TokenPicker';
import ScheduleEditor from '@/components/ScheduleEditor';
import {
  AmountInput,
  defaultAmountSpec,
  formatAmountSpec,
  isAmountSpecValid,
} from '@/components/AmountInput';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { TableCard, TableToolbar } from '@/components/TableCard';
import CryptoBadge from '@/components/CryptoBadge';
import { fmtDateTime, unitName } from '@/utils/format';

type Step = 'pick-type' | 'configure';

const TASK_TYPE_ICON: Record<TaskType, React.ReactElement> = {
  large_deposit: <ArrowDown size={18} />,
  inactive: <Clock size={18} />,
  balance_check: <Scale size={18} />,
  withdraw_short: <ArrowLeftRight size={18} />,
};

const TASK_TYPE_TONE: Record<TaskType, 'primary' | 'info' | 'success' | 'warning'> = {
  large_deposit: 'primary',
  inactive: 'info',
  balance_check: 'success',
  withdraw_short: 'warning',
};

const defaultSchedule: Schedule = { every: 1, unit: 'day', anchorTime: '03:00' };

const AutoCollection = observer(function AutoCollection() {
  const { collection, ui, toast } = useStores();
  const tasks = collection.tasks;

  const [filter, setFilter] = useState<'all' | TaskType>('all');
  const [editor, setEditor] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    step: Step;
    draft: AutoTask | null;
  }>({ open: false, mode: 'create', step: 'pick-type', draft: null });
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
  const openCreate = () =>
    setEditor({ open: true, mode: 'create', step: 'pick-type', draft: null });
  const openEdit = (t: AutoTask) =>
    setEditor({ open: true, mode: 'edit', step: 'configure', draft: { ...t } });
  const closeEditor = () => {
    setEditor((s) => ({ ...s, open: false }));
    setFormError(null);
  };

  const pickType = (type: TaskType) => {
    const id = 'tk_' + Math.random().toString(36).slice(2, 8);
    const base = {
      id,
      name: '',
      targets: [] as string[],
      enabled: false,
      createdAt: new Date().toISOString(),
    };
    let draft: AutoTask;
    if (type === 'large_deposit') {
      draft = {
        ...base,
        type,
        triggerAmount: defaultAmountSpec(5000),
        cooldown: { value: 1, unit: 'hour' },
      } as LargeDepositTask;
    } else if (type === 'inactive') {
      draft = {
        ...base,
        type,
        inactiveWindow: { value: 30, unit: 'day' },
        minCollectAmount: defaultAmountSpec(50),
        schedule: { ...defaultSchedule },
      } as InactiveTask;
    } else if (type === 'balance_check') {
      draft = {
        ...base,
        type,
        minCollectAmount: defaultAmountSpec(50),
        schedule: { ...defaultSchedule },
      } as BalanceCheckTask;
    } else {
      draft = {
        ...base,
        type,
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
      if (draft.type === 'inactive' || draft.type === 'balance_check') {
        if (!(draft.schedule.every >= 1)) return '检测周期必须 ≥ 1';
      }
    }

    // Same-type tasks may not target the same token-id.
    const conflicts: string[] = [];
    for (const tokenId of draft.targets) {
      const dup = tasks.find(
        (t) => t.id !== draft.id && t.type === draft.type && t.targets.includes(tokenId),
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

  const saveDraft = async () => {
    const draft = editor.draft;
    if (!draft) return;
    const err = validateDraft(draft);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    try {
      if (editor.mode === 'create') {
        await collection.addTask(draft);
        toast.show({ title: '任务已创建', tone: 'success' });
      } else {
        await collection.updateTask(draft);
        toast.show({ title: '任务已更新', tone: 'success' });
      }
      closeEditor();
    } catch {
      toast.show({ title: '保存失败，请重试', tone: 'error' });
    }
  };

  // ===== Toggle / delete =====
  const toggle = async (t: AutoTask) => {
    const next = !t.enabled;
    try {
      await collection.toggleEnabled(t.id, next);
      toast.show({
        title: `任务「${t.name}」已${next ? '启用' : '停用'}`,
        tone: next ? 'success' : 'info',
        duration: 3000,
      });
    } catch {
      toast.show({ title: '切换失败，请重试', tone: 'error' });
    }
  };

  const remove = async (t: AutoTask) => {
    try {
      await collection.deleteTask(t.id);
      toast.show({ title: `任务「${t.name}」已删除`, tone: 'info' });
    } catch {
      toast.show({ title: '删除失败，请重试', tone: 'error' });
    }
    setConfirmDelete(null);
  };

  return (
    <Container maxWidth={ui.themeStretch ? false : 'xl'} disableGutters>
      <Stack spacing={4}>
        <PageHeader
          crumbs={[{ label: '归集系统' }, { label: '自动归集' }]}
          title="自动归集"
          subtitle="配置定时或事件触发的自动归集任务，命中条件后自动将资产归集到系统热钱包。"
          action={
            <Stack direction="row" alignItems="center" gap={2}>
              <Tooltip title="刷新">
                <IconButton onClick={() => collection.loadAll()}>
                  <RefreshCw />
                </IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<Plus />} onClick={openCreate}>
                创建归集任务
              </Button>
            </Stack>
          }
        />


        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 5,
          }}
        >
          <StatCard
            tone="lead"
            label="总任务数"
            value={stats.total}
            hint="包含全部 4 种触发类型"
          />
          <StatCard
            label="运行中"
            value={stats.enabled}
            hint={`占比 ${stats.total ? Math.round((stats.enabled / stats.total) * 100) : 0}%`}
          />
          <StatCard
            label="已停用"
            value={stats.disabled}
            hint="可在列表内开启"
          />
          <StatCard
            label="任务类型数"
            value={stats.types}
            hint="共 4 种类型可选"
          />
        </Box>

        {/* Table */}
        <TableCard>
          <TableToolbar
            left={
              <>
                <Typography sx={{ fontSize: 16, fontWeight: 700 }}>归集任务列表</Typography>
                <Select
                  size="small"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | TaskType)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="all">全部类型</MenuItem>
                  {(Object.keys(TASK_TYPE_META) as TaskType[]).map((k) => (
                    <MenuItem key={k} value={k}>
                      {TASK_TYPE_META[k].name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary">
                  共 {filtered.length} 个任务
                </Typography>
              </>
            }
            right={
              <>
                <Tooltip title="刷新">
                  <IconButton>
                    <RefreshCw />
                  </IconButton>
                </Tooltip>
                <Tooltip title="导出">
                  <IconButton>
                    <Download />
                  </IconButton>
                </Tooltip>
              </>
            }
          />

          {filtered.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                icon={<Clock size={36} />}
                title="暂无任务"
                desc="点击右上角「创建归集任务」开始配置自动归集。"
              />
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 220 }}>任务</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>目标 chain · token</TableCell>
                    <TableCell>关键参数</TableCell>
                    <TableCell>上次执行</TableCell>
                    <TableCell>下次执行</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell align="right" sx={{ width: 130 }}>
                      操作
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {t.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace' }}
                        >
                          {t.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={TASK_TYPE_TONE[t.type]}
                          label={TASK_TYPE_META[t.type].name}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ maxWidth: 320 }}>
                          {t.targets.slice(0, 4).map((id) => {
                            const tok = findToken(id);
                            const c = tok ? findChain(tok.chainId) : null;
                            return (
                              <Chip
                                key={id}
                                size="small"
                                icon={
                                  tok ? (
                                    <CryptoBadge
                                      symbol={tok.symbol}
                                      color={tok.color}
                                      size={16}
                                    />
                                  ) : undefined
                                }
                                label={`${c?.name} · ${tok?.symbol}`}
                              />
                            );
                          })}
                          {t.targets.length > 4 && (
                            <Chip size="small" label={`+${t.targets.length - 4}`} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{renderKeyParams(t)}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace' }}>
                        {t.lastRunAt ? (
                          fmtDateTime(t.lastRunAt)
                        ) : (
                          <Typography component="span" color="text.disabled" sx={{ fontSize: 12 }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace' }}>
                        {t.type === 'large_deposit' || t.type === 'withdraw_short' ? (
                          <Typography variant="caption" color="text.secondary">
                            事件驱动
                          </Typography>
                        ) : t.nextRunAt ? (
                          fmtDateTime(t.nextRunAt)
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Switch checked={t.enabled} onChange={() => toggle(t)} size="small" />
                          <Chip
                            size="small"
                            color={t.enabled ? 'success' : 'default'}
                            label={t.enabled ? '运行中' : '已停用'}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(t)} title="编辑">
                          <Pencil size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setConfirmDelete(t)}
                          title="删除"
                          sx={{ color: 'error.main' }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TableCard>
      </Stack>

      {/* ===== Create / edit dialog ===== */}
      <Dialog open={editor.open} onClose={closeEditor} fullWidth maxWidth="md">
        <DialogTitle>
          {editor.mode === 'create'
            ? editor.step === 'pick-type'
              ? '选择任务类型'
              : '新建归集任务'
            : '编辑归集任务'}
        </DialogTitle>
        <DialogContent dividers>
          {editor.step === 'pick-type' ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                选择一种触发方式，下一步将填写该类型的具体参数。允许多种类型并存运行；同类型对同一
                chain·token 的配置不可重复。
              </Typography>
              <Grid container spacing={2}>
                {(Object.keys(TASK_TYPE_META) as TaskType[]).map((k) => {
                  const meta = TASK_TYPE_META[k];
                  return (
                    <Grid item xs={12} sm={6} key={k}>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => pickType(k)}
                        sx={{
                          width: '100%',
                          textAlign: 'left',
                          backgroundColor: 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 3,
                          cursor: 'pointer',
                          transition: 'all .15s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              backgroundColor: `${TASK_TYPE_TONE[k]}.lighter`,
                              color: `${TASK_TYPE_TONE[k]}.dark`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {TASK_TYPE_ICON[k]}
                          </Box>
                          <Typography variant="subtitle2">
                            {meta.name}
                          </Typography>
                          <Box sx={{ flex: 1 }} />
                          <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
                            <ChevronRight size={18} />
                          </Box>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {meta.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          ) : (
            editor.draft && (
              <>
                <ConfigureForm
                  draft={editor.draft}
                  onChange={(d) => {
                    setEditor((s) => ({ ...s, draft: d }));
                    if (formError) setFormError(null);
                  }}
                />
                {formError && (
                  <Alert severity="error" icon={<AlertCircle />} sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                    {formError}
                  </Alert>
                )}
              </>
            )
          )}
        </DialogContent>
        <DialogActions>
          {editor.step === 'configure' && editor.mode === 'create' && (
            <Button
              onClick={() => setEditor((s) => ({ ...s, step: 'pick-type', draft: null }))}
              color="inherit"
            >
              返回上一步
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={closeEditor} color="inherit">
            取消
          </Button>
          {editor.step === 'configure' && (
            <Button onClick={saveDraft} variant="contained">
              保存任务
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ===== Delete confirm ===== */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="删除归集任务"
        confirmText="确认删除"
        tone="error"
        dismissable={false}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
        body={
          <Alert severity="warning">
            将删除任务「<b>{confirmDelete?.name}</b>
            」。删除后该任务的循环执行将立即停止，已发生的归集记录会保留。
          </Alert>
        }
      />
    </Container>
  );
});

// ============ ConfigureForm ============

function ConfigureForm({
  draft,
  onChange,
}: {
  draft: AutoTask;
  onChange: (next: AutoTask) => void;
}) {
  const meta = TASK_TYPE_META[draft.type];

  return (
    <Stack spacing={3}>
      <Alert severity="info" icon={<AlertCircle />}>
        <b>{meta.name}</b> · {meta.desc}
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            任务名称
          </Typography>
          <TextField
            fullWidth
            placeholder="如：稳定币每日余额扫描"
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            任务类型
          </Typography>
          <TextField
            fullWidth
            value={meta.name}
            InputProps={{ readOnly: true }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'grey.100' } }}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          目标 chain · token（多选）
        </Typography>
        <MultiTokenPicker
          selected={draft.targets}
          onChange={(next) => onChange({ ...draft, targets: next })}
        />
      </Box>

      {draft.type === 'large_deposit' && (
        <>
          <AmountInput
            label="触发金额"
            targets={draft.targets}
            value={draft.triggerAmount}
            onChange={(s) => onChange({ ...draft, triggerAmount: s } as LargeDepositTask)}
            helperText="目标 token 上的入金 ≥ 此金额时立刻归集该笔资产到热钱包。"
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
          <AmountInput
            targets={draft.targets}
            value={draft.minCollectAmount}
            onChange={(s) => onChange({ ...draft, minCollectAmount: s } as InactiveTask)}
            helperText="仅归集余额 ≥ 此金额的地址。"
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              检测周期
            </Typography>
            <ScheduleEditor
              value={draft.schedule}
              onChange={(s) => onChange({ ...draft, schedule: s } as InactiveTask)}
              inactiveWindow={draft.inactiveWindow}
              onInactiveWindowChange={(w) =>
                onChange({ ...draft, inactiveWindow: w } as InactiveTask)
              }
            />
          </Box>
        </>
      )}

      {draft.type === 'balance_check' && (
        <>
          <AmountInput
            targets={draft.targets}
            value={draft.minCollectAmount}
            onChange={(s) => onChange({ ...draft, minCollectAmount: s } as BalanceCheckTask)}
            helperText="扫描所有地址中目标 token 的余额，达到此金额则归集。"
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              检测周期
            </Typography>
            <ScheduleEditor
              value={draft.schedule}
              onChange={(s) => onChange({ ...draft, schedule: s } as BalanceCheckTask)}
            />
          </Box>
        </>
      )}

      {draft.type === 'withdraw_short' && (
        <>
          <AmountInput
            targets={draft.targets}
            value={draft.minCollectAmount}
            onChange={(s) => onChange({ ...draft, minCollectAmount: s } as WithdrawShortTask)}
            helperText="仅归集余额 ≥ 此金额的地址。"
          />
          <CooldownField
            value={draft.cooldown}
            onChange={(c) => onChange({ ...draft, cooldown: c } as WithdrawShortTask)}
            hint="上一次归集完成后，需经过此时长才会再次触发本任务。"
          />
          <Alert severity="warning">
            <Box sx={{ lineHeight: 1.7 }}>
              <b>触发条件</b>
              ：当系统提现因热钱包余额不足失败，且检测到当前全量地址的「未归集金额」≥
              本次提现金额时，将异步发起一次目标 chain · token 的全地址归集请求。
              <br />
              <b>间隔规则</b>：
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>
                  上一次归集任务<b>处理中</b>时，对同 chain · token 的新提现不再触发本任务，
                  <b>永远</b>跳过；
                </li>
                <li>
                  上一次归集完成后，需经过「重复触发最短间隔」时长，期间内对同 chain · token
                  的提现直接跳过本任务的检测与执行。
                </li>
              </ul>
            </Box>
          </Alert>
        </>
      )}
    </Stack>
  );
}

function CooldownField({
  value,
  onChange,
  hint,
}: {
  value: Cooldown;
  onChange: (c: Cooldown) => void;
  hint: string;
}) {
  return (
    <Box sx={{ maxWidth: 380 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        重复触发最短间隔
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          type="number"
          size="small"
          value={value.value}
          onChange={(e) => onChange({ ...value, value: Math.max(1, Number(e.target.value) || 1) })}
          inputProps={{ min: 1 }}
          sx={{ width: 110 }}
        />
        <TextField
          select
          size="small"
          value={value.unit}
          onChange={(e) => onChange({ ...value, unit: e.target.value as Cooldown['unit'] })}
          sx={{ width: 110 }}
        >
          <MenuItem value="minute">分钟</MenuItem>
          <MenuItem value="hour">小时</MenuItem>
          <MenuItem value="day">天</MenuItem>
        </TextField>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
        {hint}
      </Typography>
    </Box>
  );
}

function renderKeyParams(t: AutoTask) {
  if (t.type === 'large_deposit') {
    return (
      <Box sx={{ lineHeight: 1.5 }}>
        <Box>
          <Typography component="span" variant="caption" color="text.secondary">
            触发金额{' '}
          </Typography>
          <Box component="b" sx={{ fontSize: 13 }}>
            {formatAmountSpec(t.triggerAmount, t.targets)}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          冷却 {t.cooldown.value} {unitName(t.cooldown.unit)}
        </Typography>
      </Box>
    );
  }
  if (t.type === 'withdraw_short') {
    return (
      <Box sx={{ lineHeight: 1.5 }}>
        <Box>
          <Typography component="span" variant="caption" color="text.secondary">
            最小归集{' '}
          </Typography>
          <Box component="b" sx={{ fontSize: 13 }}>
            {formatAmountSpec(t.minCollectAmount, t.targets)}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          冷却 {t.cooldown.value} {unitName(t.cooldown.unit)}
        </Typography>
      </Box>
    );
  }
  if (t.type === 'balance_check') {
    return (
      <Box sx={{ lineHeight: 1.5 }}>
        <Box>
          <Typography component="span" variant="caption" color="text.secondary">
            最小归集{' '}
          </Typography>
          <Box component="b" sx={{ fontSize: 13 }}>
            {formatAmountSpec(t.minCollectAmount, t.targets)}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          ≥ 每 {t.schedule.every} {unitName(t.schedule.unit)} / {t.schedule.anchorTime}
        </Typography>
      </Box>
    );
  }
  // inactive
  return (
    <Box sx={{ lineHeight: 1.5 }}>
      <Box>
        <Typography component="span" variant="caption" color="text.secondary">
          未活跃{' '}
        </Typography>
        <Box component="b" sx={{ fontSize: 13 }}>
          {t.inactiveWindow.value}
          {unitName(t.inactiveWindow.unit)}
        </Box>{' '}
        ·{' '}
        <Box component="b" sx={{ fontSize: 13 }}>
          {formatAmountSpec(t.minCollectAmount, t.targets)}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        每 {t.schedule.every} {unitName(t.schedule.unit)} / {t.schedule.anchorTime}
      </Typography>
    </Box>
  );
}

export default AutoCollection;
