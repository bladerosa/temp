import { createContext, useContext } from 'react';
import { AuthStore } from './AuthStore';
import { UiStore } from './UiStore';
import { ToastStore } from './ToastStore';
import { PromoterStore } from './PromoterStore';
import { WithdrawalStore } from './WithdrawalStore';

export class RootStore {
  auth = new AuthStore();
  ui = new UiStore();
  toast = new ToastStore();
  promoter = new PromoterStore();
  withdrawal = new WithdrawalStore();
}

export const rootStore = new RootStore();
const StoresContext = createContext<RootStore>(rootStore);
export const StoresProvider = StoresContext.Provider;
export const useStores = () => useContext(StoresContext);
