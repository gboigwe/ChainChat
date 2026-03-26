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
