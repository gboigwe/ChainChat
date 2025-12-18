/**
 * ChainChat Wallet Utilities
 * Integrates Reown (WalletConnect) with Stacks blockchain
 */

import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

// IMPORTANT: Replace with your actual Reown (WalletConnect) Project ID
// Get it from https://cloud.reown.com/
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// App configuration for Stacks authentication
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network configuration (use testnet for development, mainnet for production)
const NETWORK = import.meta.env.VITE_NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

/**
 * Connect wallet using Reown (WalletConnect)
 * Supports 600+ wallets through WalletConnect protocol
 */
export const connectWallet = async () => {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'ChainChat',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        resolve({
          address: userData.profile.stxAddress.mainnet,
          testnetAddress: userData.profile.stxAddress.testnet,
          profile: userData.profile,
        });
      },
      onCancel: () => {
        reject(new Error('User cancelled authentication'));
      },
      userSession,
      // Reown (WalletConnect) integration
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    });
  });
};

/**
 * Connect wallet with WalletConnect explicitly
 * Forces WalletConnect selection for multi-wallet support
 */
export const connectWithWalletConnect = async () => {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'ChainChat - AI DeFi Strategy Engine',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        resolve({
          address: userData.profile.stxAddress.mainnet,
          testnetAddress: userData.profile.stxAddress.testnet,
          profile: userData.profile,
          connectionType: 'walletconnect',
        });
      },
      onCancel: () => {
        reject(new Error('User cancelled WalletConnect authentication'));
      },
      userSession,
      // Enable WalletConnect with Project ID
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      // Force wallet selection modal
      forceWalletSelect: true,
      // Persist wallet selection for better UX
      persistWalletSelect: true,
    });
  });
};

/**
 * Disconnect current wallet session
 */
export const disconnectWallet = () => {
  if (userSession.isUserSignedIn()) {
    userSession.signUserOut();
    return true;
  }
  return false;
};

/**
 * Get current wallet data
 */
export const getWalletData = () => {
  if (!userSession.isUserSignedIn()) {
    return null;
  }

  const userData = userSession.loadUserData();
  return {
    address: userData.profile.stxAddress.mainnet,
    testnetAddress: userData.profile.stxAddress.testnet,
    profile: userData.profile,
    isSignedIn: true,
  };
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
 * Validate WalletConnect Project ID
 */
export const validateWalletConnectSetup = () => {
  if (!WALLETCONNECT_PROJECT_ID || WALLETCONNECT_PROJECT_ID === 'YOUR_PROJECT_ID') {
    console.warn(
      'WalletConnect Project ID not configured. Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file.\n' +
      'Get your Project ID from https://cloud.reown.com/'
    );
    return false;
  }
  return true;
};

export default {
  connectWallet,
  connectWithWalletConnect,
  disconnectWallet,
  getWalletData,
  isWalletConnected,
  getNetwork,
  getNetworkName,
  validateWalletConnectSetup,
  userSession,
};
