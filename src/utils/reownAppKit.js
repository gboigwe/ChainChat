/**
 * Reown AppKit Integration for Stacks Blockchain
 * Alternative modern implementation using Reown's AppKit
 *
 * Features:
 * - Universal Connector for Stacks blockchain
 * - Modern UI with AppKit components
 * - 600+ wallet support via WalletConnect
 * - Built-in wallet modals and UI
 * - Chain-agnostic architecture
 *
 * @version 1.0.0
 */

import { createAppKit } from '@reown/appkit';
import { UniversalProvider } from '@reown/appkit-core';

// Stacks chain configuration
const STACKS_MAINNET_CONFIG = {
  chainNamespace: 'stacks',
  caipNetworkId: 'stacks:1',
  name: 'Stacks Mainnet',
  currency: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
  },
  rpcUrl: 'https://stacks-node-api.mainnet.stacks.co',
  explorerUrl: 'https://explorer.hiro.so',
};

const STACKS_TESTNET_CONFIG = {
  chainNamespace: 'stacks',
  caipNetworkId: 'stacks:2147483648',
  name: 'Stacks Testnet',
  currency: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
  },
  rpcUrl: 'https://stacks-node-api.testnet.stacks.co',
  explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
};

/**
 * Reown AppKit Manager
 */
class ReownAppKitManager {
  constructor() {
    this.appKit = null;
    this.provider = null;
    this.projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    this.network = import.meta.env.VITE_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
    this.isInitialized = false;
  }

  /**
   * Initialize Reown AppKit
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('Reown AppKit already initialized');
      return this.appKit;
    }

    if (!this.projectId || this.projectId === 'YOUR_PROJECT_ID') {
      throw new Error(
        'Reown Project ID not configured. Set VITE_WALLETCONNECT_PROJECT_ID in your .env file.\n' +
          'Get your Project ID from https://cloud.reown.com/'
      );
    }

    try {
      // Get network configuration
      const networkConfig =
        this.network === 'mainnet' ? STACKS_MAINNET_CONFIG : STACKS_TESTNET_CONFIG;

      // Create metadata
      const metadata = {
        name: 'ChainChat - AI DeFi Strategy Engine',
        description: 'Simplified DeFi strategies for Stacks blockchain',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`],
      };

      // Initialize Universal Provider for Stacks
      this.provider = await UniversalProvider.init({
        projectId: this.projectId,
        metadata,
        relayUrl: 'wss://relay.walletconnect.com',
      });

      // Create AppKit instance
      this.appKit = createAppKit({
        projectId: this.projectId,
        metadata,
        adapters: [],
        networks: [networkConfig],
        features: {
          analytics: true, // Enable analytics
          email: false, // Disable email login for blockchain-only
          socials: false, // Disable social logins
        },
      });

      this.isInitialized = true;
      console.log('✅ Reown AppKit initialized successfully');

      return this.appKit;
    } catch (error) {
      console.error('❌ Failed to initialize Reown AppKit:', error);
      throw new Error(`AppKit initialization failed: ${error.message}`);
    }
  }

  /**
   * Open wallet connection modal
   */
  async connect() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Open the AppKit modal
      if (this.appKit) {
        await this.appKit.open();
      }

      // Use Universal Provider to connect
      const chain = this.network === 'mainnet' ? STACKS_MAINNET_CONFIG.caipNetworkId : STACKS_TESTNET_CONFIG.caipNetworkId;

      const session = await this.provider.connect({
        namespaces: {
          stacks: {
            methods: [
              'stacks_signMessage',
              'stacks_stxTransfer',
              'stacks_contractCall',
              'stacks_contractDeploy',
            ],
            chains: [chain],
            events: [],
          },
        },
      });

      // Get connected address
      const accounts = session.namespaces.stacks?.accounts || [];
      const address = accounts.length > 0 ? accounts[0].split(':')[2] : null;

      if (!address) {
        throw new Error('No address returned from wallet connection');
      }

      console.log('✅ Connected via Reown AppKit:', address);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('chainchat:appkit:connected', {
          detail: { address, session },
        })
      );

      return {
        address,
        session,
        network: this.network,
        connectionType: 'reown-appkit',
      };
    } catch (error) {
      console.error('❌ Failed to connect via Reown AppKit:', error);
      throw new Error(`AppKit connection failed: ${error.message}`);
    }
  }

  /**
   * Disconnect current session
   */
  async disconnect() {
    if (!this.provider) {
      return false;
    }

    try {
      await this.provider.disconnect();
      console.log('✅ Disconnected from Reown AppKit');

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('chainchat:appkit:disconnected'));

      return true;
    } catch (error) {
      console.error('❌ Failed to disconnect from Reown AppKit:', error);
      return false;
    }
  }

  /**
   * Get current connection status
   */
  isConnected() {
    return this.provider?.session !== undefined;
  }

  /**
   * Get current address
   */
  getAddress() {
    if (!this.provider?.session) {
      return null;
    }

    try {
      const accounts = this.provider.session.namespaces.stacks?.accounts || [];
      return accounts.length > 0 ? accounts[0].split(':')[2] : null;
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message) {
    if (!this.provider?.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = this.network === 'mainnet' ? STACKS_MAINNET_CONFIG.caipNetworkId : STACKS_TESTNET_CONFIG.caipNetworkId;

    try {
      const result = await this.provider.request({
        method: 'stacks_signMessage',
        params: {
          pubkey: address,
          message,
        },
        chainId: chain,
      });

      return result;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Transfer STX
   */
  async transferSTX(recipient, amount, memo = '') {
    if (!this.provider?.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = this.network === 'mainnet' ? STACKS_MAINNET_CONFIG.caipNetworkId : STACKS_TESTNET_CONFIG.caipNetworkId;

    try {
      const result = await this.provider.request({
        method: 'stacks_stxTransfer',
        params: {
          pubkey: address,
          recipient,
          amount: BigInt(amount),
          memo,
        },
        chainId: chain,
      });

      return result;
    } catch (error) {
      console.error('Failed to transfer STX:', error);
      throw error;
    }
  }

  /**
   * Call smart contract
   */
  async contractCall({
    contractAddress,
    contractName,
    functionName,
    functionArgs = [],
    postConditions = [],
    postConditionMode,
  }) {
    if (!this.provider?.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = this.network === 'mainnet' ? STACKS_MAINNET_CONFIG.caipNetworkId : STACKS_TESTNET_CONFIG.caipNetworkId;

    try {
      const result = await this.provider.request({
        method: 'stacks_contractCall',
        params: {
          pubkey: address,
          postConditions,
          contractAddress,
          contractName,
          functionName,
          functionArgs,
          postConditionMode,
        },
        chainId: chain,
      });

      return result;
    } catch (error) {
      console.error('Failed to call contract:', error);
      throw error;
    }
  }

  /**
   * Deploy smart contract
   */
  async deployContract(contractName, codeBody) {
    if (!this.provider?.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = this.network === 'mainnet' ? STACKS_MAINNET_CONFIG.caipNetworkId : STACKS_TESTNET_CONFIG.caipNetworkId;

    try {
      const result = await this.provider.request({
        method: 'stacks_contractDeploy',
        params: {
          pubkey: address,
          contractName,
          codeBody,
        },
        chainId: chain,
      });

      return result;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  /**
   * Get AppKit instance
   */
  getAppKit() {
    return this.appKit;
  }

  /**
   * Get provider instance
   */
  getProvider() {
    return this.provider;
  }
}

// Export singleton instance
export const reownAppKit = new ReownAppKitManager();

export default ReownAppKitManager;

/**
 * Example Usage:
 *
 * import { reownAppKit } from './utils/reownAppKit';
 *
 * // Initialize and connect
 * const { address } = await reownAppKit.connect();
 *
 * // Sign message
 * const signature = await reownAppKit.signMessage('Hello World');
 *
 * // Transfer STX
 * const tx = await reownAppKit.transferSTX('ST1234...', 1000000n);
 *
 * // Contract call
 * const result = await reownAppKit.contractCall({
 *   contractAddress: 'SP1234...',
 *   contractName: 'my-contract',
 *   functionName: 'my-function',
 *   functionArgs: [],
 * });
 *
 * // Disconnect
 * await reownAppKit.disconnect();
 */
