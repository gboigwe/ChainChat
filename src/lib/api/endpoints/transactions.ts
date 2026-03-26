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
/** Get a transaction by ID */
export async function getTransaction(
  client: HiroApiClient,
  txId: string,
): Promise<TransactionResponse> {
  return client.fetch<TransactionResponse>(`/extended/v1/tx/${txId}`);
}
