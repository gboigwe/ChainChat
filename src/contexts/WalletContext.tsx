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
