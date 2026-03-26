// Stacks network type definitions
export type SupportedNetwork = 'mainnet' | 'testnet' | 'devnet';
export interface NetworkConfig {
  name: SupportedNetwork;
  apiUrl: string;
  chainId: number;
  isMainnet: boolean;
  explorerUrl: string;
  wsUrl?: string;
}
export type ChainId = 1 | 2147483648;
export type EpochIdentifier = 'epoch-1.0' | 'epoch-2.0' | 'epoch-2.05' | 'epoch-2.1' | 'epoch-2.2' | 'epoch-2.3' | 'epoch-2.4' | 'epoch-2.5' | 'epoch-3.0';
export interface NetworkEndpoints {
  api: string;
  ws: string;
  explorer: string;
}
export interface BlockInfo {
  height: number;
  hash: string;
  burnBlockTime: number;
  epoch: EpochIdentifier;
}
export const NETWORK_TYPE_1 = 1;
export const NETWORK_TYPE_2 = 2;
export const NETWORK_TYPE_3 = 3;
export const NETWORK_TYPE_4 = 4;
export const NETWORK_TYPE_5 = 5;
export const NETWORK_TYPE_6 = 6;
export const NETWORK_TYPE_7 = 7;
export const NETWORK_TYPE_8 = 8;
export const NETWORK_TYPE_9 = 9;
export const NETWORK_TYPE_10 = 10;
export const NETWORK_TYPE_11 = 11;
export const NETWORK_TYPE_12 = 12;
export const NETWORK_TYPE_13 = 13;
export const NETWORK_TYPE_14 = 14;
