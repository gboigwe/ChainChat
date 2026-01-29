/**
 * Deep Linking Utilities
 * Handle mobile wallet deep links and app switching
 */

import { WalletId } from '../services/wallets/WalletManager';
import { WALLET_METADATA } from '../config/walletConfig';
import { isMobileEnvironment } from './walletDetection';

export interface DeepLinkOptions {
  action?: string;
  params?: Record<string, string>;
  fallbackUrl?: string;
}

/**
 * Generate deep link URL for wallet
 */
export function generateDeepLink(
  walletId: WalletId,
  options: DeepLinkOptions = {}
): string | null {
  const metadata = WALLET_METADATA[walletId];

  if (!metadata.deepLink) {
    return null;
  }

  let url = metadata.deepLink;

  // Add action if provided
  if (options.action) {
    url += options.action;
  }

  // Add query parameters
  if (options.params && Object.keys(options.params).length > 0) {
    const searchParams = new URLSearchParams(options.params);
    url += (url.includes('?') ? '&' : '?') + searchParams.toString();
  }

  return url;
}

/**
 * Open wallet via deep link
 */
export function openWalletDeepLink(
  walletId: WalletId,
  options: DeepLinkOptions = {}
): boolean {
  if (!isMobileEnvironment()) {
    console.warn('Deep links are only supported on mobile devices');
    return false;
  }

  const deepLink = generateDeepLink(walletId, options);

  if (!deepLink) {
    console.warn(`No deep link available for ${walletId}`);
    return false;
  }

  try {
    // Attempt to open deep link
    window.location.href = deepLink;

    // Set timeout to redirect to fallback/store if app doesn't open
    if (options.fallbackUrl) {
      setTimeout(() => {
        if (document.hasFocus()) {
          // App didn't open, redirect to fallback
          window.location.href = options.fallbackUrl!;
        }
      }, 2000);
    }

    return true;
  } catch (error) {
    console.error('Failed to open deep link:', error);
    return false;
  }
}

/**
 * Generate app store URL for wallet installation
 */
export function getAppStoreUrl(walletId: WalletId): string | null {
  const metadata = WALLET_METADATA[walletId];

  if (!isMobileEnvironment()) {
    return metadata.downloadUrl;
  }

  // Detect iOS or Android
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  // Return appropriate store URL based on wallet and platform
  const storeUrls: Record<WalletId, { ios?: string; android?: string }> = {
    xverse: {
      ios: 'https://apps.apple.com/app/xverse-wallet/id1552272995',
      android: 'https://play.google.com/store/apps/details?id=com.xverse.app',
    },
    leather: {
      ios: undefined, // Leather doesn't have mobile app
      android: undefined,
    },
    boom: {
      ios: 'https://apps.apple.com/app/boom-wallet',
      android: 'https://play.google.com/store/apps/details?id=com.boom.wallet',
    },
    ledger: {
      ios: 'https://apps.apple.com/app/ledger-live/id1361671700',
      android: 'https://play.google.com/store/apps/details?id=com.ledger.live',
    },
  };

  const urls = storeUrls[walletId];

  if (isIOS && urls.ios) {
    return urls.ios;
  }

  if (isAndroid && urls.android) {
    return urls.android;
  }

  return metadata.downloadUrl;
}

/**
 * Open app store for wallet installation
 */
export function openAppStore(walletId: WalletId): void {
  const storeUrl = getAppStoreUrl(walletId);

  if (storeUrl) {
    window.open(storeUrl, '_blank');
  }
}

/**
 * Check if deep link is supported
 */
export function isDeepLinkSupported(walletId: WalletId): boolean {
  const metadata = WALLET_METADATA[walletId];
  return isMobileEnvironment() && !!metadata.deepLink;
}

/**
 * Create universal link (for both web and mobile)
 */
export function createUniversalLink(
  walletId: WalletId,
  action: string,
  params?: Record<string, string>
): string {
  const metadata = WALLET_METADATA[walletId];

  if (isMobileEnvironment() && metadata.deepLink) {
    return generateDeepLink(walletId, { action, params }) || metadata.website;
  }

  // For web, return the website URL
  return metadata.website;
}

/**
 * Handle wallet connection with deep link fallback
 */
export async function connectWithDeepLink(
  walletId: WalletId,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    if (isDeepLinkSupported(walletId)) {
      // Open wallet via deep link
      const opened = openWalletDeepLink(walletId, {
        action: 'connect',
        params: {
          origin: window.location.origin,
          app: 'ChainChat',
        },
        fallbackUrl: getAppStoreUrl(walletId) || undefined,
      });

      if (opened && onSuccess) {
        // Wait for potential callback
        setTimeout(onSuccess, 1000);
      }
    } else {
      throw new Error('Deep linking not supported on this platform');
    }
  } catch (error) {
    console.error('Deep link connection error:', error);
    if (onError) {
      onError(error as Error);
    }
  }
}

/**
 * Generate QR code data for wallet connection
 */
export function generateWalletConnectionQR(walletId: WalletId): string {
  const deepLink = generateDeepLink(walletId, {
    action: 'connect',
    params: {
      origin: window.location.origin,
      app: 'ChainChat',
      timestamp: Date.now().toString(),
    },
  });

  return deepLink || '';
}

export default {
  generateDeepLink,
  openWalletDeepLink,
  getAppStoreUrl,
  openAppStore,
  isDeepLinkSupported,
  createUniversalLink,
  connectWithDeepLink,
  generateWalletConnectionQR,
};
