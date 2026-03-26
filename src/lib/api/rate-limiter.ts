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
  constructor(requestsPerSecond = REQUESTS_PER_SECOND) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.refillRate = requestsPerSecond;
    this.lastRefill = Date.now();
  }
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
