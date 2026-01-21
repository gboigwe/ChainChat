/**
 * WalletConnect Client for Stacks Blockchain
 * Direct WalletConnect v2 implementation for advanced wallet integration
 * Supports 600+ wallets through WalletConnect protocol
 */

import Client from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import {
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  PostConditionMode,
} from '@stacks/transactions';

// Stacks Chain IDs
export const STACKS_CHAINS = {
  mainnet: 'stacks:1',
  testnet: 'stacks:2147483648',
};

// Bitcoin Chain IDs (for sBTC and related operations)
export const BITCOIN_CHAINS = {
  mainnet: 'bip122:000000000019d6689c085ae165831e93',
  testnet: 'bip122:000000000933ea01ad0ee984209779ba',
};

// Supported methods for Stacks
const STACKS_METHODS = [
  'stacks_signMessage',
  'stacks_stxTransfer',
  'stacks_contractCall',
  'stacks_contractDeploy',
];

// BigInt JSON serialization workaround
if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

/**
 * WalletConnect Client Manager
 */
class WalletConnectClient {
  constructor() {
    this.client = null;
    this.session = null;
    this.projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    this.network = import.meta.env.VITE_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  }

  /**
   * Initialize WalletConnect client
   */
  async initialize() {
    if (this.client) {
      return this.client;
    }

    try {
      this.client = await Client.init({
        logger: import.meta.env.DEV ? 'debug' : 'error',
        relayUrl: 'wss://relay.walletconnect.com',
        projectId: this.projectId,
        metadata: {
          name: 'ChainChat - AI DeFi Strategy Engine',
          description: 'Simplified DeFi strategies for Stacks blockchain',
          url: window.location.origin,
          icons: [`${window.location.origin}/logo.png`],
        },
      });

      // Set up event listeners
      this.setupEventListeners();

      console.log('WalletConnect client initialized successfully');
      return this.client;
    } catch (error) {
      console.error('Failed to initialize WalletConnect client:', error);
      throw new Error(`WalletConnect initialization failed: ${error.message}`);
    }
  }

  /**
   * Set up event listeners for session events
   */
  setupEventListeners() {
    if (!this.client) return;

    // Session proposal event
    this.client.on('session_proposal', (event) => {
      console.log('Session proposal received:', event);
    });

    // Session request event
    this.client.on('session_request', (event) => {
      console.log('Session request received:', event);
    });

    // Session delete event
    this.client.on('session_delete', (event) => {
      console.log('Session deleted:', event);
      this.session = null;
      // Notify application of disconnection
      window.dispatchEvent(new CustomEvent('walletconnect:disconnect'));
    });

    // Session update event
    this.client.on('session_update', (event) => {
      console.log('Session updated:', event);
    });

    // Session event
    this.client.on('session_event', (event) => {
      console.log('Session event:', event);
    });
  }

  /**
   * Connect to wallet using WalletConnect
   * @returns {Promise<Object>} Session data including addresses
   */
  async connect() {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const chain = STACKS_CHAINS[this.network];

      const { uri, approval } = await this.client.connect({
        pairingTopic: undefined,
        requiredNamespaces: {
          stacks: {
            methods: STACKS_METHODS,
            chains: [chain],
            events: [],
          },
        },
      });

      // Open QR Code Modal
      if (uri) {
        QRCodeModal.open(uri, () => {
          console.log('QR Code Modal closed');
        });
      }

      // Wait for session approval
      this.session = await approval();

      // Close QR Code Modal
      QRCodeModal.close();

      // Extract address from session
      const address = this.getAddress();

      console.log('WalletConnect session established:', {
        address,
        chain,
        topic: this.session.topic,
      });

      // Notify application of connection
      window.dispatchEvent(
        new CustomEvent('walletconnect:connect', {
          detail: { address, session: this.session },
        })
      );

      return {
        address,
        session: this.session,
        network: this.network,
      };
    } catch (error) {
      QRCodeModal.close();
      console.error('WalletConnect connection failed:', error);
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }

  /**
   * Disconnect current session
   */
  async disconnect() {
    if (!this.session || !this.client) {
      return false;
    }

    try {
      await this.client.disconnect({
        topic: this.session.topic,
        reason: {
          code: 6000,
          message: 'User disconnected',
        },
      });

      this.session = null;
      console.log('WalletConnect session disconnected');
      return true;
    } catch (error) {
      console.error('Failed to disconnect WalletConnect session:', error);
      return false;
    }
  }

  /**
   * Get current wallet address
   */
  getAddress() {
    if (!this.session) {
      return null;
    }

    try {
      const accounts = this.session.namespaces.stacks?.accounts || [];
      if (accounts.length === 0) {
        return null;
      }

      // Extract address from CAIP-10 format: chain:network:address
      const address = accounts[0].split(':')[2];
      return address;
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }

  /**
   * Sign a message
   * @param {string} message - Message to sign
   * @returns {Promise<Object>} Signature data
   */
  async signMessage(message) {
    if (!this.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = STACKS_CHAINS[this.network];

    try {
      const result = await this.client.request({
        chainId: chain,
        topic: this.session.topic,
        request: {
          method: 'stacks_signMessage',
          params: {
            pubkey: address,
            message,
          },
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error(`Message signing failed: ${error.message}`);
    }
  }

  /**
   * Transfer STX tokens
   * @param {string} recipient - Recipient address
   * @param {bigint} amount - Amount in microSTX
   * @param {string} memo - Optional memo
   * @returns {Promise<Object>} Transaction result
   */
  async transferSTX(recipient, amount, memo = '') {
    if (!this.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = STACKS_CHAINS[this.network];

    try {
      const result = await this.client.request({
        chainId: chain,
        topic: this.session.topic,
        request: {
          method: 'stacks_stxTransfer',
          params: {
            pubkey: address,
            recipient,
            amount: BigInt(amount),
            memo,
          },
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to transfer STX:', error);
      throw new Error(`STX transfer failed: ${error.message}`);
    }
  }

  /**
   * Call a smart contract
   * @param {Object} params - Contract call parameters
   * @returns {Promise<Object>} Transaction result
   */
  async contractCall({
    contractAddress,
    contractName,
    functionName,
    functionArgs = [],
    postConditions = [],
    postConditionMode = PostConditionMode.Deny,
  }) {
    if (!this.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = STACKS_CHAINS[this.network];

    try {
      const result = await this.client.request({
        chainId: chain,
        topic: this.session.topic,
        request: {
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
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to call contract:', error);
      throw new Error(`Contract call failed: ${error.message}`);
    }
  }

  /**
   * Deploy a smart contract
   * @param {string} contractName - Name for the contract
   * @param {string} codeBody - Clarity contract code
   * @returns {Promise<Object>} Transaction result
   */
  async deployContract(contractName, codeBody) {
    if (!this.session) {
      throw new Error('No active session. Please connect first.');
    }

    const address = this.getAddress();
    const chain = STACKS_CHAINS[this.network];

    try {
      const result = await this.client.request({
        chainId: chain,
        topic: this.session.topic,
        request: {
          method: 'stacks_contractDeploy',
          params: {
            pubkey: address,
            contractName,
            codeBody,
            postConditionMode: PostConditionMode.Allow,
          },
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw new Error(`Contract deployment failed: ${error.message}`);
    }
  }

  /**
   * Check if session is active
   */
  isConnected() {
    return !!this.session;
  }

  /**
   * Get current session
   */
  getSession() {
    return this.session;
  }

  /**
   * Restore session from storage
   * @param {Object} session - Saved session object
   */
  async restoreSession(session) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Verify session is still valid
      const activeSessions = this.client.session.getAll();
      const validSession = activeSessions.find((s) => s.topic === session.topic);

      if (validSession) {
        this.session = validSession;
        console.log('Session restored successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return false;
    }
  }
}

// Export singleton instance
export const walletConnectClient = new WalletConnectClient();

export default WalletConnectClient;
