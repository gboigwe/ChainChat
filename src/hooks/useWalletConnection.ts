/**
 * useWalletConnection Hook
 * React hook for managing wallet connections
 */

import { useState, useEffect, useCallback } from 'react';
import { walletManager, WalletId } from '../services/wallets/WalletManager';
import { WalletAccount } from '../services/wallets/WalletAdapter';

export interface UseWalletConnectionResult {
  account: WalletAccount | null;
  activeWallet: WalletId | null;
  connectedWallets: WalletId[];
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: (walletId: WalletId, options?: any) => Promise<void>;
  disconnect: (walletId?: WalletId) => Promise<void>;
  switchWallet: (walletId: WalletId) => void;
}

export function useWalletConnection(): UseWalletConnectionResult {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [activeWallet, setActiveWallet] = useState<WalletId | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<WalletId[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update state from wallet manager
  const updateState = useCallback(() => {
    const state = walletManager.getState();
    setAccount(walletManager.getActiveAccount());
    setActiveWallet(state.activeWallet);
    setConnectedWallets(state.connectedWallets);
  }, []);

  // Subscribe to wallet manager changes
  useEffect(() => {
    updateState();

    const unsubscribe = walletManager.subscribe(() => {
      updateState();
    });

    return unsubscribe;
  }, [updateState]);

  // Connect to a wallet
  const connect = useCallback(
    async (walletId: WalletId, options?: any) => {
      setIsConnecting(true);
      setError(null);

      try {
        await walletManager.connect(walletId, options);
      } catch (err: any) {
        console.error('Connection error:', err);
        setError(err);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  // Disconnect from a wallet (or all wallets if no walletId specified)
  const disconnect = useCallback(async (walletId?: WalletId) => {
    setError(null);

    try {
      if (walletId) {
        await walletManager.disconnect(walletId);
      } else if (activeWallet) {
        await walletManager.disconnect(activeWallet);
      }
    } catch (err: any) {
      console.error('Disconnection error:', err);
      setError(err);
      throw err;
    }
  }, [activeWallet]);

  // Switch active wallet
  const switchWallet = useCallback((walletId: WalletId) => {
    setError(null);

    try {
      walletManager.switchWallet(walletId);
    } catch (err: any) {
      console.error('Switch wallet error:', err);
      setError(err);
      throw err;
    }
  }, []);

  return {
    account,
    activeWallet,
    connectedWallets,
    isConnected: !!account,
    isConnecting,
    error,
    connect,
    disconnect,
    switchWallet,
  };
}

export default useWalletConnection;
