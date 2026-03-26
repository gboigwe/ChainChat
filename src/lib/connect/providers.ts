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
/** Check if any wallet is available */
export function hasWalletInstalled(): boolean {
  return detectInstalledWallets().length > 0;
}
/** Get provider display name */
export function getProviderName(provider: WalletProvider): string {
  return PROVIDER_REGISTRY[provider].name;
}
/** Wallet connection status */
export type WalletConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
/** Provider capabilities */
export interface ProviderCapabilities {
  signMessage: boolean;
  signStructuredData: boolean;
  sendTransactions: boolean;
  signPsbt: boolean;
}
/** Get capabilities for a provider */
export function getProviderCapabilities(provider: WalletProvider): ProviderCapabilities {
  const base: ProviderCapabilities = { signMessage: true, signStructuredData: true, sendTransactions: true, signPsbt: false };
  if (provider === WalletProvider.Xverse) return { ...base, signPsbt: true };
  return base;
}
export const PROVIDER_FLAG_1 = false;
export const PROVIDER_FLAG_2 = false;
export const PROVIDER_FLAG_3 = false;
export const PROVIDER_FLAG_4 = false;
export const PROVIDER_FLAG_5 = false;
export const PROVIDER_FLAG_6 = false;
export const PROVIDER_FLAG_7 = false;
export const PROVIDER_FLAG_8 = false;
