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
  channelId: ChannelId;
  createdAt: BlockHeight;
  replyTo: OptionalMessageRef;
  reactions: ReactionCount;
}

/** Message status tracking on-chain state */
export type MessageStatus = 'pending' | 'confirmed' | 'deleted';

/** Extended message with off-chain metadata */
export interface MessageWithMeta extends ClarityMessage {
  status: MessageStatus;
}

/** Batch of messages returned from contract map iteration */
export interface MessageBatch {
  messages: ClarityMessage[];
  total: bigint;
}

/** Paginated message query params */
export interface MessageQueryParams {
  channelId: ChannelId;
  limit: number;
  offset: number;
}

/** Factory: create a new ClarityMessage with defaults */
export function createMessage(
  id: MessageId,
  sender: PrincipalAddress,
  content: MessageContent,
  channelId: ChannelId,
  createdAt: BlockHeight,
): ClarityMessage {
  return { id, sender, content, channelId, createdAt, replyTo: null, reactions: 0n };
}

/** Guard: check if value is a valid ClarityMessage */
export function isClarityMessage(value: unknown): value is ClarityMessage {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return typeof m['id'] === 'bigint';
}

/** Validate message content against Clarity string-ascii constraints */
export function isValidMessageContent(content: string): boolean {
  return content.length >= MIN_MESSAGE_LENGTH && content.length <= MAX_MESSAGE_LENGTH;
}

/** Check if content contains only ASCII characters (Clarity string-ascii requirement) */
export function isAsciiOnly(content: string): boolean {
  return /^[\x00-\x7F]*$/.test(content);
}

/** Encode message content for Clarity contract call */
export function encodeMessageContent(content: MessageContent): string {
  if (!isValidMessageContent(content)) throw new Error('Invalid message content length');
  if (!isAsciiOnly(content)) throw new Error('Message content must be ASCII only');
  return content;
}

/** Reaction emoji to uint mapping for Clarity contract */
export const REACTION_CODES: Record<string, bigint> = {
  like: 1n,
  love: 2n,
  laugh: 3n,
  wow: 4n,
  sad: 5n,
};

/** Maximum reactions per message allowed by contract */
export const MAX_REACTIONS_PER_MESSAGE = 1000n;

/** Check if message has reached reaction limit */
export function isReactionLimitReached(msg: ClarityMessage): boolean {
  return msg.reactions >= MAX_REACTIONS_PER_MESSAGE;
}
