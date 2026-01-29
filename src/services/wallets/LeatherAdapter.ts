/**
 * Leather Wallet Adapter (formerly Hiro Wallet)
 * Integration for Leather/Hiro wallet
 */

import WalletAdapter, {
  WalletAccount,
  WalletMetadata,
  ConnectionOptions,
  TransactionOptions,
} from './WalletAdapter';
import { openContractCall } from '@stacks/connect';

declare global {
  interface Window {
    LeatherProvider?: any;
    HiroWalletProvider?: any;
  }
}

export class LeatherAdapter extends WalletAdapter {
  private provider: any = null;

  get metadata(): WalletMetadata {
    return {
      id: 'leather',
      name: 'Leather (Hiro)',
      icon: 'https://leather.io/favicon.ico',
      description: 'Leather is a Bitcoin and Stacks wallet (formerly Hiro)',
      downloadUrl: 'https://leather.io/install-extension',
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
      supportsMultiSig: true,
    };
  }

  async isInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for Leather or Hiro provider
    return !!(window.LeatherProvider || window.HiroWalletProvider);
  }

  async connect(options?: ConnectionOptions): Promise<WalletAccount> {
    this._isConnecting = true;

    try {
      const isInstalled = await this.isInstalled();
      if (!isInstalled) {
        throw new Error('Leather wallet is not installed');
      }

      // Get the provider (Leather or Hiro)
      this.provider = window.LeatherProvider || window.HiroWalletProvider;

      // Request connection using Stacks Connect
      const { userSession } = await import('@stacks/connect');

      // Check if already authenticated
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();

        this._account = {
          address: userData.profile.stxAddress.mainnet,
          publicKey: userData.profile.publicKey,
          network: options?.network || 'mainnet',
        };

        this._isConnected = true;
        this._isConnecting = false;

        if (options?.onFinish) {
          options.onFinish(this._account);
        }

        return this._account;
      }

      // Authenticate if not already signed in
      const { showConnect } = await import('@stacks/connect');

      return new Promise((resolve, reject) => {
        showConnect({
          appDetails: {
            name: options?.appName || 'ChainChat',
            icon: options?.appIcon || window.location.origin + '/logo.png',
          },
          onFinish: (authData: any) => {
            this._account = {
              address: authData.userSession.loadUserData().profile.stxAddress.mainnet,
              publicKey: authData.userSession.loadUserData().profile.publicKey,
              network: options?.network || 'mainnet',
            };

            this._isConnected = true;
            this._isConnecting = false;

            if (options?.onFinish) {
              options.onFinish(this._account);
            }

            resolve(this._account);
          },
          onCancel: () => {
            this._isConnecting = false;

            if (options?.onCancel) {
              options.onCancel();
            }

            reject(new Error('User cancelled connection'));
          },
        });
      });
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
    try {
      const { userSession } = await import('@stacks/connect');

      if (userSession.isUserSignedIn()) {
        userSession.signUserOut();
      }

      this._account = null;
      this._isConnected = false;
      this.provider = null;
    } catch (error) {
      console.error('Failed to disconnect Leather wallet:', error);
    }
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this._isConnected) {
      return null;
    }

    try {
      const { userSession } = await import('@stacks/connect');

      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();

        this._account = {
          address: userData.profile.stxAddress.mainnet,
          publicKey: userData.profile.publicKey,
        };

        return this._account;
      }
    } catch (error) {
      console.error('Failed to get Leather account:', error);
    }

    return null;
  }

  async signTransaction(
    txOptions: any,
    options?: TransactionOptions
  ): Promise<string> {
    if (!this._isConnected) {
      throw new Error('Leather wallet not connected');
    }

    try {
      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          onFinish: (data: any) => {
            if (options?.onFinish) {
              options.onFinish(data);
            }
            resolve(data.txId);
          },
          onCancel: () => {
            if (options?.onCancel) {
              options.onCancel();
            }
            reject(new Error('User cancelled transaction'));
          },
        });
      });
    } catch (error) {
      console.error('Leather transaction failed:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this._isConnected || !this.provider) {
      throw new Error('Leather wallet not connected');
    }

    try {
      const { openSignatureRequestPopup } = await import('@stacks/connect');

      return new Promise((resolve, reject) => {
        openSignatureRequestPopup({
          message,
          onFinish: (data: any) => {
            resolve(data.signature);
          },
          onCancel: () => {
            reject(new Error('User cancelled message signing'));
          },
        });
      });
    } catch (error) {
      console.error('Leather message signing failed:', error);
      throw error;
    }
  }

  async getVersion(): Promise<string> {
    try {
      if (this.provider?.version) {
        return this.provider.version;
      }
    } catch (error) {
      console.error('Failed to get Leather version:', error);
    }
    return 'unknown';
  }

  async switchNetwork(network: 'mainnet' | 'testnet'): Promise<void> {
    // Leather supports network switching
    if (this._account) {
      this._account.network = network;
    }
  }
}

export default LeatherAdapter;
