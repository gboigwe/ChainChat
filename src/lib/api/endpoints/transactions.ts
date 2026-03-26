// Transaction-related Hiro API endpoints
import type { HiroApiClient } from '../client';
/** Transaction response */
export interface TransactionResponse {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  tx_status: string;
  block_hash?: string;
  block_height?: number;
  tx_index?: number;
}
