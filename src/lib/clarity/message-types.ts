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

/** Thread root checker — message is root if replyTo is null */
export function isThreadRoot(msg: ClarityMessage): boolean {
  return msg.replyTo === null;
}

/** Attachment reference stored as optional tuple in message */
export interface MessageAttachment {
  url: string;
  mimeType: string;
  sizeBytes: bigint;
}

/** Maximum attachment size in bytes */
export const MAX_ATTACHMENT_SIZE_BYTES = 10_000_000n;

/** Check if attachment meets size constraint */
export function isValidAttachment(att: MessageAttachment): boolean {
  return att.sizeBytes <= MAX_ATTACHMENT_SIZE_BYTES && att.url.length > 0;
}

/** Message with optional attachment field */
export interface ClarityMessageWithAttachment extends ClarityMessage {
  attachment: MessageAttachment | null;
}

/** Sort messages by block height ascending */
export function sortMessagesByBlock(messages: ClarityMessage[]): ClarityMessage[] {
  return [...messages].sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
}

/** Filter messages from a specific sender */
export function filterBySender(
  messages: ClarityMessage[],
  sender: PrincipalAddress,
): ClarityMessage[] {
  return messages.filter(m => m.sender === sender);
}

/** Get thread replies for a given message id */
export function getThreadReplies(
  messages: ClarityMessage[],
  rootId: MessageId,
): ClarityMessage[] {
  return messages.filter(m => m.replyTo === rootId);
}

/** Deduplicate message list by id */
export function deduplicateMessages(messages: ClarityMessage[]): ClarityMessage[] {
  const seen = new Set<bigint>();
  return messages.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

/** Find a message by ID in a list */
export function findMessageById(
  messages: ClarityMessage[],
  id: MessageId,
): ClarityMessage | undefined {
  return messages.find(m => m.id === id);
}

/** Count messages per sender */
export function countBySender(
  messages: ClarityMessage[],
): Map<PrincipalAddress, number> {
  const counts = new Map<PrincipalAddress, number>();
  for (const m of messages) {
    counts.set(m.sender, (counts.get(m.sender) ?? 0) + 1);
  }
  return counts;
}

/** Group messages by channel id */
export function groupByChannel(
  messages: ClarityMessage[],
): Map<ChannelId, ClarityMessage[]> {
  const groups = new Map<ChannelId, ClarityMessage[]>();
  for (const m of messages) {
    const existing = groups.get(m.channelId) ?? [];
    existing.push(m);
    groups.set(m.channelId, existing);
  }
  return groups;
}

/** Get the most recent message from a list */
export function getLatestMessage(messages: ClarityMessage[]): ClarityMessage | null {
  if (messages.length === 0) return null;
  return messages.reduce((latest, m) =>
    m.createdAt > latest.createdAt ? m : latest,
  );
}

/** Paginate a message array */
export function paginateMessages(
  messages: ClarityMessage[],
  page: number,
  pageSize: number,
): ClarityMessage[] {
  const start = page * pageSize;
  return messages.slice(start, start + pageSize);
}

/** Check if message content has changed (edit detection) */
export function contentChanged(original: MessageContent, updated: MessageContent): boolean {
  return original !== updated;
}

/** Reaction emoji codes for display */
export const REACTION_EMOJI: Record<string, string> = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
};
