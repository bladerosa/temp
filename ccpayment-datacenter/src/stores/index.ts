import { createContext, useContext } from 'react';
import { UiStore } from './UiStore';
import { ToastStore } from './ToastStore';
import { MerchantStore } from './MerchantStore';
import { FinanceStore } from './FinanceStore';
import { DetailStore } from './DetailStore';

export class RootStore {
  ui = new UiStore();
  toast = new ToastStore();
  merchant = new MerchantStore();
  finance = new FinanceStore();
  detail = new DetailStore();
}

export const rootStore = new RootStore();

const StoresContext = createContext<RootStore | null>(null);

export const StoresProvider = StoresContext.Provider;

export function useStores(): RootStore {
  const v = useContext(StoresContext);
  if (!v) throw new Error('useStores must be used inside <StoresProvider>');
  return v;
}
