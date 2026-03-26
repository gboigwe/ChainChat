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
