import { makeAutoObservable } from 'mobx';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  title: string;
  desc?: string;
  tone: ToastTone;
  duration: number;
}

let __id = 1;

export class ToastStore {
  toasts: Toast[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  show = (t: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => {
    const id = __id++;
    const toast: Toast = { id, duration: 2200, ...t };
    this.toasts.push(toast);
    setTimeout(() => this.dismiss(id), toast.duration);
  };

  dismiss = (id: number) => {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  };
}
