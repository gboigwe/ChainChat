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
