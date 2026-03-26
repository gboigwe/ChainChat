// Stacks network utility functions
import { MAINNET_API_URL, TESTNET_API_URL } from './stacks-common';
/** Network configuration object */
export interface NetworkConfig {
  name: string;
  apiUrl: string;
  chainId: number;
  isMainnet: boolean;
  explorerUrl: string;
}
/** Mainnet configuration */
export const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  apiUrl: MAINNET_API_URL,
  chainId: 1,
  isMainnet: true,
  explorerUrl: 'https://explorer.hiro.so',
};
/** Testnet configuration */
export const TESTNET_CONFIG: NetworkConfig = {
  name: 'testnet',
  apiUrl: TESTNET_API_URL,
  chainId: 2147483648,
  isMainnet: false,
  explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
};
/** Devnet configuration */
export const DEVNET_CONFIG: NetworkConfig = {
  name: 'devnet',
  apiUrl: 'http://localhost:3999',
  chainId: 2147483648,
  isMainnet: false,
  explorerUrl: 'http://localhost:8000',
};
/** Get network config by name */
export function getNetworkConfig(name: string): NetworkConfig {
  switch (name) {
    case 'mainnet': return MAINNET_CONFIG;
    case 'testnet': return TESTNET_CONFIG;
    case 'devnet': return DEVNET_CONFIG;
    default: throw new Error(`Unknown network: ${name}`);
  }
}
/** Check if running on mainnet */
export function isMainnet(config: NetworkConfig): boolean {
  return config.isMainnet;
}
/** Build transaction explorer URL */
export function txExplorerUrl(txId: string, config: NetworkConfig): string {
  return `${config.explorerUrl}/txid/${txId}`;
}
