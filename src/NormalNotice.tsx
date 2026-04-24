import React, { useState } from 'react';
import { Card, Field, Select, TextInput, Button, Checkbox } from './ui';
import { IconLink, IconCopy } from './icons';
import { TargetSelector } from './TargetSelector';
import type { TargetSelectorValue } from './types';

export function NormalNotice() {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<TargetSelectorValue>({
    method: 'option', optionValue: 'all',
    conditionValue: null, queryResult: null,
  });

  return (
    <div>
      <PageHeader title="创建通知/公告" backable />

      <div style={{ padding: '0 32px 32px' }}>
        <Card padding={24} style={{ marginBottom: 24 }}>
          <SectionTitle>通知内容</SectionTitle>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="通知类型">
              <Select value="email" onChange={() => {}} options={[
                { value: 'email', label: 'Email通知' },
                { value: 'sms', label: '短信通知' },
                { value: 'inapp', label: '站内通知' },
              ]} />
            </Field>
            <Field label="邮件发送账号">
              <Select value="max" onChange={() => {}} options={[
                { value: 'max', label: 'max@ccpayment.com' },
                { value: 'noreply', label: 'noreply@ccpayment.com' },
              ]} />
            </Field>
          </div>

          <Field label="标题">
            <TextInput value={title} onChange={setTitle} placeholder="请输入标题" maxLength={200} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="内容"><RichTextPlaceholder /></Field>
            <Field label="内容预览"><EmailPreviewPlaceholder /></Field>
          </div>

          <Field label="通知按钮 (非必填)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1].map(i => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <TextInput placeholder="按钮文案" maxLength={50} />
                  <TextInput placeholder="按钮链接" prefix={<IconLink size={14} />} suffix={<IconCopy size={14} />} />
                </div>
              ))}
            </div>
          </Field>
        </Card>

        <Card padding={24} style={{ marginBottom: 24 }}>
          <SectionTitle>通知目标</SectionTitle>
          <Field label="选择方式">
            <TargetSelector value={target} onChange={setTarget} />
          </Field>
        </Card>

        <Card padding={24}>
          <SectionTitle>发送设置</SectionTitle>
          <Field label="发送时间">
            <Select value="now" onChange={() => {}} options={[
              { value: 'now', label: '立即发送' },
              { value: 'schedule', label: '定时发送' },
            ]} />
          </Field>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <Button variant="secondary">取消</Button>
          <Button variant="primary">创建通知</Button>
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 600, color: 'var(--text)',
      marginBottom: 18, paddingBottom: 12,
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 3, height: 14, background: 'var(--primary)', borderRadius: 2 }} />
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: React.ReactNode;
  backable?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, backable, onBack, actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 32px', background: 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {backable && (
          <button onClick={onBack} style={{
            width: 28, height: 28, border: 'none', background: 'transparent',
            borderRadius: 6, cursor: 'pointer', color: 'var(--text-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ‹
          </button>
        )}
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h1>
      </div>
      {actions}
    </div>
  );
}

function RichTextPlaceholder() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, background: '#fff', overflow: 'hidden', minHeight: 280 }}>
      <div style={{
        display: 'flex', gap: 0, padding: '6px 8px',
        borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap',
      }}>
        {['文件', '编辑', '查看', '插入', '格式', '工具', '表格', '帮助'].map((t, i) => (
          <div key={i} style={{ padding: '3px 8px', cursor: 'default' }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ width: 22, height: 22, background: '#F6F7FB', borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{ width: 22, height: 22, background: '#F6F7FB', borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ minHeight: 150, padding: 16, color: 'var(--text-3)', fontSize: 13 }}>
        按 ⌥0 获取帮助
      </div>
      <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
        0字
      </div>
    </div>
  );
}

function EmailPreviewPlaceholder() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', minHeight: 280, background: '#fff' }}>
      <div style={{
        padding: '28px 20px',
        background: 'linear-gradient(135deg, #E9F3EB 0%, #F0EDF9 100%)',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', background: '#fff', borderRadius: 8,
          fontSize: 15, fontWeight: 600, color: '#2B3A5B',
        }}>
          <span style={{ width: 18, height: 18, background: 'var(--primary)', borderRadius: 4, display: 'inline-block' }} />
          ccpayment
        </div>
      </div>
      <div style={{ padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
          This is an automated message, please do not reply.
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', marginBottom: 12 }}>
          STAY CONNECTED!
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
          <span style={{ width: 20, height: 20, background: '#E9ECFA', borderRadius: 4, display: 'inline-block' }} />
          <span style={{ width: 20, height: 20, background: '#E9ECFA', borderRadius: 4, display: 'inline-block' }} />
          <span style={{ width: 20, height: 20, background: '#E9ECFA', borderRadius: 4, display: 'inline-block' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
          © 2022 - 2024 ccpayment.com. All Rights Reserved.
        </div>
      </div>
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 14 }}>
        <Checkbox checked onChange={() => {}}>无需回复</Checkbox>
        <Checkbox checked onChange={() => {}}>联系图标</Checkbox>
      </div>
    </div>
  );
}
