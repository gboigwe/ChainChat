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
