import { makeAutoObservable } from 'mobx';

export class UiStore {
  drawerOpen = false;
  expandedSidebar: Record<string, boolean> = { merchant: true, n_token: true };
  /**
   * Set of 待供应商付款 行 recordId — 这些行的操作员已通过 「确认付款」 弹窗
   * 提交了付款凭证，订单进入「等待用户确认」过渡态。期间隐藏 确认付款 按钮，
   * 但 详情 / 供应商退款 仍可点击。
   */
  paidPendingConfirm: Record<string, boolean> = {};

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

  markPaidPending = (recordId: string) => {
    this.paidPendingConfirm = { ...this.paidPendingConfirm, [recordId]: true };
  };

  isPaidPending = (recordId: string) => !!this.paidPendingConfirm[recordId];
}
