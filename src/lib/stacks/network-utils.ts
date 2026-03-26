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
