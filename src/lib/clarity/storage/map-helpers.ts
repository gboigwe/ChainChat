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
/** Get all values from a map */
export function mapValues<V extends MapValue>(map: Map<string, V>): V[] {
  return Array.from(map.values());
}
/** Get all keys from a map */
export function mapKeys<V extends MapValue>(map: Map<string, V>): string[] {
  return Array.from(map.keys());
}
/** Get or set default value pattern */
export function mapGetOrSet<V extends MapValue>(
  map: Map<string, V>,
  keyStr: string,
  defaultValue: V,
): V {
  if (!map.has(keyStr)) map.set(keyStr, defaultValue);
  return map.get(keyStr)!;
}
/** Batch set multiple entries */
export function mapSetBatch<V extends MapValue>(
  map: Map<string, V>,
  entries: Array<{ key: string; value: V }>,
): void {
  for (const { key, value } of entries) map.set(key, value);
}
/** Batch delete multiple keys */
export function mapDeleteBatch<V extends MapValue>(
  map: Map<string, V>,
  keys: string[],
): number {
  let deleted = 0;
  for (const key of keys) if (map.delete(key)) deleted++;
  return deleted;
}
/** Filter map entries by predicate */
export function mapFilter<V extends MapValue>(
  map: Map<string, V>,
  predicate: (value: V, key: string) => boolean,
): Map<string, V> {
  const result = new Map<string, V>();
  for (const [k, v] of map) if (predicate(v, k)) result.set(k, v);
  return result;
}
/** Transform map values */
export function mapTransform<V extends MapValue, U extends MapValue>(
  map: Map<string, V>,
  fn: (value: V) => U,
): Map<string, U> {
  const result = new Map<string, U>();
  for (const [k, v] of map) result.set(k, fn(v));
  return result;
}
/** Get map size */
export function mapSize<V extends MapValue>(map: Map<string, V>): number {
  return map.size;
}
/** Clear all entries from map */
export function mapClear<V extends MapValue>(map: Map<string, V>): void {
  map.clear();
}
/** Convert map to array of entries */
export function mapToArray<V extends MapValue>(
  map: Map<string, V>,
): Array<{ key: string; value: V }> {
  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}
