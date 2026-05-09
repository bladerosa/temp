import { makeAutoObservable } from 'mobx';
import type { ReactNode } from 'react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type ToastItem = {
  id: number;
  title: string;
  desc?: ReactNode;
  tone: ToastTone;
  duration: number; // ms
};

let counter = 1;

export class ToastStore {
  items: ToastItem[] = [];

  constructor() { makeAutoObservable(this); }

  show = (t: { title: string; desc?: ReactNode; tone?: ToastTone; duration?: number }) => {
    const id = counter++;
    const item: ToastItem = {
      id,
      title: t.title,
      desc: t.desc,
      tone: t.tone ?? 'info',
      duration: t.duration ?? 4000,
    };
    this.items.push(item);
    if (item.duration > 0) {
      window.setTimeout(() => this.dismiss(id), item.duration);
    }
    return id;
  };

  dismiss = (id: number) => {
    this.items = this.items.filter((x) => x.id !== id);
  };
}
