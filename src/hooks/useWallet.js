/**
 * Custom React Hook for Wallet Management
 * Provides wallet state and actions using Reown (WalletConnect)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  connectWallet,
  connectWithWalletConnect,
  disconnectWallet,
  getWalletData,
  isWalletConnected,
  validateWalletConnectSetup,
} from '../utils/wallet';

export const useWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionType, setConnectionType] = useState(null);

  // Check wallet connection status on mount
  useEffect(() => {
    if (isWalletConnected()) {
      const data = getWalletData();
      setWalletData(data);
    }

    // Validate WalletConnect setup
    validateWalletConnectSetup();
  }, []);

  /**
   * Connect wallet (auto-detect connection method)
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const data = await connectWallet();
      setWalletData(data);
      setConnectionType('auto');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Connect wallet using WalletConnect (Reown)
   * Supports 600+ wallets
   */
  const connectViaWalletConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const data = await connectWithWalletConnect();
      setWalletData(data);
      setConnectionType('walletconnect');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect current wallet
   */
  const disconnect = useCallback(() => {
    const success = disconnectWallet();
    if (success) {
      setWalletData(null);
      setConnectionType(null);
      setError(null);
    }
    return success;
  }, []);

  /**
   * Refresh wallet data
   */
  const refresh = useCallback(() => {
    if (isWalletConnected()) {
      const data = getWalletData();
      setWalletData(data);
    } else {
      setWalletData(null);
    }
  }, []);

  return {
    // State
    walletData,
    isConnected: !!walletData,
    isConnecting,
    error,
    connectionType,
    address: walletData?.address || null,
    testnetAddress: walletData?.testnetAddress || null,

    // Actions
    connect,
    connectViaWalletConnect,
    disconnect,
    refresh,
  };
};

export default useWallet;
