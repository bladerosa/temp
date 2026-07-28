import { createContext, useContext } from 'react';
import { UiStore } from './UiStore';
import { ToastStore } from './ToastStore';
import { RiskStore } from './RiskStore';

export class RootStore {
  ui = new UiStore();
  toast = new ToastStore();
  risk = new RiskStore();
}

export const rootStore = new RootStore();

const StoresContext = createContext<RootStore | null>(null);

export const StoresProvider = StoresContext.Provider;

export function useStores(): RootStore {
  const v = useContext(StoresContext);
  if (!v) throw new Error('useStores must be used inside <StoresProvider>');
  return v;
}
