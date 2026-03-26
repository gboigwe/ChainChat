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
}

  /** Visibility level of the channel */
