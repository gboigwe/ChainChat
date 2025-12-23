/**
 * ChainChat Wallet Utilities - Enhanced Edition
 * Integrates Reown (WalletConnect) with Stacks blockchain
 *
 * Features:
 * - @stacks/connect integration (600+ wallets via WalletConnect)
 * - Enhanced error handling and logging
 * - Session persistence and management
 * - Network configuration (Mainnet/Testnet)
 * - Event-driven architecture
 * - Security best practices
 *
 * @version 2.0.0
 */

import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

// IMPORTANT: Replace with your actual Reown (WalletConnect) Project ID
// Get it from https://cloud.reown.com/
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// App configuration for Stacks authentication
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network configuration (use testnet for development, mainnet for production)
const NETWORK = import.meta.env.VITE_NETWORK === 'mainnet'
  ? STACKS_MAINNET
  : STACKS_TESTNET;

// Connection state management
let connectionState = {
  isConnecting: false,
  lastError: null,
  connectionType: null,
  connectionTimestamp: null,
};

/**
 * Connect wallet using Reown (WalletConnect)
 * Supports 600+ wallets through WalletConnect protocol
 *
 * @param {Object} options - Connection options
 * @param {boolean} options.forceWalletSelect - Force wallet selection modal
 * @param {boolean} options.persistWalletSelect - Persist wallet selection
 * @returns {Promise<Object>} Wallet connection data
 * @throws {Error} If connection fails or user cancels
 */
export const connectWallet = async (options = {}) => {
  // Prevent multiple simultaneous connection attempts
  if (connectionState.isConnecting) {
    throw new Error('Connection already in progress');
  }

  connectionState.isConnecting = true;
  connectionState.lastError = null;

  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'ChainChat - AI DeFi Strategy Engine',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        try {
          const userData = userSession.loadUserData();

          const walletData = {
            address: userData.profile.stxAddress.mainnet,
            testnetAddress: userData.profile.stxAddress.testnet,
            profile: userData.profile,
            connectionType: 'auto',
            connectedAt: new Date().toISOString(),
            network: import.meta.env.VITE_NETWORK || 'mainnet',
          };

          // Update connection state
          connectionState.isConnecting = false;
          connectionState.connectionType = 'auto';
          connectionState.connectionTimestamp = Date.now();

          // Store connection metadata
          localStorage.setItem('chainchat_wallet_metadata', JSON.stringify({
            address: walletData.address,
            connectionType: walletData.connectionType,
            connectedAt: walletData.connectedAt,
            network: walletData.network,
          }));

          // Dispatch custom event for app-wide notification
          window.dispatchEvent(new CustomEvent('chainchat:wallet:connected', {
            detail: walletData,
          }));

          console.log('✅ Wallet connected successfully:', walletData.address);
          resolve(walletData);
        } catch (error) {
          connectionState.isConnecting = false;
          connectionState.lastError = error.message;
          console.error('❌ Failed to process wallet connection:', error);
          reject(error);
        }
      },
      onCancel: () => {
        connectionState.isConnecting = false;
        const error = new Error('User cancelled authentication');
        connectionState.lastError = error.message;

        console.log('⚠️ User cancelled wallet connection');
        reject(error);
      },
      userSession,
      // Reown (WalletConnect) integration
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      // Enable provider compatibility fixes
      enableOverrides: true,
      // Enable local storage for address persistence
      enableLocalStorage: true,
      // Apply custom options
      ...options,
    });
  });
};

/**
 * Connect wallet with WalletConnect explicitly
 * Forces WalletConnect selection for multi-wallet support (600+ wallets)
 *
 * @param {Object} options - WalletConnect-specific options
 * @returns {Promise<Object>} Wallet connection data
 * @throws {Error} If connection fails or user cancels
 */
export const connectWithWalletConnect = async (options = {}) => {
  // Prevent multiple simultaneous connection attempts
  if (connectionState.isConnecting) {
    throw new Error('Connection already in progress');
  }

  connectionState.isConnecting = true;
  connectionState.lastError = null;

  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'ChainChat - AI DeFi Strategy Engine',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        try {
          const userData = userSession.loadUserData();

          const walletData = {
            address: userData.profile.stxAddress.mainnet,
            testnetAddress: userData.profile.stxAddress.testnet,
            profile: userData.profile,
            connectionType: 'walletconnect',
            connectedAt: new Date().toISOString(),
            network: import.meta.env.VITE_NETWORK || 'mainnet',
          };

          // Update connection state
          connectionState.isConnecting = false;
          connectionState.connectionType = 'walletconnect';
          connectionState.connectionTimestamp = Date.now();

          // Store connection metadata
          localStorage.setItem('chainchat_wallet_metadata', JSON.stringify({
            address: walletData.address,
            connectionType: walletData.connectionType,
            connectedAt: walletData.connectedAt,
            network: walletData.network,
          }));

          // Dispatch custom event for app-wide notification
          window.dispatchEvent(new CustomEvent('chainchat:wallet:connected', {
            detail: walletData,
          }));

          console.log('✅ WalletConnect connected successfully:', walletData.address);
          resolve(walletData);
        } catch (error) {
          connectionState.isConnecting = false;
          connectionState.lastError = error.message;
          console.error('❌ Failed to process WalletConnect connection:', error);
          reject(error);
        }
      },
      onCancel: () => {
        connectionState.isConnecting = false;
        const error = new Error('User cancelled WalletConnect authentication');
        connectionState.lastError = error.message;

        console.log('⚠️ User cancelled WalletConnect connection');
        reject(error);
      },
      userSession,
      // Enable WalletConnect with Project ID
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      // Force wallet selection modal
      forceWalletSelect: true,
      // Persist wallet selection for better UX
      persistWalletSelect: true,
      // Enable provider compatibility fixes
      enableOverrides: true,
      // Enable local storage
      enableLocalStorage: true,
      // Apply custom options
      ...options,
    });
  });
};

/**
 * Disconnect current wallet session
 * Clears all wallet data and resets connection state
 *
 * @returns {boolean} True if disconnection successful
 */
export const disconnectWallet = () => {
  try {
    if (userSession.isUserSignedIn()) {
      const address = getWalletData()?.address;

      // Sign out from Stacks Connect
      userSession.signUserOut();

      // Clear connection state
      connectionState = {
        isConnecting: false,
        lastError: null,
        connectionType: null,
        connectionTimestamp: null,
      };

      // Clear stored metadata
      localStorage.removeItem('chainchat_wallet_metadata');

      // Dispatch custom event for app-wide notification
      window.dispatchEvent(new CustomEvent('chainchat:wallet:disconnected', {
        detail: { address },
      }));

      console.log('✅ Wallet disconnected successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to disconnect wallet:', error);
    return false;
  }
};

/**
 * Get current wallet data with metadata
 *
 * @returns {Object|null} Wallet data or null if not connected
 */
export const getWalletData = () => {
  if (!userSession.isUserSignedIn()) {
    return null;
  }

  try {
    const userData = userSession.loadUserData();

    // Get stored metadata
    const metadataStr = localStorage.getItem('chainchat_wallet_metadata');
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    return {
      address: userData.profile.stxAddress.mainnet,
      testnetAddress: userData.profile.stxAddress.testnet,
      profile: userData.profile,
      isSignedIn: true,
      connectionType: metadata.connectionType || connectionState.connectionType,
      connectedAt: metadata.connectedAt,
      network: metadata.network || import.meta.env.VITE_NETWORK || 'mainnet',
    };
  } catch (error) {
    console.error('❌ Failed to get wallet data:', error);
    return null;
  }
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = () => {
  return userSession.isUserSignedIn();
};

/**
 * Get network configuration
 */
export const getNetwork = () => {
  return NETWORK;
};

/**
 * Get current network name
 */
export const getNetworkName = () => {
  return import.meta.env.VITE_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet';
};

/**
 * Validate WalletConnect Project ID configuration
 *
 * @returns {boolean} True if configuration is valid
 */
export const validateWalletConnectSetup = () => {
  if (!WALLETCONNECT_PROJECT_ID || WALLETCONNECT_PROJECT_ID === 'YOUR_PROJECT_ID') {
    console.warn(
      '⚠️ WalletConnect Project ID not configured. Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file.\n' +
      'Get your Project ID from https://cloud.reown.com/'
    );
    return false;
  }
  return true;
};

/**
 * Get connection state information
 *
 * @returns {Object} Current connection state
 */
export const getConnectionState = () => {
  return { ...connectionState };
};

/**
 * Get wallet metadata from storage
 *
 * @returns {Object|null} Stored wallet metadata
 */
export const getWalletMetadata = () => {
  try {
    const metadataStr = localStorage.getItem('chainchat_wallet_metadata');
    return metadataStr ? JSON.parse(metadataStr) : null;
  } catch (error) {
    console.error('❌ Failed to get wallet metadata:', error);
    return null;
  }
};

/**
 * Check if wallet connection is expired (24 hours)
 *
 * @returns {boolean} True if connection is expired
 */
export const isConnectionExpired = () => {
  const metadata = getWalletMetadata();
  if (!metadata || !metadata.connectedAt) {
    return false;
  }

  const connectedTime = new Date(metadata.connectedAt).getTime();
  const currentTime = Date.now();
  const hoursPassed = (currentTime - connectedTime) / (1000 * 60 * 60);

  return hoursPassed > 24; // Expire after 24 hours
};

/**
 * Reconnect wallet if session exists
 *
 * @returns {Object|null} Wallet data if reconnection successful
 */
export const reconnectWallet = () => {
  if (userSession.isUserSignedIn() && !isConnectionExpired()) {
    const walletData = getWalletData();

    if (walletData) {
      console.log('✅ Wallet reconnected from existing session');

      // Dispatch reconnection event
      window.dispatchEvent(new CustomEvent('chainchat:wallet:reconnected', {
        detail: walletData,
      }));

      return walletData;
    }
  }
  return null;
};

/**
 * Format address for display (e.g., "SP1234...ABCD")
 *
 * @param {string} address - Full address
 * @param {number} prefixLength - Characters to show at start
 * @param {number} suffixLength - Characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

/**
 * Get supported wallets list
 *
 * @returns {Array<Object>} List of supported wallet providers
 */
export const getSupportedWallets = () => {
  return [
    {
      name: 'Leather (Hiro Wallet)',
      icon: '👛',
      type: 'browser-extension',
      description: 'Official Hiro wallet for Stacks',
      downloadUrl: 'https://leather.io/',
    },
    {
      name: 'Xverse',
      icon: '💼',
      type: 'mobile-desktop',
      description: 'Bitcoin & Stacks wallet',
      downloadUrl: 'https://www.xverse.app/',
    },
    {
      name: 'Asigna',
      icon: '🔐',
      type: 'multi-sig',
      description: 'Multi-signature wallet for teams',
      downloadUrl: 'https://asigna.io/',
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      type: 'universal',
      description: '600+ wallets via WalletConnect protocol',
      downloadUrl: 'https://walletconnect.com/',
    },
  ];
};

// Export all utilities
export default {
  connectWallet,
  connectWithWalletConnect,
  disconnectWallet,
  getWalletData,
  isWalletConnected,
  getNetwork,
  getNetworkName,
  validateWalletConnectSetup,
  getConnectionState,
  getWalletMetadata,
  isConnectionExpired,
  reconnectWallet,
  formatAddress,
  getSupportedWallets,
  userSession,
};
