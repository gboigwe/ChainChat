// Clarity v4 define-map pattern helpers
/** Generic map key type */
export type MapKey = Record<string, unknown>;
/** Generic map value type */
export type MapValue = Record<string, unknown>;
/** Map entry tuple */
export interface MapEntry<K extends MapKey, V extends MapValue> {
  key: K;
  value: V;
}
/** Result of a map-get? — matches Clarity optional */
export type MapGetResult<V> = V | null;
/** Wrap a map-get? result for type safety */
export function mapGet<V extends MapValue>(
  map: Map<string, V>,
  keyStr: string,
): MapGetResult<V> {
  return map.get(keyStr) ?? null;
}
/** Set a key in a map (mirrors map-set) */
export function mapSet<V extends MapValue>(
  map: Map<string, V>,
  keyStr: string,
  value: V,
): void {
  map.set(keyStr, value);
}
/** Delete a key from map (mirrors map-delete) */
export function mapDelete<V extends MapValue>(
  map: Map<string, V>,
  keyStr: string,
): boolean {
  return map.delete(keyStr);
}
/** Serialize map key to string for JS Map indexing */
export function serializeKey(key: MapKey): string {
  return JSON.stringify(key, (_, v) => typeof v === 'bigint' ? v.toString() : v);
}
/** Build a message-channel composite key */
export function messageChannelKey(channelId: bigint, messageId: bigint): string {
  return serializeKey({ channelId, messageId });
}
/** Build a member-channel composite key */
export function memberChannelKey(channelId: bigint, principal: string): string {
  return serializeKey({ channelId, principal });
}
/** Check if a key exists in the map */
export function mapHas<V extends MapValue>(
  map: Map<string, V>,
  keyStr: string,
): boolean {
  return map.has(keyStr);
}
