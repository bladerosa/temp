import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconChart, IconMegaphone, IconCoin, IconStore, IconBolt, IconLayers,
  IconList, IconShield, IconAd, IconHandshake, IconClipboard, IconWallet,
  IconBell, IconBan, IconMail, IconLog, IconSettings, IconHelp, IconMenu,
  IconChevronRight, IconSearch, IconClose,
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

// ============================================================
// Responsive breakpoints (mobile-first thinking, but expressed as caps):
//   mobile     : ≤767px → drawer pattern (slide-in overlay)
//   tablet/sm  : 768–1279 → collapsed icon-rail sidebar
//   desktop    : ≥1280 → full 280-px sidebar
// ============================================================

const MOBILE_MQ = '(max-width: 767px)';
const TABLET_MAX_MQ = '(max-width: 1279px)';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [openKey, setOpenKey] = useState<SidebarKey | null>(
    location.pathname.startsWith('/collection') ? 'collection' : null,
  );

  // Tablet+desktop collapse state.
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia(TABLET_MAX_MQ).matches,
  );
  // Mobile drawer open/closed (only meaningful on ≤767px).
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Track whether viewport is currently in mobile mode.
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches,
  );

  // Sync state on viewport size changes.
  useEffect(() => {
    const mqTablet = window.matchMedia(TABLET_MAX_MQ);
    const mqMobile = window.matchMedia(MOBILE_MQ);
    const onTablet = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    const onMobile = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      // Always close the drawer when crossing back into desktop/tablet.
      if (!e.matches) setDrawerOpen(false);
    };
    mqTablet.addEventListener('change', onTablet);
    mqMobile.addEventListener('change', onMobile);
    return () => {
      mqTablet.removeEventListener('change', onTablet);
      mqMobile.removeEventListener('change', onMobile);
    };
  }, []);

  // ESC closes drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Auto-close drawer when navigating to a new collection sub-route on mobile.
  useEffect(() => {
    if (isMobile) setDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isCollectionRoute = location.pathname.startsWith('/collection');

  const onHamburger = () => {
    if (isMobile) {
      setDrawerOpen((v) => !v);
    } else {
      setCollapsed((c) => !c);
    }
  };

  // Collapsed visual state only applies in tablet/desktop. Inside mobile drawer
  // the sidebar always shows as full-width (280) to be usable.
  const sidebarClasses = [
    'sidebar',
    !isMobile && collapsed ? 'collapsed' : '',
    isMobile && drawerOpen ? 'drawer-open' : '',
    isMobile ? 'mobile' : '',
  ].filter(Boolean).join(' ');

  const sidebarShowsCollapsedVisuals = !isMobile && collapsed;

  return (
    <div className={`app ${drawerOpen ? 'drawer-open' : ''}`}>
      {/* Backdrop for mobile drawer */}
      {isMobile && drawerOpen && (
        <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} />
      )}

      <aside className={sidebarClasses} aria-hidden={isMobile && !drawerOpen}>
        <div className="brand">
          {sidebarShowsCollapsedVisuals ? (
            <img src="/logo-mark.svg" alt="ccpayment" />
          ) : (
            <img src="/logo.svg" alt="ccpayment" />
          )}
          {/* Mobile drawer close button */}
          {isMobile && (
            <button
              className="drawer-close"
              aria-label="关闭侧栏"
              onClick={() => setDrawerOpen(false)}
            >
              <IconClose size={20} />
            </button>
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
                    className={`nav-item ${!sidebarShowsCollapsedVisuals && isOpen ? 'open' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}
                    onClick={() => {
                      if (sidebarShowsCollapsedVisuals) {
                        setCollapsed(false);
                        setOpenKey(it.key);
                      } else {
                        setOpenKey(isOpen ? null : it.key);
                      }
                    }}
                    title={sidebarShowsCollapsedVisuals ? it.label : undefined}
                  >
                    <it.Icon size={24} className="ico" />
                    <span className="lbl">{it.label}</span>
                    <IconChevronRight size={16} className="chev" />
                  </div>
                  {!sidebarShowsCollapsedVisuals && isOpen && (
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
                title={sidebarShowsCollapsedVisuals ? it.label : undefined}
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
            aria-label={isMobile ? (drawerOpen ? '关闭侧栏' : '打开侧栏') : (collapsed ? '展开侧栏' : '折叠侧栏')}
            title={isMobile ? (drawerOpen ? '关闭侧栏' : '打开侧栏') : (collapsed ? '展开侧栏' : '折叠侧栏')}
            onClick={onHamburger}
          >
            <IconMenu size={20} />
          </button>
          <div className="search">
            <IconSearch size={16}/>
            <input placeholder="搜索任务、地址、订单…" />
          </div>
          <div className="spacer" />
          <button className="iconbtn" title="设置"><IconSettings size={18} /></button>
          <button className="iconbtn iconbtn-help" title="帮助"><IconHelp size={18} /></button>
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
