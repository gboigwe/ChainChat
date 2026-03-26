// Clarity v4 tuple construction helpers

/** Generic Clarity tuple shape */
export type ClarityTuple<T extends Record<string, unknown>> = T;

/** Build a message key tuple for map lookups */
export function buildMessageKey(channelId: bigint, messageId: bigint): Record<string, bigint> {
  return { 'channel-id': channelId, 'message-id': messageId };
}

/** Build a member key tuple for membership map */
export function buildMemberKey(channelId: bigint, principal: string): Record<string, unknown> {
  return { 'channel-id': channelId, member: principal };
}

/** Build invite key tuple */
export function buildInviteKey(channelId: bigint, invitee: string): Record<string, unknown> {
  return { 'channel-id': channelId, invitee };
}

/** Merge two tuple objects — later keys win */
export function mergeTuples<T extends Record<string, unknown>>(
  base: Partial<T>,
  override: Partial<T>,
): Partial<T> {
  return { ...base, ...override };
}
