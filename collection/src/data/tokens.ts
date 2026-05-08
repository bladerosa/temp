// Domain types + sample chain/token catalog

export type Chain = {
  id: string;
  name: string;
  isTrx?: boolean;
  color: string;
};

export type Token = {
  id: string;          // unique compound id chain:symbol
  symbol: string;
  chainId: string;
  color: string;
  // Whether this token has a reliable USD oracle. When false, the operator
  // must enter min-collect/trigger amounts in token-native quantity.
  convertibleToUsd: boolean;
};

export const CHAINS: Chain[] = [
  { id: 'TRX',     name: 'TRON',     isTrx: true, color: '#EB1C25' },
  { id: 'ETH',     name: 'Ethereum',              color: '#627EEA' },
  { id: 'BSC',     name: 'BNB Chain',             color: '#F0B90B' },
  { id: 'POLYGON', name: 'Polygon',               color: '#8247E5' },
  { id: 'BTC',     name: 'Bitcoin',               color: '#F7931A' },
  { id: 'SOL',     name: 'Solana',                color: '#9945FF' },
  { id: 'ARB',     name: 'Arbitrum',              color: '#28A0F0' },
];

export const TOKENS: Token[] = [
  // TRON
  { id: 'TRX:USDT',  symbol: 'USDT',  chainId: 'TRX',     color: '#26A17B', convertibleToUsd: true },
  { id: 'TRX:USDC',  symbol: 'USDC',  chainId: 'TRX',     color: '#2775CA', convertibleToUsd: true },
  { id: 'TRX:TRX',   symbol: 'TRX',   chainId: 'TRX',     color: '#EB1C25', convertibleToUsd: true },
  // Ethereum
  { id: 'ETH:USDT',  symbol: 'USDT',  chainId: 'ETH',     color: '#26A17B', convertibleToUsd: true },
  { id: 'ETH:USDC',  symbol: 'USDC',  chainId: 'ETH',     color: '#2775CA', convertibleToUsd: true },
  { id: 'ETH:ETH',   symbol: 'ETH',   chainId: 'ETH',     color: '#627EEA', convertibleToUsd: true },
  { id: 'ETH:DAI',   symbol: 'DAI',   chainId: 'ETH',     color: '#F4B731', convertibleToUsd: true },
  // BSC
  { id: 'BSC:USDT',  symbol: 'USDT',  chainId: 'BSC',     color: '#26A17B', convertibleToUsd: true },
  { id: 'BSC:BNB',   symbol: 'BNB',   chainId: 'BSC',     color: '#F0B90B', convertibleToUsd: true },
  { id: 'BSC:BUSD',  symbol: 'BUSD',  chainId: 'BSC',     color: '#F0B90B', convertibleToUsd: true },
  // Non-convertible mock token on BSC (e.g. obscure project token without a USD oracle)
  { id: 'BSC:GAME',  symbol: 'GAME',  chainId: 'BSC',     color: '#7C3AED', convertibleToUsd: false },
  // Polygon
  { id: 'POLYGON:USDT',  symbol: 'USDT',  chainId: 'POLYGON', color: '#26A17B', convertibleToUsd: true },
  { id: 'POLYGON:USDC',  symbol: 'USDC',  chainId: 'POLYGON', color: '#2775CA', convertibleToUsd: true },
  { id: 'POLYGON:MATIC', symbol: 'MATIC', chainId: 'POLYGON', color: '#8247E5', convertibleToUsd: true },
  // Bitcoin
  { id: 'BTC:BTC',   symbol: 'BTC',   chainId: 'BTC',     color: '#F7931A', convertibleToUsd: true },
  // Solana
  { id: 'SOL:SOL',   symbol: 'SOL',   chainId: 'SOL',     color: '#9945FF', convertibleToUsd: true },
  { id: 'SOL:USDC',  symbol: 'USDC',  chainId: 'SOL',     color: '#2775CA', convertibleToUsd: true },
  // Non-convertible mock memecoin on Solana
  { id: 'SOL:MEME',  symbol: 'MEME',  chainId: 'SOL',     color: '#E879F9', convertibleToUsd: false },
  // Arbitrum
  { id: 'ARB:USDT',  symbol: 'USDT',  chainId: 'ARB',     color: '#26A17B', convertibleToUsd: true },
  { id: 'ARB:ETH',   symbol: 'ETH',   chainId: 'ARB',     color: '#627EEA', convertibleToUsd: true },
  // Non-convertible mock test token on Arbitrum
  { id: 'ARB:TST',   symbol: 'TST',   chainId: 'ARB',     color: '#94A3B8', convertibleToUsd: false },
];

export const tokensByChain = (chainId: string) =>
  TOKENS.filter((t) => t.chainId === chainId);

export const findChain = (id: string) => CHAINS.find((c) => c.id === id);
export const findToken = (id: string) => TOKENS.find((t) => t.id === id);

export const isTrxChain = (chainId: string) =>
  findChain(chainId)?.isTrx === true;

export const isConvertible = (tokenId: string): boolean =>
  findToken(tokenId)?.convertibleToUsd ?? true;

// True if every selected token is convertible to USD.
export const allConvertible = (tokenIds: string[]): boolean =>
  tokenIds.length > 0 && tokenIds.every(isConvertible);

// True if at least one selected token is NOT convertible to USD.
export const hasNonConvertible = (tokenIds: string[]): boolean =>
  tokenIds.some((id) => !isConvertible(id));
