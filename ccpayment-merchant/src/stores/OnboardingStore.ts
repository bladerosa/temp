import { makeAutoObservable, runInAction } from 'mobx';
import { developerApi, type AppSecretInfo } from '@/api/developer';
import { rootDomain } from '@/utils/rootDomain';

export type WebhookKind = 'deposit' | 'withdraw';

export interface WebhookState {
  url: string;
  detected: boolean;
  /** User-added whitelist domains; the first whitelist entry is always
      derived live from `url`, so it stays in sync automatically. */
  extraDomains: string[];
}

const MAX_WHITELIST = 10;

/* In-memory by design: navigating between pages keeps the demo state,
   a full refresh resets it — same semantics as the prototype's URL courier. */
export class OnboardingStore {
  created = false;
  appInfo: AppSecretInfo | null = null;

  /* Sticky "stage C" flag for the Dashboard guide card: once any webhook has
     been detected, the guide stays in its final stage even if a URL is later
     edited and goes back to Not Detected (PRD 5.4.6 rule 5). */
  integrationDone = false;

  webhooks: Record<WebhookKind, WebhookState> = {
    deposit: { url: '', detected: false, extraDomains: [] },
    withdraw: { url: '', detected: false, extraDomains: [] },
  };

  constructor() {
    makeAutoObservable(this);
  }

  get detected(): boolean {
    return this.integrationDone;
  }

  createAppSecret = async () => {
    const info = await developerApi.createAppSecret();
    runInAction(() => {
      this.created = true;
      this.appInfo = info;
    });
  };

  /* Saving a different URL on a detected row resets it to Not Detected —
     the new address must pass detection again (PRD 5.4.6 rule 2). Saving
     the identical URL keeps the current state. Whitelist entries survive. */
  setWebhookUrl = (kind: WebhookKind, url: string) => {
    const w = this.webhooks[kind];
    if (w.url !== url) {
      w.url = url;
      w.detected = false;
    }
  };

  markDetected = (kind: WebhookKind) => {
    if (this.webhooks[kind].url) {
      this.webhooks[kind].detected = true;
      this.integrationDone = true;
    }
  };

  whitelist = (kind: WebhookKind): string[] => {
    const w = this.webhooks[kind];
    return [rootDomain(w.url), ...w.extraDomains];
  };

  /** Returns an error message, or null on success. */
  addWhitelistDomain = (kind: WebhookKind, value: string): string | null => {
    const root = rootDomain(value);
    if (!root) return null;
    const all = this.whitelist(kind);
    if (all.length >= MAX_WHITELIST) return 'Whitelist is full (10 / 10)';
    if (all.includes(root)) return 'Already on the whitelist';
    this.webhooks[kind].extraDomains.push(root);
    return null;
  };

  /** index is within the full list (0 is the locked default entry). */
  editWhitelistDomain = (kind: WebhookKind, index: number, value: string): string | null => {
    if (index === 0) return null;
    const root = rootDomain(value);
    if (!root) return null;
    const others = this.whitelist(kind).filter((_, i) => i !== index);
    if (others.includes(root)) return 'Already on the whitelist';
    this.webhooks[kind].extraDomains[index - 1] = root;
    return null;
  };

  removeWhitelistDomain = (kind: WebhookKind, index: number) => {
    if (index === 0) return;
    this.webhooks[kind].extraDomains.splice(index - 1, 1);
  };
}

export { MAX_WHITELIST };
