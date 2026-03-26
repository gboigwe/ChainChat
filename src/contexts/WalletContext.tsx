// React context for wallet connection state
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserSessionData } from '../lib/connect/auth';
import { getUserSession, clearSession } from '../lib/connect/auth';
/** Wallet context state shape */
export interface WalletContextState {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';
  userData: UserSessionData | null;
  isConnecting: boolean;
  error: string | null;
}
/** Wallet context actions */
export interface WalletContextActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
  refreshSession: () => void;
}
/** Combined wallet context value */
export type WalletContextValue = WalletContextState & WalletContextActions;
/** Default state values */
const DEFAULT_STATE: WalletContextState = {
  isConnected: false,
  address: null,
  network: 'mainnet',
  userData: null,
  isConnecting: false,
  error: null,
};
/** The wallet React context */
export const WalletContext = createContext<WalletContextValue | null>(null);
/** Hook to consume wallet context */
export function useWalletContext(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}
/** Wallet context provider component */
export function WalletProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, setState] = useState<WalletContextState>(DEFAULT_STATE);
  const refreshSession = useCallback(() => {
    const session = getUserSession();
    setState(prev => ({
      ...prev,
      isConnected: session !== null,
      userData: session,
      address: session?.profile?.stxAddress?.mainnet ?? null,
    }));
  }, []);
  const disconnect = useCallback(() => {
    clearSession();
    setState(DEFAULT_STATE);
  }, []);
  const setNetwork = useCallback((network: 'mainnet' | 'testnet') => {
    setState(prev => ({ ...prev, network }));
  }, []);
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      // openAuth would be called here with @stacks/connect
      refreshSession();
    } catch (e) {
      setState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Connection failed' }));
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [refreshSession]);
  useEffect(() => { refreshSession(); }, [refreshSession]);
