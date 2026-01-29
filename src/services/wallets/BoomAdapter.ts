/**
 * Boom Wallet Adapter
 * Integration for Boom wallet
 */

import WalletAdapter, {
  WalletAccount,
  WalletMetadata,
  ConnectionOptions,
  TransactionOptions,
} from './WalletAdapter';

declare global {
  interface Window {
    BoomProvider?: any;
  }
}

export class BoomAdapter extends WalletAdapter {
  private provider: any = null;

  get metadata(): WalletMetadata {
    return {
      id: 'boom',
      name: 'Boom Wallet',
      icon: 'https://boom.money/favicon.ico',
      description: 'Boom is a Bitcoin and Stacks wallet',
      downloadUrl: 'https://boom.money',
      mobileSupport: true,
      desktopSupport: true,
    };
  }

  constructor() {
    super();
    this._capabilities = {
      supportsMessageSigning: true,
      supportsNFTs: true,
      supportsStacking: false,
      supportsPsbt: false,
      supportsMultiSig: false,
    };
  }

  async isInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    return !!window.BoomProvider;
  }

  async connect(options?: ConnectionOptions): Promise<WalletAccount> {
    this._isConnecting = true;

    try {
      const isInstalled = await this.isInstalled();
      if (!isInstalled) {
        throw new Error('Boom wallet is not installed');
      }

      this.provider = window.BoomProvider;

      // Request connection
      const response = await this.provider.request({
        method: 'stx_getAccounts',
      });

      if (!response || !response.result || response.result.length === 0) {
        throw new Error('No accounts returned from Boom wallet');
      }

      const address = response.result[0];

      this._account = {
        address,
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
      const response = await this.provider.request({
        method: 'stx_getAccounts',
      });

      if (response && response.result && response.result.length > 0) {
        this._account = {
          address: response.result[0],
        };
        return this._account;
      }
    } catch (error) {
      console.error('Failed to get Boom account:', error);
    }

    return null;
  }

  async signTransaction(
    txOptions: any,
    options?: TransactionOptions
  ): Promise<string> {
    if (!this._isConnected || !this.provider) {
      throw new Error('Boom wallet not connected');
    }

    try {
      const response = await this.provider.request({
        method: 'stx_callContract',
        params: txOptions,
      });

      if (options?.onFinish && response.result) {
        options.onFinish({ txId: response.result.txid });
      }

      return response.result.txid;
    } catch (error) {
      if (options?.onCancel) {
        options.onCancel();
      }
      console.error('Boom transaction failed:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this._isConnected || !this.provider) {
      throw new Error('Boom wallet not connected');
    }

    try {
      const response = await this.provider.request({
        method: 'stx_signMessage',
        params: {
          message,
          address: this._account?.address,
        },
      });

      return response.result.signature;
    } catch (error) {
      console.error('Boom message signing failed:', error);
      throw error;
    }
  }

  async getVersion(): Promise<string> {
    try {
      if (this.provider) {
        const response = await this.provider.request({
          method: 'wallet_getVersion',
        });
        return response.result || 'unknown';
      }
    } catch (error) {
      console.error('Failed to get Boom version:', error);
    }
    return 'unknown';
  }

  onAccountChange(callback: (account: WalletAccount | null) => void): () => void {
    if (!this.provider) return () => {};

    const handler = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        callback({ address: accounts[0] });
      } else {
        callback(null);
      }
    };

    this.provider.on?.('accountsChanged', handler);

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

export default BoomAdapter;
