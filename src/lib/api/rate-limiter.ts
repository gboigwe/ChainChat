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
  allow(): boolean {
    this.refill();
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
  async queue(): Promise<void> {
    if (this.allow()) return;
    return new Promise(resolve => {
      this.queue.push(resolve);
      this.drain();
    });
  }
  private drain(): void {
    const delay = (1 / this.refillRate) * 1000;
    setTimeout(() => {
      if (this.queue.length > 0 && this.allow()) {
        const next = this.queue.shift();
        next?.();
      }
      if (this.queue.length > 0) this.drain();
    }, delay);
  }
}
/** Global rate limiter instance */
export const globalRateLimiter = new RateLimiter();
export const RATE_LIMITER_CONST_1 = 1;
export const RATE_LIMITER_CONST_2 = 2;
export const RATE_LIMITER_CONST_3 = 3;
export const RATE_LIMITER_CONST_4 = 4;
export const RATE_LIMITER_CONST_5 = 5;
