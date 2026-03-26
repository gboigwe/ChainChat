// Wallet and authentication type definitions
export type WalletProviderType = 'leather' | 'xverse' | 'hiro' | 'unknown';
export interface WalletSession {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';
  provider: WalletProviderType;
  userData: Record<string, unknown> | null;
}
