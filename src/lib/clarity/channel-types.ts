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
