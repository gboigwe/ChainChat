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
