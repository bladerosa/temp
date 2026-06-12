import { makeAutoObservable } from 'mobx';

const ETH_TESTNET_KEY = 'ccp_eth_testnet';

export class SettingsStore {
  /* Persisted like the prototype so it survives refresh. */
  ethTestnet = localStorage.getItem(ETH_TESTNET_KEY) !== 'off';
  autoSwap = false;
  autoAddNewTokens = true;
  tokens: string[] = ['TETH', 'BTC', 'ETH', 'USDT', 'USDC'];

  constructor() {
    makeAutoObservable(this);
  }

  toggleEthTestnet = () => {
    this.ethTestnet = !this.ethTestnet;
    localStorage.setItem(ETH_TESTNET_KEY, this.ethTestnet ? 'on' : 'off');
  };

  toggleAutoSwap = () => {
    this.autoSwap = !this.autoSwap;
  };

  toggleAutoAdd = () => {
    this.autoAddNewTokens = !this.autoAddNewTokens;
  };

  removeToken = (symbol: string) => {
    this.tokens = this.tokens.filter((t) => t !== symbol);
  };
}
