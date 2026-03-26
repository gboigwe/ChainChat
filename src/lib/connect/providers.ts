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
/** Known provider metadata */
export const PROVIDER_REGISTRY: Record<WalletProvider, ProviderInfo> = {
  [WalletProvider.Leather]: {
    id: WalletProvider.Leather,
    name: 'Leather',
    icon: '/wallets/leather.svg',
    downloadUrl: 'https://leather.io',
  },
  [WalletProvider.Xverse]: {
    id: WalletProvider.Xverse,
    name: 'Xverse',
    icon: '/wallets/xverse.svg',
    downloadUrl: 'https://www.xverse.app',
  },
  [WalletProvider.Hiro]: {
    id: WalletProvider.Hiro,
    name: 'Hiro Wallet',
    icon: '/wallets/hiro.svg',
    downloadUrl: 'https://wallet.hiro.so',
  },
  [WalletProvider.Unknown]: {
    id: WalletProvider.Unknown,
    name: 'Unknown Wallet',
    icon: '/wallets/generic.svg',
    downloadUrl: '',
  },
};
