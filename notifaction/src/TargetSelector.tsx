import { Select, Button } from './ui';
import { IconSearch, IconX, IconUsers, IconDownload } from './icons';
import { ConditionGroup } from './ConditionBuilder';
import type { TargetSelectorValue, QueryResult } from './types';

const TARGET_OPTIONS = [
  { value: 'all', label: '所有商户' },
  { value: 'active', label: '活跃商户' },
  { value: 'new', label: '新注册商户' },
  { value: 'paid', label: '已付费商户' },
  { value: 'churned', label: '流失商户' },
];

interface TargetSelectorProps {
  value: TargetSelectorValue;
  onChange: (v: TargetSelectorValue) => void;
}

export function TargetSelector({ value, onChange }: TargetSelectorProps) {
  const v = value;
  const update = (patch: Partial<TargetSelectorValue>) => onChange({ ...v, ...patch });

  const handleSubmit = () => {
    const hasAny = v.conditionValue?.regEnabled || v.conditionValue?.depositEnabled;
    if (!hasAny) return;
    const seed = JSON.stringify(v.conditionValue ?? {}).length;
    const count = 1200 + (seed * 173) % 8000;
    const samples = Array.from({ length: 5 }, (_, i) =>
      `M${String((seed * (i + 1) * 31) % 1000000).padStart(6, '0')}`
    );
    update({
      queryResult: {
        count,
        sampleIds: samples,
        queriedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
    });
  };

  const handleClear = () => update({ conditionValue: null, queryResult: null });

  const canSubmit = !!(v.conditionValue && (v.conditionValue.regEnabled || v.conditionValue.depositEnabled));

  return (
    <div>
      {/* Method tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 14,
        background: '#F2F3F7', padding: 3, borderRadius: 9, width: 'fit-content',
      }}>
        {[
          { key: 'option' as const, label: '按选项' },
          { key: 'condition' as const, label: '按条件' },
        ].map(t => {
          const active = v.method === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => update({ method: t.key, queryResult: null })}
              style={{
                padding: '7px 16px',
                background: active ? '#fff' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-2)',
                border: 'none', borderRadius: 7,
                fontSize: 13, fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(16,24,40,.08)' : 'none',
                fontFamily: 'inherit', transition: 'all .15s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {v.method === 'option' ? (
        <Select
          value={v.optionValue}
          onChange={optionValue => update({ optionValue })}
          options={TARGET_OPTIONS}
        />
      ) : (
        <div>
          <ConditionGroup
            value={v.conditionValue}
            onChange={conditionValue => update({ conditionValue, queryResult: null })}
            rangeMode="absolute"
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
              icon={<IconSearch size={14} />}
            >
              提交查询
            </Button>
            <Button
              variant="secondary"
              onClick={handleClear}
              icon={<IconX size={14} />}
              disabled={!v.conditionValue}
            >
              清空条件
            </Button>
          </div>

          {v.queryResult && <QueryResultCard result={v.queryResult} />}
        </div>
      )}
    </div>
  );
}

function QueryResultCard({ result }: { result: QueryResult }) {
  return (
    <div style={{
      marginTop: 16,
      background: 'linear-gradient(135deg, #F5F6FF 0%, #FAFBFF 100%)',
      border: '1px solid #D9DDF5', borderRadius: 12, padding: 18,
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: '#fff', border: '1px solid #D9DDF5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary)', flexShrink: 0,
      }}>
        <IconUsers size={22} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
          按照当前筛选条件，共筛选出
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          <span style={{
            fontSize: 28, fontWeight: 700, color: 'var(--primary)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {result.count.toLocaleString()}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>名用户</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>
            查询于 {result.queriedAt}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>商户 ID：</span>
          {result.sampleIds.map(id => (
            <code key={id} style={{
              fontSize: 11, padding: '2px 6px',
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 4, color: 'var(--text-2)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{id}</code>
          ))}
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>等</span>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        icon={<IconDownload size={14} />}
        onClick={() => alert('下载用户信息表（示意）')}
      >
        下载用户表
      </Button>
    </div>
  );
}
