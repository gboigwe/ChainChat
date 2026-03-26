// Wallet provider detection and utilities
/** Supported wallet providers */
export enum WalletProvider {
  Leather = 'leather',
  Xverse = 'xverse',
  Hiro = 'hiro',
  Unknown = 'unknown',
}
/** Provider metadata */
export interface ProviderInfo {
  id: WalletProvider;
  name: string;
  icon: string;
  downloadUrl: string;
}
