/**
 * Xverse Wallet Adapter
 * Integration for Xverse wallet (browser extension and mobile)
 */

import WalletAdapter, {
  WalletAccount,
  WalletMetadata,
  ConnectionOptions,
  TransactionOptions,
} from './WalletAdapter';

declare global {
  interface Window {
    XverseProviders?: {
      StacksProvider?: any;
    };
  }
}

export class XverseAdapter extends WalletAdapter {
  private provider: any = null;

  get metadata(): WalletMetadata {
    return {
      id: 'xverse',
      name: 'Xverse',
      icon: 'https://www.xverse.app/favicon.ico',
      description: 'Xverse is a Bitcoin and Stacks wallet',
      downloadUrl: 'https://www.xverse.app/download',
      deepLink: 'xverse://',
      mobileSupport: true,
      desktopSupport: true,
    };
  }

  constructor() {
    super();
    this._capabilities = {
      supportsMessageSigning: true,
      supportsNFTs: true,
      supportsStacking: true,
      supportsPsbt: true,
      supportsMultiSig: false,
    };
  }

  async isInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for Xverse provider
    return !!(
      window.XverseProviders?.StacksProvider ||
      (window as any).StacksProvider
    );
  }

  async connect(options?: ConnectionOptions): Promise<WalletAccount> {
    this._isConnecting = true;

    try {
      const isInstalled = await this.isInstalled();
      if (!isInstalled) {
        throw new Error('Xverse wallet is not installed');
      }

      // Get the provider
      this.provider =
        window.XverseProviders?.StacksProvider || (window as any).StacksProvider;

      // Request connection
      const response = await this.provider.request('getAddresses', {
        appName: options?.appName || 'ChainChat',
        appIcon: options?.appIcon,
      });

      if (!response?.addresses || response.addresses.length === 0) {
        throw new Error('No addresses returned from Xverse');
      }

      // Get the Stacks address
      const stacksAddress = response.addresses.find(
        (addr: any) => addr.type === 'stacks'
      );

      if (!stacksAddress) {
        throw new Error('No Stacks address found');
      }

      this._account = {
        address: stacksAddress.address,
        publicKey: stacksAddress.publicKey,
        network: options?.network || 'mainnet',
      };

      this._isConnected = true;
      this._isConnecting = false;

      if (options?.onFinish) {
        options.onFinish(this._account);
      }

      return this._account;
    } catch (error) {
      this._isConnecting = false;
      this._isConnected = false;

      if (options?.onCancel) {
        options.onCancel();
      }

      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this._account = null;
    this._isConnected = false;
    this.provider = null;
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this._isConnected || !this.provider) {
      return null;
    }

    try {
      const response = await this.provider.request('getAddresses', {});
      const stacksAddress = response.addresses.find(
        (addr: any) => addr.type === 'stacks'
      );

      if (stacksAddress) {
        this._account = {
          address: stacksAddress.address,
          publicKey: stacksAddress.publicKey,
        };
        return this._account;
      }
    } catch (error) {
      console.error('Failed to get Xverse account:', error);
    }

    return null;
  }

  async signTransaction(
    txOptions: any,
    options?: TransactionOptions
  ): Promise<string> {
    if (!this._isConnected || !this.provider) {
      throw new Error('Xverse wallet not connected');
    }

    try {
      const response = await this.provider.request('stx_callContract', {
        ...txOptions,
        onFinish: (data: any) => {
          if (options?.onFinish) {
            options.onFinish(data);
          }
        },
        onCancel: () => {
          if (options?.onCancel) {
            options.onCancel();
          }
        },
      });

      return response.txId || response.txid;
    } catch (error) {
      console.error('Xverse transaction failed:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this._isConnected || !this.provider) {
      throw new Error('Xverse wallet not connected');
    }

    try {
      const response = await this.provider.request('signMessage', {
        message,
        address: this._account?.address,
      });

      return response.signature;
    } catch (error) {
      console.error('Xverse message signing failed:', error);
      throw error;
    }
  }

  async getVersion(): Promise<string> {
    try {
      if (this.provider) {
        return this.provider.version || 'unknown';
      }
    } catch (error) {
      console.error('Failed to get Xverse version:', error);
    }
    return 'unknown';
  }

  onAccountChange(callback: (account: WalletAccount | null) => void): () => void {
    if (!this.provider) return () => {};

    const handler = (accounts: any) => {
      if (accounts && accounts.length > 0) {
        const stacksAddress = accounts.find((addr: any) => addr.type === 'stacks');
        if (stacksAddress) {
          callback({
            address: stacksAddress.address,
            publicKey: stacksAddress.publicKey,
          });
        }
      } else {
        callback(null);
      }
    };

    // Listen for account changes
    this.provider.on?.('accountsChanged', handler);

    // Return unsubscribe function
    return () => {
      this.provider.off?.('accountsChanged', handler);
    };
  }

  onDisconnect(callback: () => void): () => void {
    if (!this.provider) return () => {};

    this.provider.on?.('disconnect', callback);

    return () => {
      this.provider.off?.('disconnect', callback);
    };
  }
}

export default XverseAdapter;
