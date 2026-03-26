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

/** Extract a single field from a tuple */
export function extractField<T extends Record<string, unknown>, K extends keyof T>(
  tuple: T,
  field: K,
): T[K] {
  return tuple[field];
}

/** Serialize tuple to JSON-safe plain object */
export function serializeTuple(tuple: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tuple).map(([k, v]) => [k, String(v)]),
  );
}

/** Build a reaction key tuple */
export function buildReactionKey(
  messageId: bigint,
  reactor: string,
  reactionCode: bigint,
): Record<string, unknown> {
  return { 'message-id': messageId, reactor, 'reaction-code': reactionCode };
}

/** Build channel stats key */
export function buildStatsKey(channelId: bigint): Record<string, bigint> {
  return { 'channel-id': channelId };
}

/** Assert all required keys exist in a tuple */
export function assertTupleHasKeys(
  tuple: Record<string, unknown>,
  required: string[],
): void {
  for (const key of required) {
    if (!(key in tuple)) {
      throw new Error(`Missing required tuple key: ${key}`);
    }
  }
}

/** Validate tuple keys against expected schema */
export function validateTupleSchema(
  tuple: Record<string, unknown>,
  schema: Record<string, string>,
): string[] {
  const errors: string[] = [];
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in tuple)) {
      errors.push(`Missing key: ${key}`);
    } else if (typeof tuple[key] !== expectedType && expectedType !== 'bigint') {
      errors.push(`Wrong type for key ${key}: expected ${expectedType}`);
    }
  }
  return errors;
}

/** Count keys in a tuple */
export function countTupleKeys(tuple: Record<string, unknown>): number {
  return Object.keys(tuple).length;
}

/** Clone a tuple shallowly */
export function cloneTuple<T extends Record<string, unknown>>(tuple: T): T {
  return { ...tuple };
}
/** Omit a key from a tuple */
export function omitField<T extends Record<string, unknown>, K extends keyof T>(
  tuple: T,
  key: K,
): Omit<T, K> {
  const { [key]: _, ...rest } = tuple;
  return rest as Omit<T, K>;
}
