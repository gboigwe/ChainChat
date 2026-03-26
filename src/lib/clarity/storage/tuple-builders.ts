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
