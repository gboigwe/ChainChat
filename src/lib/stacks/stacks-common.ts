// Shared Stacks.js utilities and constants
/** Stacks mainnet chain ID */
export const MAINNET_CHAIN_ID = 1;
/** Stacks testnet chain ID */
export const TESTNET_CHAIN_ID = 2147483648;
/** Stacks mainnet API base URL */
export const MAINNET_API_URL = 'https://api.hiro.so';
/** Stacks testnet API base URL */
export const TESTNET_API_URL = 'https://api.testnet.hiro.so';
/** Network type */
export type StacksNetwork = 'mainnet' | 'testnet' | 'devnet';
/** Get API URL for network */
export function getApiUrl(network: StacksNetwork): string {
  switch (network) {
    case 'mainnet': return MAINNET_API_URL;
    case 'testnet': return TESTNET_API_URL;
    case 'devnet': return 'http://localhost:3999';
    default: throw new Error(`Unknown network: ${network}`);
  }
}
/** Get chain ID for network */
export function getChainId(network: StacksNetwork): number {
  return network === 'mainnet' ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID;
}
