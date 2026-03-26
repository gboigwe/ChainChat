// Storage layer event type definitions
/** Base storage event */
export interface StorageEvent {
  type: string;
  blockHeight: bigint;
  txId?: string;
}
