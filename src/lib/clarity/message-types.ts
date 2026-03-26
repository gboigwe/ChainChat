// Clarity v4 message type definitions

/** Unique message identifier backed by Clarity uint */
export type MessageId = bigint;

/** Clarity string-ascii content with max length 500 */
export type MessageContent = string;

/** Stacks principal address for message sender */
export type PrincipalAddress = string;

/** Block height when message was created */
export type BlockHeight = bigint;

/** Channel identifier backed by Clarity uint */
export type ChannelId = bigint;

/** Clarity uint for reaction count */
export type ReactionCount = bigint;

/** Clarity optional message reference for threading */
export type OptionalMessageRef = MessageId | null;

/** Maximum allowed length for string-ascii content */
export const MAX_MESSAGE_LENGTH = 500;

/** Minimum allowed length for string-ascii content */
export const MIN_MESSAGE_LENGTH = 1;
