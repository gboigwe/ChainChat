// Typed tuple builders for Clarity contract data structures
/** Message storage tuple */
export interface MessageStorageTuple {
  sender: string;
  content: string;
  'channel-id': bigint;
  'created-at': bigint;
  'reply-to': bigint | null;
  reactions: bigint;
}
/** Build message storage tuple */
export function buildMessageTuple(
  sender: string,
  content: string,
  channelId: bigint,
  createdAt: bigint,
  replyTo: bigint | null,
): MessageStorageTuple {
  return { sender, content, 'channel-id': channelId, 'created-at': createdAt, 'reply-to': replyTo, reactions: 0n };
}
/** Channel storage tuple */
export interface ChannelStorageTuple {
  name: string;
  description: string;
  owner: string;
  'created-at': bigint;
  visibility: bigint;
  'member-count': bigint;
}
/** Build channel storage tuple */
export function buildChannelTuple(
  name: string,
  description: string,
  owner: string,
  createdAt: bigint,
  visibility: bigint,
): ChannelStorageTuple {
  return { name, description, owner, 'created-at': createdAt, visibility, 'member-count': 0n };
}
/** Member storage tuple */
export interface MemberStorageTuple {
  role: bigint;
  'joined-at': bigint;
  'post-count': bigint;
}
/** Build member storage tuple */
export function buildMemberTuple(
  role: bigint,
  joinedAt: bigint,
): MemberStorageTuple {
  return { role, 'joined-at': joinedAt, 'post-count': 0n };
}
/** Reaction storage tuple */
export interface ReactionStorageTuple {
  'reaction-code': bigint;
  'block-height': bigint;
}
/** Build reaction storage tuple */
export function buildReactionTuple(
  reactionCode: bigint,
  blockHeight: bigint,
): ReactionStorageTuple {
  return { 'reaction-code': reactionCode, 'block-height': blockHeight };
}
/** Invite storage tuple */
export interface InviteStorageTuple {
  inviter: string;
  role: bigint;
  'expiry-block': bigint;
}
/** Build invite storage tuple */
export function buildInviteTuple(
  inviter: string,
  role: bigint,
  expiryBlock: bigint,
): InviteStorageTuple {
  return { inviter, role, 'expiry-block': expiryBlock };
}
/** Extract field from message tuple */
export function getMsgSender(t: MessageStorageTuple): string { return t.sender; }
export function getMsgContent(t: MessageStorageTuple): string { return t.content; }
export function getMsgChannelId(t: MessageStorageTuple): bigint { return t['channel-id']; }
export function getMsgCreatedAt(t: MessageStorageTuple): bigint { return t['created-at']; }
export function getMsgReplyTo(t: MessageStorageTuple): bigint | null { return t['reply-to']; }
export function getMsgReactions(t: MessageStorageTuple): bigint { return t.reactions; }
/** Increment reaction count in message tuple */
export function incrementReactions(t: MessageStorageTuple): MessageStorageTuple {
  return { ...t, reactions: t.reactions + 1n };
}
/** Update member post count */
export function incrementPostCount(t: MemberStorageTuple): MemberStorageTuple {
  return { ...t, 'post-count': t['post-count'] + 1n };
}
/** Update channel member count */
export function incrementMemberCount(t: ChannelStorageTuple): ChannelStorageTuple {
  return { ...t, 'member-count': t['member-count'] + 1n };
}
/** Decrement channel member count (minimum 0) */
export function decrementMemberCount(t: ChannelStorageTuple): ChannelStorageTuple {
  const count = t['member-count'] > 0n ? t['member-count'] - 1n : 0n;
  return { ...t, 'member-count': count };
}
/** Stats storage tuple */
export interface StatsStorageTuple {
  'message-count': bigint;
  'member-count': bigint;
  'last-activity': bigint;
}
/** Build stats storage tuple */
export function buildStatsTuple(
  messageCount: bigint,
  memberCount: bigint,
  lastActivity: bigint,
): StatsStorageTuple {
  return { 'message-count': messageCount, 'member-count': memberCount, 'last-activity': lastActivity };
}
/** Update last activity in stats tuple */
export function updateLastActivity(
  t: StatsStorageTuple,
  blockHeight: bigint,
): StatsStorageTuple {
  return { ...t, 'last-activity': blockHeight };
}
/** Increment message count in stats tuple */
export function incrementMessageCount(t: StatsStorageTuple): StatsStorageTuple {
  return { ...t, 'message-count': t['message-count'] + 1n };
}
/** Validate message storage tuple has required fields */
export function validateMessageTuple(t: unknown): t is MessageStorageTuple {
  if (typeof t !== 'object' || t === null) return false;
  const m = t as Record<string, unknown>;
  return typeof m['sender'] === 'string' && typeof m['content'] === 'string';
}
/** Validate channel storage tuple */
export function validateChannelTuple(t: unknown): t is ChannelStorageTuple {
  if (typeof t !== 'object' || t === null) return false;
  const c = t as Record<string, unknown>;
  return typeof c['name'] === 'string' && typeof c['owner'] === 'string';
}
/** NFT storage tuple */
export interface NFTStorageTuple {
  owner: string;
  uri: string;
  'minted-at': bigint;
}
/** Build NFT storage tuple */
export function buildNFTTuple(owner: string, uri: string, mintedAt: bigint): NFTStorageTuple {
  return { owner, uri, 'minted-at': mintedAt };
}
/** FT balance storage tuple */
export interface FTBalanceTuple {
  amount: bigint;
  locked: bigint;
  'last-transfer': bigint;
}
