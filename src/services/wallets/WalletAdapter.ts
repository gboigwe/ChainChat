/**
 * Wallet Adapter Interface
 * Unified abstraction layer for all wallet providers
 */

export interface WalletAccount {
  address: string;
  publicKey?: string;
  network?: string;
}

export interface WalletCapabilities {
  supportsMessageSigning: boolean;
  supportsNFTs: boolean;
  supportsStacking: boolean;
  supportsPsbt: boolean;
  supportsMultiSig: boolean;
}

export interface WalletMetadata {
  id: string;
  name: string;
  icon: string;
  description: string;
  downloadUrl?: string;
  deepLink?: string;
  mobileSupport: boolean;
  desktopSupport: boolean;
}

export interface TransactionOptions {
  fee?: number;
  nonce?: number;
  postConditions?: any[];
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

export interface ConnectionOptions {
  appName?: string;
  appIcon?: string;
  network?: 'mainnet' | 'testnet';
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

export abstract class WalletAdapter {
  protected _account: WalletAccount | null = null;
  protected _isConnected: boolean = false;
  protected _isConnecting: boolean = false;
  protected _capabilities: WalletCapabilities = {
    supportsMessageSigning: false,
    supportsNFTs: false,
    supportsStacking: false,
    supportsPsbt: false,
    supportsMultiSig: false,
  };

  abstract get metadata(): WalletMetadata;

  get account(): WalletAccount | null {
    return this._account;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get isConnecting(): boolean {
    return this._isConnecting;
  }

  get capabilities(): WalletCapabilities {
    return this._capabilities;
  }

  /**
   * Check if the wallet is installed/available
   */
  abstract isInstalled(): Promise<boolean>;

  /**
   * Connect to the wallet
   */
  abstract connect(options?: ConnectionOptions): Promise<WalletAccount>;

  /**
   * Disconnect from the wallet
   */
  abstract disconnect(): Promise<void>;

  /**
   * Get current account information
   */
  abstract getAccount(): Promise<WalletAccount | null>;

  /**
   * Sign and broadcast a transaction
   */
  abstract signTransaction(
    txOptions: any,
    options?: TransactionOptions
  ): Promise<string>;

  /**
   * Sign a message (if supported)
   */
  async signMessage(message: string): Promise<string> {
    if (!this.capabilities.supportsMessageSigning) {
      throw new Error(`${this.metadata.name} does not support message signing`);
    }
    throw new Error('signMessage not implemented');
  }

  /**
   * Get wallet version
   */
  async getVersion(): Promise<string> {
    return 'unknown';
  }

  /**
   * Switch network (if supported)
   */
  async switchNetwork(network: 'mainnet' | 'testnet'): Promise<void> {
    throw new Error('Network switching not supported by this wallet');
  }

  /**
   * Listen for account changes
   */
  onAccountChange(callback: (account: WalletAccount | null) => void): () => void {
    // Return unsubscribe function
    return () => {};
  }

  /**
   * Listen for network changes
   */
  onNetworkChange(callback: (network: string) => void): () => void {
    // Return unsubscribe function
    return () => {};
  }

  /**
   * Listen for disconnection
   */
  onDisconnect(callback: () => void): () => void {
    // Return unsubscribe function
    return () => {};
  }
}

export default WalletAdapter;
