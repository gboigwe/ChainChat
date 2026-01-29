/**
 * Custom React Hook for Wallet Management - Enhanced Edition
 * Provides wallet state and actions using Reown (WalletConnect) and Multi-Wallet Support
 *
 * Features:
 * - Auto-reconnection on mount
 * - Event-driven state updates
 * - Enhanced error handling
 * - Connection expiry detection
 * - Session persistence
 * - Multiple connection methods
 * - Multi-wallet integration (Xverse, Leather, Boom, Ledger)
 * - Backwards compatibility
 *
 * @version 3.0.0
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

// Multi-wallet imports
import { walletManager } from '../services/wallets/WalletManager';

export const useWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionType, setConnectionType] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);

  // Multi-wallet state
  const [multiWalletAccount, setMultiWalletAccount] = useState(null);
  const [activeWalletId, setActiveWalletId] = useState(null);

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

    // Try to reconnect from existing session (legacy)
    if (isWalletConnected() && !isConnectionExpired()) {
      const data = reconnectWallet();
      if (data && isMounted.current) {
        setWalletData(data);
        setConnectionType(data.connectionType || null);
        setLastActivity(new Date());
        console.log('Auto-reconnected to wallet:', formatAddress(data.address));
      }
    }

    // Subscribe to multi-wallet manager changes
    const unsubscribeMultiWallet = walletManager.subscribe((state) => {
      if (isMounted.current) {
        const account = walletManager.getActiveAccount();
        setMultiWalletAccount(account);
        setActiveWalletId(state.activeWallet);

        // If multi-wallet is connected, update connection type
        if (account) {
          setConnectionType(state.activeWallet);
        }
      }
    });

    // Load initial multi-wallet state
    const initialAccount = walletManager.getActiveAccount();
    const initialState = walletManager.getState();
    if (initialAccount) {
      setMultiWalletAccount(initialAccount);
      setActiveWalletId(initialState.activeWallet);
      if (!walletData) {
        setConnectionType(initialState.activeWallet);
      }
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
      unsubscribeMultiWallet();
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

  // Determine if any wallet is connected (legacy or multi-wallet)
  const hasConnection = !!walletData || !!multiWalletAccount;
  const displayAddress = multiWalletAccount?.address || walletData?.address || null;

  return {
    // State (with multi-wallet support)
    walletData,
    isConnected: hasConnection,
    isConnecting,
    error,
    connectionType,
    address: displayAddress,
    testnetAddress: walletData?.testnetAddress || null,
    btcAddress: walletData?.btcAddress || null,
    publicKey: multiWalletAccount?.publicKey || walletData?.publicKey || null,
    network: multiWalletAccount?.network || walletData?.network || null,
    connectedAt: walletData?.connectedAt || null,
    lastActivity,

    // Multi-wallet specific state
    multiWalletAccount,
    activeWalletId,
    connectedWallets: walletManager.getState().connectedWallets,

    // Connection Actions
    connect,
    connectViaWalletConnect,
    disconnect,
    refresh,
    reconnect,
    checkExpiry,
    clearError,

    // Multi-wallet actions
    walletManager,
    switchWallet: (walletId) => walletManager.switchWallet(walletId),
    getActiveAdapter: () => walletManager.getActiveAdapter(),

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
