// Hiro API client with error handling and retry logic
/** API client configuration */
export interface HiroApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
}
