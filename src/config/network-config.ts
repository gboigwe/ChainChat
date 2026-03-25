/**
 * Multi-network configuration for Stacks blockchain
 * Supports mainnet, testnet, and devnet environments
 */

export type StacksNetworkName = 'mainnet' | 'testnet' | 'devnet';

export interface NetworkEndpoints {
  stacksNode: string;
  bitcoinNode: string;
  explorerUrl: string;
  hiroApiUrl: string;
  hiroApiWsUrl: string;
}

export interface NetworkConfig {
  name: StacksNetworkName;
  chainId: number;
  endpoints: NetworkEndpoints;
  contractOwner: string;
  btcBlockTime: number; // seconds per BTC block
  stacksBlockTime: number; // seconds per Stacks block
  defaultFee: bigint; // micro-STX
  maxFee: bigint; // micro-STX
}

export const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  chainId: 1,
  endpoints: {
    stacksNode: 'https://api.hiro.so',
    bitcoinNode: 'https://api.blockcypher.com/v1/btc/main',
    explorerUrl: 'https://explorer.hiro.so',
    hiroApiUrl: 'https://api.hiro.so',
    hiroApiWsUrl: 'wss://api.hiro.so',
  },
  contractOwner: 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84',
  btcBlockTime: 600,
  stacksBlockTime: 600,
  defaultFee: BigInt(1500),
  maxFee: BigInt(500000),
};

export const TESTNET_CONFIG: NetworkConfig = {
  name: 'testnet',
  chainId: 2147483648,
  endpoints: {
    stacksNode: 'https://api.testnet.hiro.so',
    bitcoinNode: 'https://api.blockcypher.com/v1/btc/test3',
    explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
    hiroApiUrl: 'https://api.testnet.hiro.so',
    hiroApiWsUrl: 'wss://api.testnet.hiro.so',
  },
  contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  btcBlockTime: 120,
  stacksBlockTime: 120,
  defaultFee: BigInt(1500),
  maxFee: BigInt(500000),
};

export const DEVNET_CONFIG: NetworkConfig = {
  name: 'devnet',
  chainId: 2147483648,
  endpoints: {
    stacksNode: 'http://localhost:3999',
    bitcoinNode: 'http://localhost:18443',
    explorerUrl: 'http://localhost:3020',
    hiroApiUrl: 'http://localhost:3999',
    hiroApiWsUrl: 'ws://localhost:3999',
  },
  contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  btcBlockTime: 30,
  stacksBlockTime: 30,
  defaultFee: BigInt(1500),
  maxFee: BigInt(500000),
};

export const NETWORK_CONFIGS: Record<StacksNetworkName, NetworkConfig> = {
  mainnet: MAINNET_CONFIG,
  testnet: TESTNET_CONFIG,
  devnet: DEVNET_CONFIG,
};

/**
 * Get network config by name
 */
export function getNetworkConfig(name: StacksNetworkName): NetworkConfig {
  return NETWORK_CONFIGS[name];
}

/**
 * Get current network from environment
 */
export function getCurrentNetworkName(): StacksNetworkName {
  const env = import.meta.env?.VITE_STACKS_NETWORK || 'mainnet';
  if (env === 'testnet' || env === 'devnet') return env;
  return 'mainnet';
}

/**
 * Get current network config
 */
export function getCurrentNetworkConfig(): NetworkConfig {
  return getNetworkConfig(getCurrentNetworkName());
}

/**
 * Explorer URL for a transaction
 */
export function getTxExplorerUrl(txId: string, network: StacksNetworkName = 'mainnet'): string {
  const config = NETWORK_CONFIGS[network];
  return `${config.endpoints.explorerUrl}/txid/${txId}`;
}

/**
 * Explorer URL for an address
 */
export function getAddressExplorerUrl(
  address: string,
  network: StacksNetworkName = 'mainnet'
): string {
  const config = NETWORK_CONFIGS[network];
  return `${config.endpoints.explorerUrl}/address/${address}`;
}

/**
 * Explorer URL for a contract
 */
export function getContractExplorerUrl(
  contractId: string,
  network: StacksNetworkName = 'mainnet'
): string {
  const config = NETWORK_CONFIGS[network];
  return `${config.endpoints.explorerUrl}/address/${contractId}`;
}
