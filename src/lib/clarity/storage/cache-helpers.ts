// Simple in-memory cache for Clarity query results
/** Cache entry with expiry */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
