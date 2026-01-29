/**
 * Wallet Manager
 * Central service for managing multiple wallet connections
 */

import WalletAdapter, { WalletAccount } from './WalletAdapter';
import XverseAdapter from './XverseAdapter';
import LeatherAdapter from './LeatherAdapter';
import BoomAdapter from './BoomAdapter';
import LedgerAdapter from './LedgerAdapter';

export type WalletId = 'xverse' | 'leather' | 'boom' | 'ledger';

export interface WalletManagerState {
  activeWallet: WalletId | null;
  connectedWallets: WalletId[];
  accounts: Map<WalletId, WalletAccount>;
}

class WalletManager {
  private adapters: Map<WalletId, WalletAdapter>;
  private state: WalletManagerState;
  private listeners: Set<(state: WalletManagerState) => void>;

  constructor() {
    // Initialize all wallet adapters
    this.adapters = new Map([
      ['xverse', new XverseAdapter()],
      ['leather', new LeatherAdapter()],
      ['boom', new BoomAdapter()],
      ['ledger', new LedgerAdapter()],
    ]);

    this.state = {
      activeWallet: null,
      connectedWallets: [],
      accounts: new Map(),
    };

    this.listeners = new Set();

    // Load persisted state
    this.loadPersistedState();
  }

  /**
   * Get all available wallet adapters
   */
  getAdapters(): Map<WalletId, WalletAdapter> {
    return this.adapters;
  }

  /**
   * Get a specific wallet adapter
   */
  getAdapter(walletId: WalletId): WalletAdapter | undefined {
    return this.adapters.get(walletId);
  }

  /**
   * Check which wallets are installed
   */
  async getInstalledWallets(): Promise<WalletId[]> {
    const installed: WalletId[] = [];

    for (const [id, adapter] of this.adapters) {
      try {
        const isInstalled = await adapter.isInstalled();
        if (isInstalled) {
          installed.push(id);
        }
      } catch (error) {
        console.error(`Error checking ${id} installation:`, error);
      }
    }

    return installed;
  }

  /**
   * Connect to a wallet
   */
  async connect(walletId: WalletId, options?: any): Promise<WalletAccount> {
    const adapter = this.adapters.get(walletId);

    if (!adapter) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    try {
      const account = await adapter.connect(options);

      // Update state
      if (!this.state.connectedWallets.includes(walletId)) {
        this.state.connectedWallets.push(walletId);
      }

      this.state.accounts.set(walletId, account);
      this.state.activeWallet = walletId;

      this.persistState();
      this.notifyListeners();

      return account;
    } catch (error) {
      console.error(`Failed to connect to ${walletId}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from a wallet
   */
  async disconnect(walletId: WalletId): Promise<void> {
    const adapter = this.adapters.get(walletId);

    if (!adapter) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    try {
      await adapter.disconnect();

      // Update state
      this.state.connectedWallets = this.state.connectedWallets.filter(
        (id) => id !== walletId
      );
      this.state.accounts.delete(walletId);

      if (this.state.activeWallet === walletId) {
        // Set active wallet to the first connected wallet, or null
        this.state.activeWallet = this.state.connectedWallets[0] || null;
      }

      this.persistState();
      this.notifyListeners();
    } catch (error) {
      console.error(`Failed to disconnect from ${walletId}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from all wallets
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.keys()).map((id) =>
      this.disconnect(id).catch((error) =>
        console.error(`Error disconnecting ${id}:`, error)
      )
    );

    await Promise.all(disconnectPromises);
  }

  /**
   * Switch active wallet
   */
  switchWallet(walletId: WalletId): void {
    if (!this.state.connectedWallets.includes(walletId)) {
      throw new Error(`Wallet ${walletId} is not connected`);
    }

    this.state.activeWallet = walletId;
    this.persistState();
    this.notifyListeners();
  }

  /**
   * Get active wallet adapter
   */
  getActiveAdapter(): WalletAdapter | null {
    if (!this.state.activeWallet) {
      return null;
    }

    return this.adapters.get(this.state.activeWallet) || null;
  }

  /**
   * Get active account
   */
  getActiveAccount(): WalletAccount | null {
    if (!this.state.activeWallet) {
      return null;
    }

    return this.state.accounts.get(this.state.activeWallet) || null;
  }

  /**
   * Get current state
   */
  getState(): WalletManagerState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WalletManagerState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in wallet manager listener:', error);
      }
    });
  }

  /**
   * Persist state to localStorage
   */
  private persistState(): void {
    try {
      const persistData = {
        activeWallet: this.state.activeWallet,
        connectedWallets: this.state.connectedWallets,
        accounts: Array.from(this.state.accounts.entries()),
      };

      localStorage.setItem('chainchat_wallet_state', JSON.stringify(persistData));
    } catch (error) {
      console.error('Failed to persist wallet state:', error);
    }
  }

  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('chainchat_wallet_state');

      if (stored) {
        const data = JSON.parse(stored);

        this.state.activeWallet = data.activeWallet;
        this.state.connectedWallets = data.connectedWallets || [];
        this.state.accounts = new Map(data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load persisted wallet state:', error);
    }
  }

  /**
   * Clear persisted state
   */
  clearPersistedState(): void {
    try {
      localStorage.removeItem('chainchat_wallet_state');
    } catch (error) {
      console.error('Failed to clear wallet state:', error);
    }
  }
}

// Export singleton instance
export const walletManager = new WalletManager();

export default WalletManager;
