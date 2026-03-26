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
export const RATE_LIMITER_CONST_6 = 6;
export const RATE_LIMITER_CONST_7 = 7;
export const RATE_LIMITER_CONST_8 = 8;
export const RATE_LIMITER_CONST_9 = 9;
export const RATE_LIMITER_CONST_10 = 10;
export const RATE_LIMITER_CONST_11 = 11;
export const RATE_LIMITER_CONST_12 = 12;
export const RATE_LIMITER_CONST_13 = 13;
export const RATE_LIMITER_CONST_14 = 14;
export const RATE_LIMITER_CONST_15 = 15;
export const RATE_LIMITER_CONST_16 = 16;
export const RATE_LIMITER_CONST_17 = 17;
export const RATE_LIMITER_CONST_18 = 18;
export const RATE_LIMITER_CONST_19 = 19;
export const RATE_LIMITER_CONST_20 = 20;
export const RATE_LIMITER_CONST_21 = 21;
export const RATE_LIMITER_CONST_22 = 22;
export const RATE_LIMITER_CONST_23 = 23;
export const RATE_LIMITER_CONST_24 = 24;
export const RATE_LIMITER_CONST_25 = 25;
export const RATE_LIMITER_CONST_26 = 26;
export const RATE_LIMITER_CONST_27 = 27;
export const RATE_LIMITER_CONST_28 = 28;
export const RATE_LIMITER_CONST_29 = 29;
export const RATE_LIMITER_CONST_30 = 30;
export const RATE_LIMITER_CONST_31 = 31;
export const RATE_LIMITER_CONST_32 = 32;
export const RATE_LIMITER_CONST_33 = 33;
export const RATE_LIMITER_CONST_34 = 34;
export const RATE_LIMITER_CONST_35 = 35;
export const RATE_LIMITER_CONST_36 = 36;
export const RATE_LIMITER_CONST_37 = 37;
export const RATE_LIMITER_CONST_38 = 38;
export const RATE_LIMITER_CONST_39 = 39;
export const RATE_LIMITER_CONST_40 = 40;
export const RATE_LIMITER_CONST_41 = 41;
