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
