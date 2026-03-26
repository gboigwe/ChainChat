// Clarity v4 message type definitions

export type MessageId = bigint;
export type MessageContent = string;
export type PrincipalAddress = string;
export type BlockHeight = bigint;
export type ChannelId = bigint;
export type ReactionCount = bigint;
export type OptionalMessageRef = MessageId | null;

export const MAX_MESSAGE_LENGTH = 500;
export const MIN_MESSAGE_LENGTH = 1;

export interface ClarityMessage {
  id: MessageId;
  sender: PrincipalAddress;
  content: MessageContent;
}
