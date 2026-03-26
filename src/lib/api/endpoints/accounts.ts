// Account-related Hiro API endpoints
import type { HiroApiClient } from '../client';
/** Account info response */
export interface AccountInfoResponse {
  balance: string;
  locked: string;
  unlock_height: number;
  nonce: number;
  balance_proof: string;
  nonce_proof: string;
}
/** Account balance response */
export interface AccountBalanceResponse {
  stx: { balance: string; locked: string; burnchain_unlock_height: number };
  fungible_tokens: Record<string, { balance: string }>;
  non_fungible_tokens: Record<string, { count: string }>;
}
