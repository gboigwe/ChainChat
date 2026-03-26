// Simple in-memory cache for Clarity query results
/** Cache entry with expiry */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
/** Generic in-memory cache */
export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;
  constructor(ttlMs = 30_000) { this.ttlMs = ttlMs; }
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.value;
  }
  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
  delete(key: string): void { this.store.delete(key); }
  clear(): void { this.store.clear(); }
  has(key: string): boolean { return this.get(key) !== null; }
  size(): number { return this.store.size; }
}
/** Shared channel cache */
export const channelCache = new Cache<unknown>(60_000);
/** Shared message cache */
export const messageCache = new Cache<unknown>(30_000);
/** Shared balance cache */
export const balanceCache = new Cache<bigint>(10_000);
/** Cache key for channel */
export function channelCacheKey(channelId: bigint): string {
  return `ch:${channelId}`;
}
/** Cache key for message */
export function messageCacheKey(channelId: bigint, messageId: bigint): string {
  return `msg:${channelId}:${messageId}`;
}
