// Wallet and authentication type definitions
export type WalletProviderType = 'leather' | 'xverse' | 'hiro' | 'unknown';
export interface WalletSession {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';
  provider: WalletProviderType;
  userData: Record<string, unknown> | null;
}
export interface AuthData {
  appPrivateKey: string;
  identityAddress: string;
  profile: ProfileData;
  hubUrl: string;
}
export interface ProfileData {
  stxAddress: { mainnet: string; testnet: string };
  btcAddress?: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  apps: Record<string, AppPermissions>;
}
