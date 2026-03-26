// Clarity v4 channel type definitions
import type { PrincipalAddress, BlockHeight } from './message-types';

/** Unique channel identifier (Clarity uint) */
export type ChannelId = bigint;

/** Channel name, Clarity string-ascii max 64 */
export type ChannelName = string;

/** Channel description, Clarity string-ascii max 256 */
export type ChannelDescription = string;

/** Max channel name length per contract constraint */
export const MAX_CHANNEL_NAME_LENGTH = 64;

/** Max channel description length per contract constraint */
export const MAX_CHANNEL_DESC_LENGTH = 256;

/** Channel visibility modes */
export type ChannelVisibility = 'public' | 'private' | 'restricted';

/** Channel visibility encoded as Clarity uint */
export const VISIBILITY_CODES: Record<ChannelVisibility, bigint> = {
  public: 1n,
  private: 2n,
  restricted: 3n,
};

/** Core channel tuple as stored in Clarity define-map */
export interface ClarityChannel {
  id: ChannelId;
}
