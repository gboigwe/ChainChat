// Clarity v4 channel type definitions
import type { PrincipalAddress, BlockHeight } from './message-types';

export type ChannelId = bigint;
export type ChannelName = string;
export type ChannelDescription = string;

export const MAX_CHANNEL_NAME_LENGTH = 64;
export const MAX_CHANNEL_DESC_LENGTH = 256;

export type ChannelVisibility = 'public' | 'private' | 'restricted';

export const VISIBILITY_CODES: Record<ChannelVisibility, bigint> = {
  public: 1n,
  private: 2n,
  restricted: 3n,
};

export interface ClarityChannel {
  id: ChannelId;
  name: ChannelName;
  description: ChannelDescription;
  owner: PrincipalAddress;
  createdAt: BlockHeight;
  visibility: ChannelVisibility;
}

/** Member role within a channel */
export type MemberRole = 'admin' | 'moderator' | 'member' | 'viewer';

/** Clarity uint codes for member roles */
export const ROLE_CODES: Record<MemberRole, bigint> = {
  admin: 1n,
  moderator: 2n,
  member: 3n,
  viewer: 4n,
};

/** Channel membership tuple */
export interface ChannelMember {
  principal: PrincipalAddress;
  role: MemberRole;
  joinedAt: BlockHeight;
}

/** Channel permission flags stored per member */
export interface ChannelPermissions {
  canPost: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canKick: boolean;
}

/** Default permissions by role */
export const DEFAULT_PERMISSIONS: Record<MemberRole, ChannelPermissions> = {
  admin:     { canPost: true,  canInvite: true,  canDelete: true,  canKick: true  },
  moderator: { canPost: true,  canInvite: true,  canDelete: true,  canKick: false },
  member:    { canPost: true,  canInvite: false, canDelete: false, canKick: false },
  viewer:    { canPost: false, canInvite: false, canDelete: false, canKick: false },
};

/** Validate channel name length */
export function isValidChannelName(name: string): boolean {
  return name.length > 0 && name.length <= MAX_CHANNEL_NAME_LENGTH;
}

/** Validate channel description length */
export function isValidChannelDesc(desc: string): boolean {
  return desc.length <= MAX_CHANNEL_DESC_LENGTH;
}

/** Convert ChannelVisibility to Clarity uint code */
export function encodeVisibility(v: ChannelVisibility): bigint {
  return VISIBILITY_CODES[v];
}

/** Decode Clarity uint code back to ChannelVisibility */
export function decodeVisibility(code: bigint): ChannelVisibility {
  const entry = Object.entries(VISIBILITY_CODES).find(([, v]) => v === code);
  if (!entry) throw new Error(`Unknown visibility code: ${code}`);
  return entry[0] as ChannelVisibility;
}

/** Check whether a principal has a given permission in a channel */
export function hasPermission(
  member: ChannelMember,
  permission: keyof ChannelPermissions,
): boolean {
  return DEFAULT_PERMISSIONS[member.role][permission];
}

/** Maximum number of members per channel */
export const MAX_CHANNEL_MEMBERS = 1000n;

/** Check if channel has reached member limit */
export function isChannelFull(memberCount: bigint): boolean {
  return memberCount >= MAX_CHANNEL_MEMBERS;
}

/** Compute invite expiry block from current + 1 week */
export function computeInviteExpiry(currentBlock: bigint): bigint {
  return currentBlock + 1008n;
}

/** Invite tuple stored in Clarity map */
export interface ChannelInvite {
  channelId: ChannelId;
  inviter: PrincipalAddress;
  invitee: PrincipalAddress;
  expiryBlock: bigint;
  role: MemberRole;
}

/** Channel stats tuple for dashboard queries */
export interface ChannelStats {
  channelId: ChannelId;
  memberCount: bigint;
  messageCount: bigint;
  lastActivityBlock: bigint;
}

/** Channel sort modes */
export type ChannelSortMode = 'recent' | 'popular' | 'alphabetical';

/** Encode MemberRole to Clarity uint */
export function encodeRole(role: MemberRole): bigint {
  return ROLE_CODES[role];
}

/** Decode Clarity uint back to MemberRole */
export function decodeRole(code: bigint): MemberRole {
  const entry = Object.entries(ROLE_CODES).find(([, v]) => v === code);
  if (!entry) throw new Error(`Unknown role code: ${code}`);
  return entry[0] as MemberRole;
}

/** Check if a principal is the channel owner */
export function isChannelOwner(channel: ClarityChannel, principal: PrincipalAddress): boolean {
  return channel.owner === principal;
}

/** Create a default public channel object */
export function createChannel(
  id: ChannelId,
  name: ChannelName,
  owner: PrincipalAddress,
  createdAt: bigint,
): ClarityChannel {
  return { id, name, description: '', owner, createdAt, visibility: 'public' };
}
