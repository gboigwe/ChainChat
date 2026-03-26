// Storage layer event type definitions
/** Base storage event */
export interface StorageEvent {
  type: string;
  blockHeight: bigint;
  txId?: string;
}
/** Message created event */
export interface MessageCreatedEvent extends StorageEvent {
  type: 'message-created';
  messageId: bigint;
  channelId: bigint;
  sender: string;
}
