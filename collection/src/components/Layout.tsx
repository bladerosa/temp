import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconChart, IconMegaphone, IconCoin, IconStore, IconBolt, IconLayers,
  IconList, IconShield, IconAd, IconHandshake, IconClipboard, IconWallet,
  IconBell, IconBan, IconMail, IconLog, IconSettings, IconHelp, IconMenu,
  IconChevronRight, IconSearch,
} from './Icon';

type SidebarKey =
  | 'dashboard' | 'finance' | 'activity' | 'token-mgmt' | 'merchant' | 'trx-rent'
  | 'tx-query' | 'risk-tx' | 'collection' | 'placement' | 'partnership'
  | 'reconcile' | 'sell-usdt' | 'notify' | 'op-log' | 'ban-ip' | 'mail-list';

type TopItem = {
  key: SidebarKey;
  label: string;
  Icon: typeof IconChart;
  routes?: { label: string; to: string }[];
};

const topItems: TopItem[] = [
  { key: 'dashboard',  label: '数据看板',      Icon: IconChart },
  { key: 'finance',    label: '财务数据看板',  Icon: IconWallet },
  { key: 'activity',   label: '活动中心',      Icon: IconMegaphone },
  { key: 'token-mgmt', label: '代币 / 网络管理', Icon: IconCoin },
  { key: 'merchant',   label: '商户管理',      Icon: IconStore },
  { key: 'trx-rent',   label: 'TRX 能量租赁',  Icon: IconBolt },
  { key: 'tx-query',   label: '交易查询',      Icon: IconList },
  { key: 'risk-tx',    label: '风控交易管理',  Icon: IconShield },
  {
    key: 'collection',
    label: '归集系统',
    Icon: IconLayers,
    routes: [
      { label: '自动归集', to: '/collection/auto' },
      { label: '手动归集', to: '/collection/manual' },
      { label: '归集任务', to: '/collection/jobs' },
    ],
  },
  { key: 'placement',   label: '投放',          Icon: IconAd },
  { key: 'partnership', label: '推广合作',      Icon: IconHandshake },
  { key: 'reconcile',   label: '对账',          Icon: IconClipboard },
  { key: 'sell-usdt',   label: 'Sell USDT 申请', Icon: IconWallet },
  { key: 'notify',      label: '通知系统',      Icon: IconBell },
  { key: 'op-log',      label: '运营系统日志',  Icon: IconLog },
  { key: 'ban-ip',      label: '封禁 IP',       Icon: IconBan },
  { key: 'mail-list',   label: '邮件验证码列表', Icon: IconMail },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [openKey, setOpenKey] = useState<SidebarKey | null>(
    location.pathname.startsWith('/collection') ? 'collection' : null,
  );
  // Auto-collapse on narrow viewports (≤1280px). User can still toggle manually
  // via the hamburger; the next breakpoint crossing will re-sync.
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1280px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1280px)');
    const onChange = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isCollectionRoute = location.pathname.startsWith('/collection');

  return (
    <div className={`app ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand">
          {collapsed ? (
            <img src="/logo-mark.svg" alt="ccpayment" />
          ) : (
            <img src="/logo.svg" alt="ccpayment" />
          )}
        </div>

        <nav className="nav">
          {topItems.map((it) => {
            const isCollection = it.key === 'collection';
            const isOpen = openKey === it.key;
            const hasActiveChild = isCollection && isCollectionRoute;

            if (it.routes) {
              return (
                <div key={it.key}>
                  <div
                    className={`nav-item ${!collapsed && isOpen ? 'open' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}
                    onClick={() => {
                      if (collapsed) {
                        // expand sidebar and open this group
                        setCollapsed(false);
                        setOpenKey(it.key);
                      } else {
                        setOpenKey(isOpen ? null : it.key);
                      }
                    }}
                    title={collapsed ? it.label : undefined}
                  >
                    <it.Icon size={24} className="ico" />
                    <span className="lbl">{it.label}</span>
                    <IconChevronRight size={16} className="chev" />
                  </div>
                  {!collapsed && isOpen && (
                    <div className="nav-children">
                      {it.routes.map((r) => (
                        <NavLink
                          key={r.to}
                          to={r.to}
                          className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                        >
                          {r.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={it.key}
                className="nav-item"
                onClick={() => { /* prototype: non-interactive */ }}
                title={collapsed ? it.label : undefined}
              >
                <it.Icon size={24} className="ico" />
                <span className="lbl">{it.label}</span>
                <IconChevronRight size={16} className="chev" />
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="main">
        <div className="appbar">
          <button
            className="menu-toggle"
            aria-label={collapsed ? '展开侧栏' : '折叠侧栏'}
            title={collapsed ? '展开侧栏' : '折叠侧栏'}
            onClick={() => setCollapsed((c) => !c)}
          >
            <IconMenu size={20} />
          </button>
          <div className="search">
            <IconSearch size={16}/>
            <input placeholder="搜索任务、地址、订单…" />
          </div>
          <div className="spacer" />
          <button className="iconbtn" title="设置"><IconSettings size={18} /></button>
          <button className="iconbtn" title="帮助"><IconHelp size={18} /></button>
          <button className="iconbtn" title="通知">
            <IconBell size={18} />
            <span className="badge"/>
          </button>
          <div className="account">
            <div className="avatar">CC</div>
            <div className="meta">
              <span className="name">CCPay 运营</span>
              <span className="role">Operations · Admin</span>
            </div>
          </div>
        </div>
        <div className="scroll">
          {children}
        </div>
      </main>
    </div>
  );
}
