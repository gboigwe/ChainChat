/**
 * Wallet Configuration
 * Constants and configuration for wallet integrations
 */

import { WalletId } from '../services/wallets/WalletManager';

export interface WalletMetadata {
  id: WalletId;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  website: string;
  downloadUrl: string;
  deepLink: string;
  mobileSupport: boolean;
  desktopSupport: boolean;
  extensionSupport: boolean;
  hardwareWallet: boolean;
  supportedNetworks: string[];
}

/**
 * Wallet metadata configuration
 */
export const WALLET_METADATA: Record<WalletId, WalletMetadata> = {
  xverse: {
    id: 'xverse',
    name: 'Xverse',
    displayName: 'Xverse Wallet',
    icon: 'https://www.xverse.app/favicon.ico',
    description: 'Secure Bitcoin & Stacks wallet with NFT support',
    website: 'https://www.xverse.app',
    downloadUrl: 'https://www.xverse.app/download',
    deepLink: 'xverse://',
    mobileSupport: true,
    desktopSupport: true,
    extensionSupport: true,
    hardwareWallet: false,
    supportedNetworks: ['mainnet', 'testnet'],
  },
  leather: {
    id: 'leather',
    name: 'Leather',
    displayName: 'Leather (Hiro) Wallet',
    icon: 'https://leather.io/favicon.ico',
    description: 'Secure Bitcoin & Stacks wallet from Hiro',
    website: 'https://leather.io',
    downloadUrl: 'https://leather.io/install-extension',
    deepLink: 'leather://',
    mobileSupport: false,
    desktopSupport: true,
    extensionSupport: true,
    hardwareWallet: false,
    supportedNetworks: ['mainnet', 'testnet', 'devnet'],
  },
  boom: {
    id: 'boom',
    name: 'Boom',
    displayName: 'Boom Wallet',
    icon: 'https://boom.money/favicon.ico',
    description: 'Fast and secure Stacks wallet',
    website: 'https://boom.money',
    downloadUrl: 'https://boom.money/download',
    deepLink: 'boom://',
    mobileSupport: true,
    desktopSupport: true,
    extensionSupport: true,
    hardwareWallet: false,
    supportedNetworks: ['mainnet', 'testnet'],
  },
  ledger: {
    id: 'ledger',
    name: 'Ledger',
    displayName: 'Ledger Hardware Wallet',
    icon: 'https://www.ledger.com/favicon.ico',
    description: 'Hardware wallet for maximum security',
    website: 'https://www.ledger.com',
    downloadUrl: 'https://www.ledger.com/start',
    deepLink: '',
    mobileSupport: false,
    desktopSupport: true,
    extensionSupport: false,
    hardwareWallet: true,
    supportedNetworks: ['mainnet', 'testnet'],
  },
};

/**
 * Default wallet configuration
 */
export const DEFAULT_WALLET_CONFIG = {
  autoConnect: true,
  persistConnection: true,
  network: 'mainnet',
  appName: 'ChainChat',
  appIcon: '/logo.png',
};

/**
 * Wallet connection timeouts (ms)
 */
export const WALLET_TIMEOUTS = {
  connection: 60000, // 60 seconds
  transaction: 120000, // 2 minutes
  signature: 60000, // 60 seconds
};

/**
 * Wallet provider window object paths
 */
export const WALLET_PROVIDER_PATHS: Record<WalletId, string[]> = {
  xverse: ['XverseProviders.StacksProvider', 'StacksProvider'],
  leather: ['LeatherProvider', 'HiroWalletProvider'],
  boom: ['BoomProvider'],
  ledger: [], // Hardware wallet, no window provider
};

/**
 * Storage keys for wallet state
 */
export const STORAGE_KEYS = {
  walletState: 'chainchat_wallet_state',
  activeWallet: 'chainchat_active_wallet',
  connectedWallets: 'chainchat_connected_wallets',
  lastUsed: 'chainchat_last_wallet',
};

/**
 * Wallet feature support matrix
 */
export const WALLET_FEATURES = {
  xverse: {
    messageSigningSupport: true,
    nftSupport: true,
    stackingSupport: true,
    psbtSupport: true,
    multiSigSupport: false,
    brc20Support: true,
    ordinalsSupport: true,
  },
  leather: {
    messageSigningSupport: true,
    nftSupport: true,
    stackingSupport: true,
    psbtSupport: true,
    multiSigSupport: false,
    brc20Support: false,
    ordinalsSupport: false,
  },
  boom: {
    messageSigningSupport: true,
    nftSupport: true,
    stackingSupport: true,
    psbtSupport: false,
    multiSigSupport: false,
    brc20Support: false,
    ordinalsSupport: false,
  },
  ledger: {
    messageSigningSupport: true,
    nftSupport: false,
    stackingSupport: true,
    psbtSupport: true,
    multiSigSupport: true,
    brc20Support: false,
    ordinalsSupport: false,
  },
};

/**
 * Recommended wallets by platform
 */
export const RECOMMENDED_WALLETS = {
  mobile: ['xverse', 'boom'] as WalletId[],
  desktop: ['leather', 'xverse'] as WalletId[],
  hardware: ['ledger'] as WalletId[],
};

/**
 * Error messages
 */
export const WALLET_ERRORS = {
  NOT_INSTALLED: 'Wallet not installed. Please install the wallet extension.',
  CONNECTION_REJECTED: 'Connection request was rejected.',
  CONNECTION_TIMEOUT: 'Connection request timed out.',
  TRANSACTION_REJECTED: 'Transaction was rejected.',
  TRANSACTION_FAILED: 'Transaction failed to broadcast.',
  SIGNATURE_REJECTED: 'Signature request was rejected.',
  NETWORK_MISMATCH: 'Network mismatch. Please switch networks.',
  WALLET_LOCKED: 'Wallet is locked. Please unlock your wallet.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
};

export default {
  WALLET_METADATA,
  DEFAULT_WALLET_CONFIG,
  WALLET_TIMEOUTS,
  WALLET_PROVIDER_PATHS,
  STORAGE_KEYS,
  WALLET_FEATURES,
  RECOMMENDED_WALLETS,
  WALLET_ERRORS,
};
