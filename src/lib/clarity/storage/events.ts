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
/** Member kicked event */
export interface MemberKickedEvent extends StorageEvent {
  type: 'member-kicked';
  channelId: bigint;
  principal: string;
  kickedBy: string;
}
/** Reaction added event */
export interface ReactionAddedEvent extends StorageEvent {
  type: 'reaction-added';
  messageId: bigint;
  reactor: string;
  reactionCode: bigint;
}
/** Union of all storage events */
export type StorageEventUnion =
  | MessageCreatedEvent
  | ChannelCreatedEvent
  | MemberJoinedEvent
  | MemberKickedEvent
  | ReactionAddedEvent;
/** Global event log */
export const storageEventLog: StorageEventUnion[] = [];
/** Append event to log */
export function logStorageEvent(event: StorageEventUnion): void {
  storageEventLog.push(event);
}
