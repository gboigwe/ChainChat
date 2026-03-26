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
/** Fetch nonce from API */
export async function fetchNonce(address: string, apiUrl: string): Promise<number> {
  const res = await fetch(`${apiUrl}/v2/accounts/${address}?proof=0`);
  if (!res.ok) throw new Error(`Failed to fetch nonce: ${res.status}`);
  const data = await res.json();
  return data.nonce as number;
}
/** Fetch and cache nonce */
export async function fetchAndCacheNonce(
  address: string,
  apiUrl: string,
): Promise<number> {
  const nonce = await fetchNonce(address, apiUrl);
  globalNonceTracker.setNonce(address, nonce);
  return nonce;
}
/** Get next nonce, refreshing if stale */
export async function getNextNonce(
  address: string,
  apiUrl: string,
): Promise<bigint> {
  if (globalNonceTracker.isStale(address)) {
    await fetchAndCacheNonce(address, apiUrl);
  }
  return BigInt(globalNonceTracker.reserveNonce(address));
}
export const NONCE_CONST_1 = 1;
export const NONCE_CONST_2 = 2;
export const NONCE_CONST_3 = 3;
export const NONCE_CONST_4 = 4;
export const NONCE_CONST_5 = 5;
export const NONCE_CONST_6 = 6;
export const NONCE_CONST_7 = 7;
export const NONCE_CONST_8 = 8;
export const NONCE_CONST_9 = 9;
export const NONCE_CONST_10 = 10;
export const NONCE_CONST_11 = 11;
export const NONCE_CONST_12 = 12;
export const NONCE_CONST_13 = 13;
export const NONCE_CONST_14 = 14;
export const NONCE_CONST_15 = 15;
export const NONCE_CONST_16 = 16;
export const NONCE_CONST_17 = 17;
export const NONCE_CONST_18 = 18;
export const NONCE_CONST_19 = 19;
export const NONCE_CONST_20 = 20;
export const NONCE_CONST_21 = 21;
export const NONCE_CONST_22 = 22;
export const NONCE_CONST_23 = 23;
export const NONCE_CONST_24 = 24;
export const NONCE_CONST_25 = 25;
