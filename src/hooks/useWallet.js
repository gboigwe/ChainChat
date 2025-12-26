/**
 * Custom React Hook for Wallet Management - Enhanced Edition
 * Provides wallet state and actions using Reown (WalletConnect)
 *
 * Features:
 * - Auto-reconnection on mount
 * - Event-driven state updates
 * - Enhanced error handling
 * - Connection expiry detection
 * - Session persistence
 * - Multiple connection methods
 *
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  connectWallet,
  connectWithWalletConnect,
  disconnectWallet,
  getWalletData,
  isWalletConnected,
  validateWalletConnectSetup,
  reconnectWallet,
  isConnectionExpired,
  formatAddress,
  // Transaction operations
  transferSTX,
  callContract,
  signMessage,
  signStructuredMessage,
  deployContract,
  // Post condition helpers
  createSTXPostCondition,
  createFungiblePostCondition,
  createNFTPostCondition,
  // Clarity value helpers
  ClarityValues,
  // Utility helpers
  microStxToStx,
  stxToMicroStx,
} from '../utils/wallet';

export const useWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionType, setConnectionType] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);

  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMounted = useRef(true);

  // Initialize wallet connection on mount
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Validate WalletConnect setup
    const isValid = validateWalletConnectSetup();
    if (!isValid) {
      console.warn('WalletConnect not properly configured');
    }

    // Try to reconnect from existing session
    if (isWalletConnected() && !isConnectionExpired()) {
      const data = reconnectWallet();
      if (data && isMounted.current) {
        setWalletData(data);
        setConnectionType(data.connectionType || null);
        setLastActivity(new Date());
        console.log('Auto-reconnected to wallet:', formatAddress(data.address));
      }
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Set up event listeners for wallet events
  useEffect(() => {
    const handleConnect = (event) => {
      if (isMounted.current && event.detail) {
        setWalletData(event.detail);
        setConnectionType(event.detail.connectionType || null);
        setError(null);
        setLastActivity(new Date());
      }
    };

    const handleDisconnect = () => {
      if (isMounted.current) {
        setWalletData(null);
        setConnectionType(null);
        setError(null);
        setLastActivity(new Date());
      }
    };

    const handleReconnect = (event) => {
      if (isMounted.current && event.detail) {
        setWalletData(event.detail);
        setConnectionType(event.detail.connectionType || null);
        setError(null);
        setLastActivity(new Date());
      }
    };

    // Add event listeners
    window.addEventListener('chainchat:wallet:connected', handleConnect);
    window.addEventListener('chainchat:wallet:disconnected', handleDisconnect);
    window.addEventListener('chainchat:wallet:reconnected', handleReconnect);

    // Cleanup
    return () => {
      window.removeEventListener('chainchat:wallet:connected', handleConnect);
      window.removeEventListener('chainchat:wallet:disconnected', handleDisconnect);
      window.removeEventListener('chainchat:wallet:reconnected', handleReconnect);
    };
  }, []);

  /**
   * Connect wallet (auto-detect connection method)
   * @returns {Promise<WalletData>} Wallet connection data
   */
  const connect = useCallback(async (options = {}) => {
    if (!isMounted.current) return;

    setIsConnecting(true);
    setError(null);

    try {
      const data = await connectWallet(options);

      if (isMounted.current) {
        setWalletData(data);
        setConnectionType(data.connectionType || 'auto');
        setLastActivity(new Date());
      }

      return data;
    } catch (err) {
      if (isMounted.current) {
        setError(err.message);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setIsConnecting(false);
      }
    }
  }, []);

  /**
   * Connect wallet using WalletConnect (Reown)
   * Supports 600+ wallets
   * @returns {Promise<WalletData>} Wallet connection data
   */
  const connectViaWalletConnect = useCallback(async (options = {}) => {
    if (!isMounted.current) return;

    setIsConnecting(true);
    setError(null);

    try {
      const data = await connectWithWalletConnect(options);

      if (isMounted.current) {
        setWalletData(data);
        setConnectionType('walletconnect');
        setLastActivity(new Date());
      }

      return data;
    } catch (err) {
      if (isMounted.current) {
        setError(err.message);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setIsConnecting(false);
      }
    }
  }, []);

  /**
   * Disconnect current wallet
   * @returns {boolean} True if disconnection successful
   */
  const disconnect = useCallback(() => {
    const success = disconnectWallet();

    if (success && isMounted.current) {
      setWalletData(null);
      setConnectionType(null);
      setError(null);
      setLastActivity(new Date());
    }

    return success;
  }, []);

  /**
   * Refresh wallet data from session
   */
  const refresh = useCallback(() => {
    if (!isMounted.current) return;

    if (isWalletConnected() && !isConnectionExpired()) {
      const data = getWalletData();
      setWalletData(data);
      setConnectionType(data?.connectionType || null);
    } else {
      setWalletData(null);
      setConnectionType(null);
    }

    setLastActivity(new Date());
  }, []);

  /**
   * Reconnect wallet from existing session
   * @returns {WalletData|null} Wallet data if reconnection successful
   */
  const reconnect = useCallback(() => {
    if (!isMounted.current) return null;

    const data = reconnectWallet();

    if (data && isMounted.current) {
      setWalletData(data);
      setConnectionType(data.connectionType || null);
      setError(null);
      setLastActivity(new Date());
    }

    return data;
  }, []);

  /**
   * Check if connection is expired
   * @returns {boolean} True if connection is expired
   */
  const checkExpiry = useCallback(() => {
    return isConnectionExpired();
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    if (isMounted.current) {
      setError(null);
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
    btcAddress: walletData?.btcAddress || null,
    publicKey: walletData?.publicKey || null,
    network: walletData?.network || null,
    connectedAt: walletData?.connectedAt || null,
    lastActivity,

    // Connection Actions
    connect,
    connectViaWalletConnect,
    disconnect,
    refresh,
    reconnect,
    checkExpiry,
    clearError,

    // Transaction Operations (direct exports - @stacks/connect v8+)
    transferSTX,
    callContract,
    signMessage,
    signStructuredMessage,
    deployContract,

    // Post Condition Helpers
    createSTXPostCondition,
    createFungiblePostCondition,
    createNFTPostCondition,

    // Clarity Value Helpers
    ClarityValues,

    // Utility Helpers
    formatAddress: (addr) => formatAddress(addr),
    microStxToStx,
    stxToMicroStx,
  };
};

export default useWallet;
