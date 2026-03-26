// Wallet session state hook
import { useState, useCallback, useEffect } from 'react';
/** Wallet session state returned by hook */
export interface WalletSessionState {
  isConnected: boolean;
  address: string | null;
  profile: unknown | null;
  isConnecting: boolean;
  error: string | null;
  network: 'mainnet' | 'testnet';
}
/** Actions returned by useWalletSession */
export interface WalletSessionActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => void;
  setNetwork: (n: 'mainnet' | 'testnet') => void;
}
/** Combined return type */
export type UseWalletSessionReturn = WalletSessionState & WalletSessionActions;
/** Hook for wallet session management */
export function useWalletSession(): UseWalletSessionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<unknown | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const refresh = useCallback(() => {
    try {
      const raw = localStorage.getItem('blockstack-session');
      if (!raw) { setIsConnected(false); setAddress(null); return; }
      const data = JSON.parse(raw);
      setAddress(data?.profile?.stxAddress?.mainnet ?? null);
      setProfile(data?.profile ?? null);
      setIsConnected(true);
    } catch { setIsConnected(false); }
  }, []);
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try { refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to connect'); }
    finally { setIsConnecting(false); }
  }, [refresh]);
  const disconnect = useCallback(() => {
    localStorage.removeItem('blockstack-session');
    setIsConnected(false);
    setAddress(null);
    setProfile(null);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { isConnected, address, profile, isConnecting, error, network, connect, disconnect, refresh, setNetwork };
}
export const WALLET_SESSION_1 = 1;
export const WALLET_SESSION_2 = 2;
export const WALLET_SESSION_3 = 3;
export const WALLET_SESSION_4 = 4;
export const WALLET_SESSION_5 = 5;
export const WALLET_SESSION_6 = 6;
