// Nonce management for Stacks transactions
/** Nonce tracker state */
export interface NonceTrackerState {
  address: string;
  lastFetched: number;
  nonce: number;
  pending: number[];
}
