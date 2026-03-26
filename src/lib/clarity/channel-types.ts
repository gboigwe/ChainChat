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
