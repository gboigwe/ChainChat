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
export interface AppPermissions {
  origin: string;
  scopes: string[];
  lastLoginAt: string;
  appPrivateKey?: string;
}
export interface SignatureData {
  signature: string;
  publicKey: string;
  message?: string;
}
export interface StructuredData {
  domain: { name: string; version: string; chainId: number };
  message: Record<string, unknown>;
}
export const WALLET_TYPE_CONST_1 = 1;
export const WALLET_TYPE_CONST_2 = 2;
