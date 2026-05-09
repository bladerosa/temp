// Single root store + React context wiring (production pattern).
// Pages use `useStores()` to grab the store instance, then `observer()`
// the component to react to MobX changes.

import { createContext, useContext } from 'react';
import { CollectionStore } from './CollectionStore';
import { UiStore } from './UiStore';
import { ToastStore } from './ToastStore';

export class RootStore {
  collection = new CollectionStore();
  ui = new UiStore();
  toast = new ToastStore();
}

export const rootStore = new RootStore();

const StoresContext = createContext<RootStore>(rootStore);
export const StoresProvider = StoresContext.Provider;

export const useStores = () => useContext(StoresContext);
