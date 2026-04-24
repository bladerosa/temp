import { useState } from 'react';
import type { ReactNode } from 'react';
import { IconChevronRight, IconChevronDown, IconGlobe, IconHelp, IconBell } from './icons';
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
];

interface LayoutProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  children: ReactNode;
}

export function Layout({ active, onNavigate, children }: LayoutProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ notice: true });
  const toggle = (k: string) => setExpanded(e => ({ ...e, [k]: !e[k] }));

  const crumbCurrent = active === 'notice.auto' ? '自动通知' : '常规通知';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-neutral)' }}>
      {/* ================= Sidebar ================= */}
      <aside style={{
        width: 248,
        background: 'var(--bg-paper)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center' }}>
          <img
            src="/ccpayment/assets/logo-withfont.svg"
            alt="CCPayment"
            style={{ height: 26, display: 'block' }}
          />
        </div>

        {/* Section label */}
        <div style={{
          padding: '4px 24px 6px',
          fontSize: 11, fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '1.1px',
        }}>运营后台</div>

        {/* Menu */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 16px' }}>
          {SIDEBAR_ITEMS.map(item => {
            const isNotice = item.key === 'notice';
            const isExpanded = expanded[item.key];
            const hasChildren = !!(item.children && item.children.length);
            const parentActive = isNotice && active.startsWith('notice.');

            return (
              <div key={item.key} style={{ marginBottom: 2 }}>
                <div
                  className="nav-row"
                  onClick={() => hasChildren ? toggle(item.key) : undefined}
                  style={{
                    padding: '9px 12px',
                    fontSize: 13.5,
                    color: parentActive ? 'var(--primary-dark)' : 'var(--text-primary)',
                    fontWeight: parentActive ? 600 : 500,
                    cursor: hasChildren ? 'pointer' : 'default',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: parentActive ? 'var(--primary-lighter)' : 'transparent',
                  }}
                >
                  <span>{item.label}</span>
                  {item.hasSub && (
                    <IconChevronRight
                      size={12}
                      stroke={parentActive ? 'var(--primary)' : 'var(--text-secondary)'}
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease-out' }}
                    />
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <div style={{ paddingLeft: 12, paddingTop: 2, paddingBottom: 4 }}>
                    {item.children!.map(sub => {
                      const isActive = sub.key === active;
                      return (
                        <div
                          key={sub.key}
                          onClick={() => onNavigate(sub.key)}
                          style={{
                            position: 'relative',
                            padding: '8px 12px 8px 20px',
                            fontSize: 13,
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: isActive ? 600 : 500,
                            background: 'transparent',
                            borderRadius: 8,
                            cursor: 'pointer',
                            marginBottom: 1,
                            transition: 'color 120ms ease-out, background 120ms ease-out',
                          }}
                          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)'; }}
                          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >
                          <span style={{
                            position: 'absolute',
                            left: 8, top: '50%', transform: 'translateY(-50%)',
                            width: 4, height: 4, borderRadius: '50%',
                            background: isActive ? 'var(--primary)' : 'var(--grey-400)',
                            transition: 'background 120ms ease-out',
                          }} />
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

        {/* Footer operator card */}
        <div style={{
          margin: 12, padding: 12,
          background: 'var(--bg-subtle)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: 12,
          }}>OP</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>运营同学</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.2, marginTop: 2 }}>Admin · Notifications</div>
          </div>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Appbar */}
        <div style={{
          height: 64,
          background: 'var(--bg-paper)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, color: 'var(--text-secondary)',
          }}>
            <span>通知系统</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{crumbCurrent}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconButton title="Docs"><IconGlobe size={18} /></IconButton>
            <IconButton title="Help"><IconHelp size={18} /></IconButton>
            <IconButton title="Notifications" badge>
              <IconBell size={18} />
            </IconButton>
            <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 8px' }} />
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '4px 14px 4px 4px',
                borderRadius: 9999, cursor: 'pointer',
                transition: 'background 120ms ease-out',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 12,
              }}>OP</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>运营同学</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Admin</div>
              </div>
              <IconChevronDown size={14} stroke="var(--text-secondary)" />
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

interface IconButtonProps {
  children: ReactNode;
  title: string;
  badge?: boolean;
}

function IconButton({ children, title, badge }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: hover ? 'var(--bg-subtle)' : 'transparent',
        border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)',
        display: 'grid', placeItems: 'center',
        position: 'relative',
        transition: 'background 120ms ease-out',
      }}
    >
      {children}
      {badge && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--error)',
          boxShadow: '0 0 0 2px var(--bg-paper)',
        }} />
      )}
    </button>
  );
}
