import { makeAutoObservable } from 'mobx';

export class UiStore {
  sidebarCollapsed = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleSidebar = () => {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  };
}
