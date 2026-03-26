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
