/**
 * React hook for Stacks wallet connection via @stacks/connect
 * Manages connection state and provides connect/disconnect actions
 */

import { useState, useEffect, useCallback } from 'react';
import { connectWallet, getAuthSession, signOut, isWalletAvailable, type WalletUser } from '../lib/wallet-auth';
import { type StacksAddress } from '../types/stacks';

interface UseStacksConnectResult {
  isConnected: boolean;
  isConnecting: boolean;
  user: WalletUser | null;
  address: StacksAddress | null;
  error: Error | null;
  walletAvailable: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useStacksConnect(): UseStacksConnectResult {
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<WalletUser | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Load persisted session on mount
  useEffect(() => {
    const session = getAuthSession();
    if (session.isSignedIn && session.user) {
      setUser(session.user);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletUser = await connectWallet('ChainChat');
      setUser(walletUser);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Wallet connection failed');
      // Don't set error for user cancellation
      if (!error.message.includes('cancelled')) {
        setError(error);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    signOut();
    setUser(null);
    setError(null);
  }, []);

  return {
    isConnected: user !== null,
    isConnecting,
    user,
    address: user?.stxAddress ?? null,
    error,
    walletAvailable: isWalletAvailable(),
    connect,
    disconnect,
  };
}
