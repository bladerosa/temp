import { createContext, useContext } from 'react';
import { OnboardingStore } from './OnboardingStore';
import { SettingsStore } from './SettingsStore';

export class RootStore {
  onboarding = new OnboardingStore();
  settings = new SettingsStore();
}

export const rootStore = new RootStore();

const StoresContext = createContext<RootStore>(rootStore);

export const StoresProvider = StoresContext.Provider;

export function useStores(): RootStore {
  return useContext(StoresContext);
}
