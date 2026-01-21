/**
 * ChainChat Wallet Utilities - v8+ Edition
 * Integrates Reown (WalletConnect) with Stacks blockchain using @stacks/connect v8+
 *
 * Features:
 * - @stacks/connect v8+ API (connect() and request() methods)
 * - Transaction operations (STX transfer, contract calls, message signing)
 * - Post conditions for transaction security
 * - 600+ wallets via WalletConnect/Reown
 * - Enhanced error handling and logging
 * - Session persistence and management
 * - Network configuration (Mainnet/Testnet)
 * - Event-driven architecture
 * - Security best practices
 *
 * @version 3.0.0
 */

import {
  connect,
  disconnect,
  request,
  isConnected,
  getLocalStorage
} from '@stacks/connect';
import {
  StacksMainnet,
  StacksTestnet
} from '@stacks/network';
import {
  makeStandardSTXPostCondition,
  makeStandardFungiblePostCondition,
  makeStandardNFTPostCondition,
  FungibleConditionCode,
  NonFungibleConditionCode,
  PostConditionMode,
  createAssetInfo,
  uintCV,
  intCV,
  boolCV,
  stringAsciiCV,
  stringUtf8CV,
  principalCV,
  bufferCV,
  tupleCV,
} from '@stacks/transactions';

// IMPORTANT: Replace with your actual Reown (WalletConnect) Project ID
// Get it from https://cloud.reown.com/
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Network configuration (use testnet for development, mainnet for production)
const getNetwork = () => {
  return import.meta.env.VITE_NETWORK === 'mainnet'
    ? new StacksMainnet()
    : new StacksTestnet();
};

// Connection state management
let connectionState = {
  isConnecting: false,
  lastError: null,
  connectionType: null,
  connectionTimestamp: null,
};

/**
 * Connect wallet using Reown (WalletConnect) - v8+ API
 * Supports 600+ wallets through WalletConnect protocol
 *
 * @param {Object} options - Connection options
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

  try {
    // Use the new connect() API from @stacks/connect v8+
    const response = await connect({
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      ...options,
    });

    // Extract wallet data from response
    const walletData = {
      address: response.addresses.stx[0].address,
      testnetAddress: response.addresses.stx[1]?.address || response.addresses.stx[0].address,
      btcAddress: response.addresses.btc[0].address,
      profile: response.profile || {},
      publicKey: response.publicKey,
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
    return walletData;

  } catch (error) {
    connectionState.isConnecting = false;
    connectionState.lastError = error.message;

    // Handle specific error cases
    if (error.message && error.message.includes('User denied')) {
      console.log('⚠️ User cancelled wallet connection');
      throw new Error('User cancelled authentication');
    }

    console.error('❌ Failed to connect wallet:', error);
    throw error;
  }
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
  return connectWallet({
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    ...options,
  });
};

/**
 * Disconnect current wallet session - v8+ API
 * Clears all wallet data and resets connection state
 *
 * @returns {boolean} True if disconnection successful
 */
export const disconnectWallet = () => {
  try {
    const address = getWalletData()?.address;

    // Use the new disconnect() API from @stacks/connect v8+
    disconnect();

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

  } catch (error) {
    console.error('❌ Failed to disconnect wallet:', error);
    return false;
  }
};

/**
 * Get current wallet data with metadata - v8+ API
 *
 * @returns {Object|null} Wallet data or null if not connected
 */
export const getWalletData = () => {
  if (!isConnected()) {
    return null;
  }

  try {
    // Use the new getLocalStorage() API from @stacks/connect v8+
    const userData = getLocalStorage();

    if (!userData || !userData.addresses) {
      return null;
    }

    // Get stored metadata
    const metadataStr = localStorage.getItem('chainchat_wallet_metadata');
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    return {
      address: userData.addresses.stx[0].address,
      testnetAddress: userData.addresses.stx[1]?.address || userData.addresses.stx[0].address,
      btcAddress: userData.addresses.btc[0]?.address,
      profile: userData.profile || {},
      publicKey: userData.publicKey,
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
 * Check if wallet is connected - v8+ API
 */
export const isWalletConnected = () => {
  return isConnected();
};

/**
 * =============================================================================
 * TRANSACTION OPERATIONS - Using request() method from @stacks/connect v8+
 * =============================================================================
 */

/**
 * Transfer STX tokens to a recipient
 *
 * @param {string} recipient - Recipient address
 * @param {string|bigint} amount - Amount in micro-STX (1 STX = 1,000,000 micro-STX)
 * @param {string} memo - Optional memo (max 34 bytes)
 * @param {Array} postConditions - Optional post conditions for security
 * @returns {Promise<Object>} Transaction result with txId
 */
export const transferSTX = async (recipient, amount, memo = '', postConditions = []) => {
  try {
    // Convert amount to string if it's a BigInt
    const amountStr = typeof amount === 'bigint' ? amount.toString() : amount;

    // Add default post condition if none provided (protect sender)
    const senderAddress = getWalletData()?.address;
    if (postConditions.length === 0 && senderAddress) {
      postConditions.push(
        makeStandardSTXPostCondition(
          senderAddress,
          FungibleConditionCode.LessEqual,
          BigInt(amountStr)
        )
      );
    }

    const result = await request('stx_transferStx', {
      recipient,
      amount: amountStr,
      memo: memo || '',
      postConditions,
      postConditionMode: PostConditionMode.Deny,
    });

    console.log('✅ STX transfer successful:', result);
    return result;

  } catch (error) {
    console.error('❌ STX transfer failed:', error);
    throw error;
  }
};

/**
 * Call a smart contract function
 *
 * @param {string} contractAddress - Contract address
 * @param {string} contractName - Contract name
 * @param {string} functionName - Function to call
 * @param {Array} functionArgs - Function arguments (Clarity values)
 * @param {Array} postConditions - Post conditions for security
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Transaction result with txId
 */
export const callContract = async (
  contractAddress,
  contractName,
  functionName,
  functionArgs = [],
  postConditions = [],
  options = {}
) => {
  try {
    const result = await request('stx_callContract', {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      postConditions,
      postConditionMode: options.postConditionMode || PostConditionMode.Deny,
      ...options,
    });

    console.log('✅ Contract call successful:', result);
    return result;

  } catch (error) {
    console.error('❌ Contract call failed:', error);
    throw error;
  }
};

/**
 * Sign a message (unstructured)
 *
 * @param {string} message - Message to sign
 * @returns {Promise<Object>} Signature result with signature and publicKey
 */
export const signMessage = async (message) => {
  try {
    const result = await request('stx_signMessage', {
      message,
    });

    console.log('✅ Message signed successfully');
    return result;

  } catch (error) {
    console.error('❌ Message signing failed:', error);
    throw error;
  }
};

/**
 * Sign a structured message (SIP-018 compliant)
 *
 * @param {Object} message - Structured message (Clarity value)
 * @param {Object} domain - Domain separator
 * @returns {Promise<Object>} Signature result
 */
export const signStructuredMessage = async (message, domain) => {
  try {
    const result = await request('stx_signStructuredMessage', {
      message,
      domain,
    });

    console.log('✅ Structured message signed successfully');
    return result;

  } catch (error) {
    console.error('❌ Structured message signing failed:', error);
    throw error;
  }
};

/**
 * Deploy a smart contract
 *
 * @param {string} contractName - Name for the contract
 * @param {string} codeBody - Clarity code
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Transaction result with txId
 */
export const deployContract = async (contractName, codeBody, options = {}) => {
  try {
    const result = await request('stx_deployContract', {
      contractName,
      codeBody,
      postConditionMode: options.postConditionMode || PostConditionMode.Allow,
      ...options,
    });

    console.log('✅ Contract deployed successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Contract deployment failed:', error);
    throw error;
  }
};

/**
 * =============================================================================
 * POST CONDITIONS HELPERS
 * =============================================================================
 */

/**
 * Create STX post condition
 *
 * @param {string} address - Address
 * @param {string} conditionCode - Condition code ('Equal', 'Greater', 'GreaterEqual', 'Less', 'LessEqual')
 * @param {bigint} amount - Amount in micro-STX
 * @returns {Object} Post condition
 */
export const createSTXPostCondition = (address, conditionCode, amount) => {
  const code = FungibleConditionCode[conditionCode] || FungibleConditionCode.Equal;
  return makeStandardSTXPostCondition(address, code, amount);
};

/**
 * Create fungible token post condition
 *
 * @param {string} address - Address
 * @param {string} conditionCode - Condition code
 * @param {bigint} amount - Token amount
 * @param {string} contractAddress - Token contract address
 * @param {string} contractName - Token contract name
 * @param {string} assetName - Asset name
 * @returns {Object} Post condition
 */
export const createFungiblePostCondition = (
  address,
  conditionCode,
  amount,
  contractAddress,
  contractName,
  assetName
) => {
  const code = FungibleConditionCode[conditionCode] || FungibleConditionCode.Equal;
  const assetInfo = createAssetInfo(contractAddress, contractName, assetName);
  return makeStandardFungiblePostCondition(address, code, amount, assetInfo);
};

/**
 * Create NFT post condition
 *
 * @param {string} address - Address
 * @param {string} conditionCode - Condition code ('Sends' or 'DoesNotSend')
 * @param {string} contractAddress - NFT contract address
 * @param {string} contractName - NFT contract name
 * @param {string} assetName - NFT asset name
 * @param {*} tokenId - Token ID (Clarity value)
 * @returns {Object} Post condition
 */
export const createNFTPostCondition = (
  address,
  conditionCode,
  contractAddress,
  contractName,
  assetName,
  tokenId
) => {
  const code = NonFungibleConditionCode[conditionCode] || NonFungibleConditionCode.Sends;
  const assetInfo = createAssetInfo(contractAddress, contractName, assetName);
  return makeStandardNFTPostCondition(address, code, assetInfo, tokenId);
};

/**
 * =============================================================================
 * CLARITY VALUE HELPERS
 * =============================================================================
 */

/**
 * Create Clarity value helpers for contract interactions
 */
export const ClarityValues = {
  uint: (value) => uintCV(value),
  int: (value) => intCV(value),
  bool: (value) => boolCV(value),
  principal: (address) => principalCV(address),
  stringAscii: (str) => stringAsciiCV(str),
  stringUtf8: (str) => stringUtf8CV(str),
  buffer: (buf) => bufferCV(buf),
  tuple: (data) => tupleCV(data),
};

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Get network configuration
 */
export { getNetwork };

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
  if (isConnected() && !isConnectionExpired()) {
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
      description: '600+ wallets via WalletConnect/Reown protocol',
      downloadUrl: 'https://walletconnect.com/',
    },
  ];
};

/**
 * Convert micro-STX to STX
 * @param {string|number|bigint} microStx - Amount in micro-STX
 * @returns {number} Amount in STX
 */
export const microStxToStx = (microStx) => {
  return Number(microStx) / 1000000;
};

/**
 * Convert STX to micro-STX
 * @param {string|number} stx - Amount in STX
 * @returns {bigint} Amount in micro-STX
 */
export const stxToMicroStx = (stx) => {
  return BigInt(Math.floor(Number(stx) * 1000000));
};

// Export all utilities
export default {
  // Connection methods
  connectWallet,
  connectWithWalletConnect,
  disconnectWallet,
  getWalletData,
  isWalletConnected,
  reconnectWallet,

  // Transaction methods
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

  // Utility methods
  getNetwork,
  getNetworkName,
  validateWalletConnectSetup,
  getConnectionState,
  getWalletMetadata,
  isConnectionExpired,
  formatAddress,
  getSupportedWallets,
  microStxToStx,
  stxToMicroStx,
};
