import { makeAutoObservable } from 'mobx';

export class UiStore {
  collapsed = false;
  drawerOpen = false;
  themeStretch = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleSidebar = () => {
    this.collapsed = !this.collapsed;
  };

  setDrawerOpen = (open: boolean) => {
    this.drawerOpen = open;
  };

  toggleStretch = () => {
    this.themeStretch = !this.themeStretch;
  };
}
