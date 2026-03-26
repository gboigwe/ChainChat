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
export interface AccountInfoApiResponse {
  balance: string;
  locked: string;
  unlock_height: number;
  nonce: number;
  balance_proof: string;
  nonce_proof: string;
}
