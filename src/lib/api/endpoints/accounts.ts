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
