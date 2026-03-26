// Typed Hiro API response types
export interface ApiPaginatedResponse<T> {
  results: T[];
  total: number;
  limit: number;
  offset: number;
}
export interface ApiErrorResponse {
  error: string;
  message?: string;
  reason?: string;
}
