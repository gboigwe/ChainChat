// Nonce management for Stacks transactions
/** Nonce tracker state */
export interface NonceTrackerState {
  address: string;
  lastFetched: number;
  nonce: number;
  pending: number[];
}
/** Nonce tracker class for managing transaction sequences */
export class NonceTracker {
  private state: Map<string, NonceTrackerState> = new Map();
  getNonce(address: string): number {
    return this.state.get(address)?.nonce ?? 0;
  }
  setNonce(address: string, nonce: number): void {
    const existing = this.state.get(address);
    this.state.set(address, {
      address,
      lastFetched: Date.now(),
      nonce,
      pending: existing?.pending ?? [],
    });
  }
  incrementNonce(address: string): number {
    const current = this.getNonce(address);
    this.setNonce(address, current + 1);
    return current + 1;
  }
  reserveNonce(address: string): number {
    const nonce = this.getNonce(address);
    const state = this.state.get(address);
    if (state) state.pending.push(nonce);
    this.incrementNonce(address);
    return nonce;
  }
  releaseNonce(address: string, nonce: number): void {
    const state = this.state.get(address);
    if (state) {
      state.pending = state.pending.filter(n => n !== nonce);
    }
  }
  isStale(address: string, maxAgeMs = 30_000): boolean {
    const state = this.state.get(address);
    if (!state) return true;
    return Date.now() - state.lastFetched > maxAgeMs;
  }
  getPendingNonces(address: string): number[] {
    return this.state.get(address)?.pending ?? [];
  }
}
/** Global nonce tracker singleton */
export const globalNonceTracker = new NonceTracker();
