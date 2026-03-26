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
export interface BlockApiResponse {
  canonical: boolean;
  height: number;
  hash: string;
  index_block_hash: string;
  parent_block_hash: string;
  burn_block_time: number;
  txs: string[];
}
export interface MempoolTransactionApiResponse {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  receipt_time: number;
  tx_status: string;
}
export interface ReadOnlyFunctionResponse {
  okay: boolean;
  result?: string;
  cause?: string;
}
export const API_RESPONSE_CONST_1 = 1;
export const API_RESPONSE_CONST_2 = 2;
export const API_RESPONSE_CONST_3 = 3;
export const API_RESPONSE_CONST_4 = 4;
export const API_RESPONSE_CONST_5 = 5;
export const API_RESPONSE_CONST_6 = 6;
export const API_RESPONSE_CONST_7 = 7;
export const API_RESPONSE_CONST_8 = 8;
export const API_RESPONSE_CONST_9 = 9;
export const API_RESPONSE_CONST_10 = 10;
export const API_RESPONSE_CONST_11 = 11;
export const API_RESPONSE_CONST_12 = 12;
export const API_RESPONSE_CONST_13 = 13;
export const API_RESPONSE_CONST_14 = 14;
export const API_RESPONSE_CONST_15 = 15;
export const API_RESPONSE_CONST_16 = 16;
export const API_RESPONSE_CONST_17 = 17;
export const API_RESPONSE_CONST_18 = 18;
export const API_RESPONSE_CONST_19 = 19;
export const API_RESPONSE_CONST_20 = 20;
export const API_RESPONSE_CONST_21 = 21;
export const API_RESPONSE_CONST_22 = 22;
export const API_RESPONSE_CONST_23 = 23;
export const API_RESPONSE_CONST_24 = 24;
export const API_RESPONSE_CONST_25 = 25;
export const API_RESPONSE_CONST_26 = 26;
export const API_RESPONSE_CONST_27 = 27;
export const API_RESPONSE_CONST_28 = 28;
export const API_RESPONSE_CONST_29 = 29;
export const API_RESPONSE_CONST_30 = 30;
export const API_RESPONSE_CONST_31 = 31;
export const API_RESPONSE_CONST_32 = 32;
