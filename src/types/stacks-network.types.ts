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
