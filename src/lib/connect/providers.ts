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
/** Get provider icon URL */
export function getProviderIcon(provider: WalletProvider): string {
  return PROVIDER_REGISTRY[provider].icon;
}
/** Get provider download URL */
export function getProviderDownloadUrl(provider: WalletProvider): string {
  return PROVIDER_REGISTRY[provider].downloadUrl;
}
/** Check if a specific provider is installed */
export function isProviderInstalled(provider: WalletProvider): boolean {
  if (typeof window === 'undefined') return false;
  switch (provider) {
    case WalletProvider.Leather: return !!(window as any).LeatherProvider;
    case WalletProvider.Xverse: return !!(window as any).XverseProviders;
    case WalletProvider.Hiro: return !!(window as any).StacksProvider;
    default: return false;
  }
}
/** Detect all installed wallet providers */
export function detectInstalledWallets(): WalletProvider[] {
  return Object.values(WalletProvider)
    .filter(p => p !== WalletProvider.Unknown)
    .filter(isProviderInstalled);
}
/** Get preferred provider — first installed or unknown */
export function getPreferredProvider(): WalletProvider {
  const installed = detectInstalledWallets();
  return installed[0] ?? WalletProvider.Unknown;
}
