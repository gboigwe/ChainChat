/**
 * Wallet Detection Utilities
 * Helper functions for detecting and validating wallet installations
 */

import { WalletId } from '../services/wallets/WalletManager';

export interface WalletDetectionResult {
  id: WalletId;
  isInstalled: boolean;
  provider: any;
  version?: string;
}

/**
 * Detect all available wallets
 */
export async function detectWallets(): Promise<WalletDetectionResult[]> {
  const results: WalletDetectionResult[] = [];

  // Detect Xverse
  const xverseResult = await detectXverse();
  if (xverseResult) results.push(xverseResult);

  // Detect Leather
  const leatherResult = await detectLeather();
  if (leatherResult) results.push(leatherResult);

  // Detect Boom
  const boomResult = await detectBoom();
  if (boomResult) results.push(boomResult);

  // Detect Ledger
  const ledgerResult = await detectLedger();
  if (ledgerResult) results.push(ledgerResult);

  return results;
}

/**
 * Detect Xverse wallet
 */
export async function detectXverse(): Promise<WalletDetectionResult | null> {
  if (typeof window === 'undefined') return null;

  const provider =
    (window as any).XverseProviders?.StacksProvider ||
    (window as any).StacksProvider;

  return {
    id: 'xverse',
    isInstalled: !!provider,
    provider,
    version: provider?.version,
  };
}

/**
 * Detect Leather (Hiro) wallet
 */
export async function detectLeather(): Promise<WalletDetectionResult | null> {
  if (typeof window === 'undefined') return null;

  const provider =
    (window as any).LeatherProvider || (window as any).HiroWalletProvider;

  return {
    id: 'leather',
    isInstalled: !!provider,
    provider,
    version: provider?.version,
  };
}

/**
 * Detect Boom wallet
 */
export async function detectBoom(): Promise<WalletDetectionResult | null> {
  if (typeof window === 'undefined') return null;

  const provider = (window as any).BoomProvider;

  return {
    id: 'boom',
    isInstalled: !!provider,
    provider,
    version: provider?.version,
  };
}

/**
 * Detect Ledger support
 */
export async function detectLedger(): Promise<WalletDetectionResult | null> {
  if (typeof window === 'undefined') return null;

  // Check if WebUSB or WebHID is available
  const isSupported = !!(navigator.usb || (navigator as any).hid);

  return {
    id: 'ledger',
    isInstalled: isSupported,
    provider: null,
    version: undefined,
  };
}

/**
 * Check if a specific wallet is installed
 */
export async function isWalletInstalled(walletId: WalletId): Promise<boolean> {
  const detectors: Record<WalletId, () => Promise<WalletDetectionResult | null>> = {
    xverse: detectXverse,
    leather: detectLeather,
    boom: detectBoom,
    ledger: detectLedger,
  };

  const detector = detectors[walletId];
  if (!detector) return false;

  const result = await detector();
  return result?.isInstalled || false;
}

/**
 * Get installed wallets count
 */
export async function getInstalledWalletsCount(): Promise<number> {
  const results = await detectWallets();
  return results.filter((r) => r.isInstalled).length;
}

/**
 * Check if any wallet is installed
 */
export async function hasAnyWallet(): Promise<boolean> {
  const count = await getInstalledWalletsCount();
  return count > 0;
}

/**
 * Get recommended wallet for the current platform
 */
export function getRecommendedWallet(): WalletId {
  // Check if mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return 'xverse'; // Xverse has good mobile support
  }

  return 'leather'; // Leather (Hiro) is popular for desktop
}

/**
 * Validate wallet address format
 */
export function isValidStacksAddress(address: string): boolean {
  // Stacks addresses start with SP or SM
  const pattern = /^S[PM][0-9A-Z]{39,40}$/;
  return pattern.test(address);
}

/**
 * Check if running in mobile environment
 */
export function isMobileEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Check if running in browser extension context
 */
export function isExtensionContext(): boolean {
  if (typeof window === 'undefined') return false;

  return !!(window as any).chrome?.runtime?.id;
}

/**
 * Get wallet deep link URL
 */
export function getWalletDeepLink(walletId: WalletId, action?: string): string | null {
  const deepLinks: Record<WalletId, string> = {
    xverse: 'xverse://',
    leather: 'leather://',
    boom: 'boom://',
    ledger: '', // Ledger doesn't have deep links
  };

  const baseUrl = deepLinks[walletId];
  if (!baseUrl) return null;

  if (action) {
    return `${baseUrl}${action}`;
  }

  return baseUrl;
}

export default {
  detectWallets,
  detectXverse,
  detectLeather,
  detectBoom,
  detectLedger,
  isWalletInstalled,
  getInstalledWalletsCount,
  hasAnyWallet,
  getRecommendedWallet,
  isValidStacksAddress,
  isMobileEnvironment,
  isExtensionContext,
  getWalletDeepLink,
};
