// Clarity v4 tuple construction helpers

/** Generic Clarity tuple shape */
export type ClarityTuple<T extends Record<string, unknown>> = T;

/** Build a message key tuple for map lookups */
export function buildMessageKey(channelId: bigint, messageId: bigint): Record<string, bigint> {
  return { 'channel-id': channelId, 'message-id': messageId };
}
