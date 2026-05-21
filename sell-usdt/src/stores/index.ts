import { createContext, useContext } from 'react';
import { UiStore } from './UiStore';
import { FeeStore } from './FeeStore';
import { HotWalletStore } from './HotWalletStore';

export class RootStore {
  ui = new UiStore();
  fee = new FeeStore();
  hotWallet = new HotWalletStore();
}

export const rootStore = new RootStore();

const StoresContext = createContext<RootStore>(rootStore);

export const StoresProvider = StoresContext.Provider;

export function useStores(): RootStore {
  return useContext(StoresContext);
}
