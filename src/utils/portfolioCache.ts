/**
 * Portfolio Data Caching
 * Simple cache implementation for portfolio data
 */

import { PORTFOLIO_CONFIG, CACHE_KEYS } from '../config/portfolioConfig';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class PortfolioCache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || PORTFOLIO_CONFIG.cacheExpiry;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const portfolioCache = new PortfolioCache();

// Periodically clear expired entries
setInterval(() => {
  portfolioCache.clearExpired();
}, 60000); // Every minute

export default portfolioCache;
