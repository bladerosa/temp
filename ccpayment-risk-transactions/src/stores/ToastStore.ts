import { makeAutoObservable } from 'mobx';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: number;
  title: string;
  desc?: string;
  tone: ToastTone;
  duration: number;
}

export class ToastStore {
  items: ToastItem[] = [];
  private seq = 1;

  constructor() {
    makeAutoObservable(this);
  }

  show = (opts: { title: string; desc?: string; tone?: ToastTone; duration?: number }) => {
    const item: ToastItem = {
      id: this.seq++,
      title: opts.title,
      desc: opts.desc,
      tone: opts.tone ?? 'info',
      duration: opts.duration ?? 4000,
    };
    this.items.push(item);
    if (item.duration > 0) {
      window.setTimeout(() => this.dismiss(item.id), item.duration);
    }
  };

  dismiss = (id: number) => {
    this.items = this.items.filter((t) => t.id !== id);
  };
}
