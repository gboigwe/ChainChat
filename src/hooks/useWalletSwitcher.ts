/**
 * useWalletSwitcher Hook
 * React hook for switching between multiple connected wallets
 */

import { useState, useEffect, useCallback } from 'react';
import { walletManager, WalletId } from '../services/wallets/WalletManager';
import { WalletAccount } from '../services/wallets/WalletAdapter';

export interface WalletOption {
  id: WalletId;
  name: string;
  address: string;
  account: WalletAccount;
  isActive: boolean;
}

export interface UseWalletSwitcherResult {
  walletOptions: WalletOption[];
  activeWalletId: WalletId | null;
  canSwitch: boolean;
  switchToWallet: (walletId: WalletId) => void;
  removeWallet: (walletId: WalletId) => Promise<void>;
}

export function useWalletSwitcher(): UseWalletSwitcherResult {
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<WalletId | null>(null);

  // Load wallet options from manager
  const loadWalletOptions = useCallback(() => {
    const state = walletManager.getState();
    const options: WalletOption[] = [];

    state.connectedWallets.forEach((walletId) => {
      const account = state.accounts.get(walletId);
      const adapter = walletManager.getAdapter(walletId);

      if (account && adapter) {
        options.push({
          id: walletId,
          name: adapter.metadata.name,
          address: account.address,
          account,
          isActive: walletId === state.activeWallet,
        });
      }
    });

    setWalletOptions(options);
    setActiveWalletId(state.activeWallet);
  }, []);

  // Subscribe to wallet manager changes
  useEffect(() => {
    loadWalletOptions();

    const unsubscribe = walletManager.subscribe(() => {
      loadWalletOptions();
    });

    return unsubscribe;
  }, [loadWalletOptions]);

  // Switch to a different wallet
  const switchToWallet = useCallback((walletId: WalletId) => {
    try {
      walletManager.switchWallet(walletId);
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      throw error;
    }
  }, []);

  // Remove a wallet from connected list
  const removeWallet = useCallback(async (walletId: WalletId) => {
    try {
      await walletManager.disconnect(walletId);
    } catch (error) {
      console.error('Failed to remove wallet:', error);
      throw error;
    }
  }, []);

  return {
    walletOptions,
    activeWalletId,
    canSwitch: walletOptions.length > 1,
    switchToWallet,
    removeWallet,
  };
}

export default useWalletSwitcher;
