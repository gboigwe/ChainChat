// Rate limiter for Hiro API requests
/** Default rate limit: 50 requests per second */
export const REQUESTS_PER_SECOND = 50;
/** Rate limiter using token bucket algorithm */
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;
  private queue: Array<() => void> = [];
