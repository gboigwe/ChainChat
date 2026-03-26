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
/** Channel created event */
export interface ChannelCreatedEvent extends StorageEvent {
  type: 'channel-created';
  channelId: bigint;
  owner: string;
  name: string;
}
/** Member joined event */
export interface MemberJoinedEvent extends StorageEvent {
  type: 'member-joined';
  channelId: bigint;
  principal: string;
  role: string;
}
