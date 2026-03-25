/**
 * React hook for wallet-based authentication with sign-in challenge
 * Provides full auth flow: connect → sign challenge → verify → session
 */

import { useState, useEffect, useCallback } from 'react';
import { useStacksConnect } from './use-stacks-connect';
import { signMessage, createSignInChallenge, generateNonce } from '../lib/sign-message';
import { type StacksAddress } from '../types/stacks';

export type AuthState = 'disconnected' | 'connecting' | 'signing' | 'authenticated' | 'error';

interface WalletAuthSession {
  address: StacksAddress;
  challenge: string;
  signature: string;
  authenticatedAt: number;
  expiresAt: number;
}

interface UseWalletAuthResult {
  authState: AuthState;
  address: StacksAddress | null;
  session: WalletAuthSession | null;
  isAuthenticated: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  walletAvailable: boolean;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTH_SESSION_KEY = 'chainchat_auth_session';

function saveAuthSession(session: WalletAuthSession): void {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

function loadAuthSession(): WalletAuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as WalletAuthSession;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function useWalletAuth(): UseWalletAuthResult {
  const { connect, disconnect: walletDisconnect, user, walletAvailable } = useStacksConnect();

  const [authState, setAuthState] = useState<AuthState>('disconnected');
  const [session, setSession] = useState<WalletAuthSession | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Restore session on mount
  useEffect(() => {
    const saved = loadAuthSession();
    if (saved) {
      setSession(saved);
      setAuthState('authenticated');
    }
  }, []);

  const signIn = useCallback(async () => {
    setError(null);

    // Step 1: Connect wallet
    if (!user) {
      setAuthState('connecting');
      try {
        await connect();
      } catch (err) {
        setAuthState('error');
        setError(err instanceof Error ? err : new Error('Wallet connection failed'));
        return;
      }
    }

    if (!user) return;

    // Step 2: Sign challenge
    setAuthState('signing');
    try {
      const nonce = generateNonce(16);
      const challenge = createSignInChallenge(user.stxAddress, nonce);

      const signed = await signMessage({ message: challenge });

      const authSession: WalletAuthSession = {
        address: user.stxAddress,
        challenge,
        signature: signed.signature,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
      };

      saveAuthSession(authSession);
      setSession(authSession);
      setAuthState('authenticated');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err : new Error('Sign-in failed'));
    }
  }, [connect, user]);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    walletDisconnect();
    setSession(null);
    setAuthState('disconnected');
    setError(null);
  }, [walletDisconnect]);

  return {
    authState,
    address: session?.address ?? user?.stxAddress ?? null,
    session,
    isAuthenticated: authState === 'authenticated',
    error,
    signIn,
    signOut,
    walletAvailable,
  };
}
