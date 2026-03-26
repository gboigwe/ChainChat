/**
 * Nonce manager for Stacks transactions
 * Tracks in-flight nonces to prevent conflicts when sending multiple transactions
 */

import { getHiroClient } from './hiro-api';
import { type StacksNetworkName } from '../config/network-config';
import { type StacksAddress, type Nonce } from '../types/stacks';

interface NonceState {
  confirmedNonce: bigint;
  pendingNonce: bigint;
  lastFetched: number;
  inFlightCount: number;
}

const NONCE_TTL_MS = 10_000; // 10 seconds

/**
 * Manages nonces for one or more Stacks addresses
 */
export class NonceManager {
  private cache = new Map<string, NonceState>();
  private network?: StacksNetworkName;

  constructor(network?: StacksNetworkName) {
    this.network = network;
  }

  /**
   * Get the next nonce to use for an address
   * Increments the in-flight counter to prevent reuse
   */
  async getNextNonce(address: StacksAddress | string): Promise<Nonce> {
    const addr = address.toString();
    const now = Date.now();

    let state = this.cache.get(addr);

    // Refresh if cache miss or stale
    if (!state || now - state.lastFetched > NONCE_TTL_MS) {
      const client = getHiroClient(this.network);
      const nonce = await client.getAccountNonce(addr);
      state = {
        confirmedNonce: nonce,
        pendingNonce: nonce,
        lastFetched: now,
        inFlightCount: 0,
      };
      this.cache.set(addr, state);
    }

    const nextNonce = state.pendingNonce + BigInt(state.inFlightCount);
    state.inFlightCount++;

    return nextNonce as Nonce;
  }

  /**
   * Confirm a nonce was used (remove from in-flight)
   */
  confirmNonce(address: StacksAddress | string): void {
    const addr = address.toString();
    const state = this.cache.get(addr);
    if (state && state.inFlightCount > 0) {
      state.inFlightCount--;
      state.confirmedNonce++;
    }
  }

  /**
   * Reset nonce state for an address (e.g., on transaction failure)
   */
  reset(address: StacksAddress | string): void {
    this.cache.delete(address.toString());
  }

  /**
   * Reset all cached nonces
   */
  resetAll(): void {
    this.cache.clear();
  }

  /**
   * Force refresh nonce from node
   */
  async refresh(address: StacksAddress | string): Promise<Nonce> {
    this.reset(address);
    return this.getNextNonce(address);
  }

  /**
   * Get the current in-flight count for an address
   */
  getInFlightCount(address: StacksAddress | string): number {
    return this.cache.get(address.toString())?.inFlightCount ?? 0;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _manager: NonceManager | null = null;

export function getNonceManager(network?: StacksNetworkName): NonceManager {
  if (!_manager) {
    _manager = new NonceManager(network);
  }
  return _manager;
}

/**
 * Convenience: get next nonce for an address
 */
export async function getNextNonce(
  address: StacksAddress | string,
  network?: StacksNetworkName
): Promise<Nonce> {
  return getNonceManager(network).getNextNonce(address);
}
