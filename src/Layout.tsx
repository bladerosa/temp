import { useState } from 'react';
import type { ReactNode } from 'react';
import { IconChevronRight, IconSettings } from './icons';
import type { NavKey } from './types';

interface SidebarItem {
  key: string;
  label: string;
  hasSub: boolean;
  children?: { key: NavKey; label: string }[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'data', label: '数据看板', hasSub: true },
  { key: 'finance', label: '财务数据看板', hasSub: true },
  { key: 'coin', label: '代币/网络管理', hasSub: true },
  { key: 'merchant', label: '商户管理', hasSub: true },
  { key: 'trx', label: 'TRX 能量租赁', hasSub: false },
  { key: 'tx', label: '交易查询', hasSub: true },
  { key: 'risk', label: '风控交易管理', hasSub: true },
  { key: 'payout', label: '拨款', hasSub: false },
  { key: 'coop', label: '推广合作', hasSub: true },
  { key: 'reco', label: '对账', hasSub: true },
  { key: 'sell', label: 'Sell USDT 申请', hasSub: false },
  {
    key: 'notice', label: '通知系统', hasSub: true,
    children: [
      { key: 'notice.normal', label: '常规通知' },
      { key: 'notice.auto', label: '自动通知' },
    ],
  },
  { key: 'syslog', label: '运营系统日志', hasSub: false },
  { key: 'ip1', label: '', hasSub: false },
  { key: 'ip2', label: '', hasSub: false },
  { key: 'ip3', label: '', hasSub: false },
  { key: 'ip4', label: '', hasSub: false },
  { key: 'email', label: '', hasSub: false },
  { key: 'campaign', label: '', hasSub: true },
];

interface LayoutProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  children: ReactNode;
}

export function Layout({ active, onNavigate, children }: LayoutProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ notice: true });

  const toggle = (k: string) => setExpanded(e => ({ ...e, [k]: !e[k] }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#fff', borderRight: '1px solid var(--border)',
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 22, height: 22, background: 'var(--primary)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>c</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#2B3A5B', letterSpacing: '-.01em' }}>
            ccpayment
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {SIDEBAR_ITEMS.map(item => {
            const isNotice = item.key === 'notice';
            const isExpanded = expanded[item.key];
            const hasChildren = !!(item.children && item.children.length);
            const parentActive = isNotice && active.startsWith('notice.');

            return (
              <div key={item.key} style={{ marginBottom: 1 }}>
                <div
                  onClick={() => hasChildren ? toggle(item.key) : undefined}
                  style={{
                    padding: '7px 12px', fontSize: 13,
                    color: parentActive ? 'var(--text)' : 'var(--text-2)',
                    fontWeight: parentActive ? 600 : 400,
                    cursor: hasChildren ? 'pointer' : 'default',
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span>{item.label}</span>
                  {item.hasSub && (
                    <IconChevronRight
                      size={12}
                      stroke="var(--text-3)"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
                    />
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <div style={{ paddingLeft: 18, marginBottom: 4 }}>
                    {item.children!.map(sub => {
                      const isActive = sub.key === active;
                      return (
                        <div
                          key={sub.key}
                          onClick={() => onNavigate(sub.key)}
                          style={{
                            padding: '7px 12px', fontSize: 13,
                            color: isActive ? 'var(--primary)' : 'var(--text-2)',
                            fontWeight: isActive ? 600 : 400,
                            background: isActive ? 'var(--sidebar-active)' : 'transparent',
                            borderRadius: 6, cursor: 'pointer', marginBottom: 1,
                            transition: 'background .12s',
                          }}
                          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#F6F7FB'; }}
                          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >
                          {sub.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          height: 56, background: '#fff', borderBottom: '1px solid var(--border)',
          padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
            <span>通知系统</span>
            <span>/</span>
            <span style={{ color: 'var(--text)' }}>{active === 'notice.auto' ? '自动通知' : '常规通知'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer', color: 'var(--text-2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconSettings size={18} />
            </button>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6EA3FF, #9B7DFF)',
            }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
