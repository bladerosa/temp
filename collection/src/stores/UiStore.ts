import { makeAutoObservable } from 'mobx';

// UI / shell state — sidebar collapsed/open, viewport mode, theme stretch.
// Backed by `matchMedia` so the layout reacts to viewport changes.

const MOBILE_MQ = '(max-width: 767px)';
const TABLET_MAX_MQ = '(max-width: 1279px)';

export class UiStore {
  /** True when the viewport is ≤767px. Drives drawer-vs-rail sidebar. */
  isMobile = false;
  /** Tablet/desktop sidebar collapsed state (icon rail). Inert on mobile. */
  collapsed = false;
  /** Mobile drawer open state. Inert on tablet/desktop. */
  drawerOpen = false;
  /** Production-style "stretch" toggle — when true, page Container goes maxWidth=false. */
  themeStretch = false;

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== 'undefined') {
      this.isMobile = window.matchMedia(MOBILE_MQ).matches;
      this.collapsed = window.matchMedia(TABLET_MAX_MQ).matches;
      window.matchMedia(MOBILE_MQ).addEventListener('change', (e) => {
        this.isMobile = e.matches;
        if (!e.matches) this.drawerOpen = false;
      });
      window.matchMedia(TABLET_MAX_MQ).addEventListener('change', (e) => {
        this.collapsed = e.matches;
      });
    }
  }

  toggleSidebar = () => {
    if (this.isMobile) this.drawerOpen = !this.drawerOpen;
    else this.collapsed = !this.collapsed;
  };

  closeDrawer = () => { this.drawerOpen = false; };
  setStretch = (v: boolean) => { this.themeStretch = v; };
}
