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
