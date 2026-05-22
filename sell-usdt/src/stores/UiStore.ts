import { makeAutoObservable } from 'mobx';

/**
 * 「确认付款」后等待用户确认的自动确认超时（天）。生产环境从系统后台
 * 配置读取，此处镜像当前后台写死的值。
 */
export const AUTO_CONFIRM_TIMEOUT_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

export class UiStore {
  drawerOpen = false;
  expandedSidebar: Record<string, boolean> = { merchant: true, n_token: true };
  /**
   * 待供应商付款 行已提交「确认付款」凭证后进入「等待用户确认」过渡态。
   * 每条记录的 markedAt 是凭证提交时刻；剩余倒计时 = markedAt +
   * AUTO_CONFIRM_TIMEOUT_DAYS × 24h − now。
   */
  paidPendingConfirm: Record<string, { markedAt: number }> = {};

  constructor() {
    makeAutoObservable(this);
  }

  toggleDrawer = () => {
    this.drawerOpen = !this.drawerOpen;
  };

  closeDrawer = () => {
    this.drawerOpen = false;
  };

  toggleGroup = (key: string) => {
    this.expandedSidebar = {
      ...this.expandedSidebar,
      [key]: !this.expandedSidebar[key],
    };
  };

  isGroupExpanded = (key: string) => !!this.expandedSidebar[key];

  markPaidPending = (recordId: string, markedAt = Date.now()) => {
    this.paidPendingConfirm = {
      ...this.paidPendingConfirm,
      [recordId]: { markedAt },
    };
  };

  isPaidPending = (recordId: string) => !!this.paidPendingConfirm[recordId];
}

/**
 * 把 markedAt 转成给操作员看的「X 天/小时/分钟 后自动确认」文案。
 * 单位规则：
 *  - 剩余 ≥ 1 天 → 「X 天后自动确认」
 *  - 剩余 < 1 天 且 ≥ 1 小时 → 「X 小时后自动确认」
 *  - 剩余 < 1 小时 → 「X 分钟后自动确认」（下限 1，避免出现「0 分钟」）
 *  - 已过期 → 「0 分钟后自动确认」（理论上后台已触发自动确认，此处只是兜底）
 *
 * 每次组件渲染都重算，因此「刷新页面剩余时间也跟着刷新」由 React 渲染天然
 * 满足。
 */
export function formatAutoConfirmCountdown(markedAt: number, now = Date.now()): string {
  const deadline = markedAt + AUTO_CONFIRM_TIMEOUT_DAYS * DAY_MS;
  const remaining = deadline - now;
  if (remaining <= 0) return '等待用户确认，或 0 分钟后自动确认';
  // 单位切换用 floor（剩余必须有至少 1 整单位才停在该单位）；
  // 显示用 ceil（向上取整对用户更友好：刚标记的 3-day 订单显示 「3 天后」而不是 「2 天后」）。
  if (remaining >= DAY_MS) {
    return `等待用户确认，或 ${Math.ceil(remaining / DAY_MS)} 天后自动确认`;
  }
  if (remaining >= HOUR_MS) {
    return `等待用户确认，或 ${Math.ceil(remaining / HOUR_MS)} 小时后自动确认`;
  }
  const minutes = Math.max(1, Math.ceil(remaining / MIN_MS));
  return `等待用户确认，或 ${minutes} 分钟后自动确认`;
}
