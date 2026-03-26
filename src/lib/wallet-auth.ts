/**
 * Wallet authentication utilities for ChainChat
 * Supports Leather, Xverse, and other Stacks wallets via @stacks/connect
 */

import { showConnect, type AuthOptions } from '@stacks/connect';
import { type StacksAddress, stacksAddress } from '../types/stacks';
import { getCurrentNetworkName } from '../config/network-config';
import { isMainnet } from './stacks-network';

export interface WalletUser {
  stxAddress: StacksAddress;
  btcAddress?: string;
  publicKey?: string;
  profile?: Record<string, unknown>;
}

export interface AuthSession {
  isSignedIn: boolean;
  user: WalletUser | null;
  connectedAt: number | null;
}

// ─── Session Storage ───────────────────────────────────────────────────────────

const SESSION_KEY = 'chainchat_wallet_session';

function saveSession(user: WalletUser): void {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user, connectedAt: Date.now() })
    );
  } catch {
    // Storage not available (SSR / private browsing)
  }
}

function loadSession(): AuthSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { isSignedIn: false, user: null, connectedAt: null };
    const parsed = JSON.parse(raw);
    return {
      isSignedIn: true,
      user: parsed.user,
      connectedAt: parsed.connectedAt,
    };
  } catch {
    return { isSignedIn: false, user: null, connectedAt: null };
  }
}

function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * Initiate wallet connection via @stacks/connect
 */
export async function connectWallet(appName = 'ChainChat'): Promise<WalletUser> {
  const network = getCurrentNetworkName();

  return new Promise((resolve, reject) => {
    const options: AuthOptions = {
      appDetails: {
        name: appName,
        icon: `${window.location.origin}/logo.png`,
      },
      onFinish: (data) => {
        const userData = data.userSession?.loadUserData?.();
        if (!userData) {
          reject(new Error('No user data returned from wallet'));
          return;
        }

        const addressKey = isMainnet(network) ? 'mainnet' : 'testnet';
        const rawAddress = userData.profile?.stxAddress?.[addressKey] || '';

        const user: WalletUser = {
          stxAddress: stacksAddress(rawAddress),
          btcAddress: userData.profile?.btcAddress?.[addressKey],
          publicKey: userData.appPrivateKey,
          profile: userData.profile,
        };

        saveSession(user);
        resolve(user);
      },
      onCancel: () => {
        reject(new Error('Wallet connection cancelled'));
      },
    };

    showConnect(options);
  });
}

/**
 * Get the current auth session from storage
 */
export function getAuthSession(): AuthSession {
  return loadSession();
}

/**
 * Check if a user is currently signed in
 */
export function isSignedIn(): boolean {
  return loadSession().isSignedIn;
}

/**
 * Get the current user's Stacks address or null
 */
export function getCurrentAddress(): StacksAddress | null {
  const session = loadSession();
  return session.user?.stxAddress ?? null;
}

/**
 * Sign out and clear session
 */
export function signOut(): void {
  clearSession();
}

/**
 * Check if a wallet is available in the browser
 */
export function isWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).LeatherProvider ||
    (window as any).XverseProviders?.StacksProvider ||
    (window as any).StacksProvider
  );
}
