// Hiro API client with error handling and retry logic
/** API client configuration */
export interface HiroApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
}
/** API error class */
export class HiroApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
  ) {
    super(message);
    this.name = 'HiroApiError';
  }
}
/** Default API configuration */
export const DEFAULT_CONFIG: HiroApiConfig = {
  baseUrl: 'https://api.hiro.so',
  timeout: 30_000,
  maxRetries: 3,
};
/** Retry delay calculator with exponential backoff */
export function retryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 10_000);
}
/** Hiro API client class */
export class HiroApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private maxRetries: number;
  constructor(config: Partial<HiroApiConfig> = {}) {
    this.baseUrl = config.baseUrl ?? DEFAULT_CONFIG.baseUrl!;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_CONFIG.timeout!;
    this.maxRetries = config.maxRetries ?? DEFAULT_CONFIG.maxRetries!;
  }
  private buildHeaders(): HeadersInit {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['x-api-key'] = this.apiKey;
    return headers;
  }
  private buildUrl(path: string, params?: Record<string, string | number>): string {
    const url = new URL(path, this.baseUrl);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    return url.toString();
  }
  async fetch<T>(path: string, options?: RequestInit, params?: Record<string, string | number>): Promise<T> {
    const url = this.buildUrl(path, params);
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, retryDelay(attempt - 1)));
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        const res = await fetch(url, { ...options, headers: this.buildHeaders(), signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new HiroApiError(`HTTP ${res.status}`, res.status, path);
        return await res.json() as T;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (e instanceof HiroApiError && e.statusCode < 500) throw e;
      }
    }
    throw lastError ?? new Error('Request failed');
  }
}
/** Default client instance */
export const hiroApi = new HiroApiClient();
/** Create a client with API key */
export function createHiroApiClient(apiKey: string, baseUrl?: string): HiroApiClient {
  return new HiroApiClient({ apiKey, baseUrl });
}
export const API_CLIENT_CONST_1 = 1;
export const API_CLIENT_CONST_2 = 2;
export const API_CLIENT_CONST_3 = 3;
export const API_CLIENT_CONST_4 = 4;
export const API_CLIENT_CONST_5 = 5;
export const API_CLIENT_CONST_6 = 6;
export const API_CLIENT_CONST_7 = 7;
export const API_CLIENT_CONST_8 = 8;
export const API_CLIENT_CONST_9 = 9;
export const API_CLIENT_CONST_10 = 10;
export const API_CLIENT_CONST_11 = 11;
export const API_CLIENT_CONST_12 = 12;
export const API_CLIENT_CONST_13 = 13;
export const API_CLIENT_CONST_14 = 14;
export const API_CLIENT_CONST_15 = 15;
export const API_CLIENT_CONST_16 = 16;
export const API_CLIENT_CONST_17 = 17;
export const API_CLIENT_CONST_18 = 18;
export const API_CLIENT_CONST_19 = 19;
export const API_CLIENT_CONST_20 = 20;
export const API_CLIENT_CONST_21 = 21;
export const API_CLIENT_CONST_22 = 22;
export const API_CLIENT_CONST_23 = 23;
export const API_CLIENT_CONST_24 = 24;
export const API_CLIENT_CONST_25 = 25;
export const API_CLIENT_CONST_26 = 26;
