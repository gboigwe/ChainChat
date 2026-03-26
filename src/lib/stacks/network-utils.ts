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
