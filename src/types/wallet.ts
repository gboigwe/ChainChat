/**
 * TypeScript Type Definitions for Wallet Integration
 * ChainChat - AI DeFi Strategy Engine
 */

/**
 * Wallet connection types
 */
export type ConnectionType = 'auto' | 'walletconnect' | 'browser-extension' | null;

/**
 * Supported Stacks networks
 */
export type StacksNetwork = 'mainnet' | 'testnet';

/**
 * Wallet provider types
 */
export type WalletProviderType =
  | 'browser-extension'
  | 'mobile-desktop'
  | 'multi-sig'
  | 'universal';

/**
 * User profile data from Stacks authentication
 */
export interface UserProfile {
  stxAddress: {
    mainnet: string;
    testnet: string;
  };
  [key: string]: any;
}

/**
 * Wallet connection data
 */
export interface WalletData {
  /** Mainnet address */
  address: string;

  /** Testnet address */
  testnetAddress: string;

  /** User profile data */
  profile: UserProfile;

  /** Connection type used */
  connectionType?: ConnectionType;

  /** ISO timestamp of connection */
  connectedAt?: string;

  /** Current network */
  network?: StacksNetwork;

  /** Sign-in status */
  isSignedIn?: boolean;
}

/**
 * Wallet metadata stored in localStorage
 */
export interface WalletMetadata {
  address: string;
  connectionType: ConnectionType;
  connectedAt: string;
  network: StacksNetwork;
}

/**
 * Connection state
 */
export interface ConnectionState {
  isConnecting: boolean;
  lastError: string | null;
  connectionType: ConnectionType;
  connectionTimestamp: number | null;
}

/**
 * Wallet connection options
 */
export interface WalletConnectionOptions {
  /** Force wallet selection modal */
  forceWalletSelect?: boolean;

  /** Persist wallet selection */
  persistWalletSelect?: boolean;

  /** Enable provider compatibility fixes */
  enableOverrides?: boolean;

  /** Enable local storage */
  enableLocalStorage?: boolean;
}

/**
 * Supported wallet provider
 */
export interface SupportedWallet {
  name: string;
  icon: string;
  type: WalletProviderType;
  description: string;
  downloadUrl: string;
}

/**
 * WalletConnect session data
 */
export interface WalletConnectSession {
  topic: string;
  namespaces: {
    stacks?: {
      accounts: string[];
      methods: string[];
      events: string[];
    };
  };
  [key: string]: any;
}

/**
 * Contract call parameters
 */
export interface ContractCallParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: any[];
  postConditions?: any[];
  postConditionMode?: any;
}

/**
 * STX transfer parameters
 */
export interface STXTransferParams {
  recipient: string;
  amount: bigint;
  memo?: string;
}

/**
 * Contract deployment parameters
 */
export interface ContractDeployParams {
  contractName: string;
  codeBody: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  txid: string;
  [key: string]: any;
}

/**
 * Wallet hook return type
 */
export interface UseWalletReturn {
  // State
  walletData: WalletData | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionType: ConnectionType;
  address: string | null;
  testnetAddress: string | null;

  // Actions
  connect: () => Promise<WalletData>;
  connectViaWalletConnect: () => Promise<WalletData>;
  disconnect: () => boolean;
  refresh: () => void;
  reconnect: () => WalletData | null;
}

/**
 * WalletConnect client interface
 */
export interface IWalletConnectClient {
  initialize(): Promise<any>;
  connect(): Promise<{ address: string; session: any; network: StacksNetwork }>;
  disconnect(): Promise<boolean>;
  getAddress(): string | null;
  signMessage(message: string): Promise<any>;
  transferSTX(recipient: string, amount: bigint, memo?: string): Promise<TransactionResult>;
  contractCall(params: ContractCallParams): Promise<TransactionResult>;
  deployContract(contractName: string, codeBody: string): Promise<TransactionResult>;
  isConnected(): boolean;
  getSession(): WalletConnectSession | null;
  restoreSession(session: WalletConnectSession): Promise<boolean>;
}

/**
 * Reown AppKit configuration
 */
export interface ReownAppKitConfig {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  chains: string[];
  network: StacksNetwork;
}

/**
 * Wallet events
 */
export interface WalletEvents {
  'chainchat:wallet:connected': CustomEvent<WalletData>;
  'chainchat:wallet:disconnected': CustomEvent<{ address: string }>;
  'chainchat:wallet:reconnected': CustomEvent<WalletData>;
  'walletconnect:connect': CustomEvent<{ address: string; session: any }>;
  'walletconnect:disconnect': CustomEvent<void>;
}

/**
 * Type-safe event dispatcher
 */
export type WalletEventType = keyof WalletEvents;

/**
 * Type-safe event listener
 */
export type WalletEventListener<K extends WalletEventType> = (
  event: WalletEvents[K]
) => void;

export default {
  ConnectionType,
  StacksNetwork,
  WalletProviderType,
  UserProfile,
  WalletData,
  WalletMetadata,
  ConnectionState,
  WalletConnectionOptions,
  SupportedWallet,
  WalletConnectSession,
  ContractCallParams,
  STXTransferParams,
  ContractDeployParams,
  TransactionResult,
  UseWalletReturn,
  IWalletConnectClient,
  ReownAppKitConfig,
  WalletEvents,
  WalletEventType,
  WalletEventListener,
};
