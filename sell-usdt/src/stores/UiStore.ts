import { makeAutoObservable } from 'mobx';

export class UiStore {
  drawerOpen = false;
  expandedSidebar: Record<string, boolean> = { merchant: true, n_token: true };

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
}
