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
/** Broadcast a signed transaction */
export async function broadcastTransaction(
  client: HiroApiClient,
  txHex: string,
): Promise<{ txid: string } | { error: string }> {
  return client.fetch('/v2/transactions', {
    method: 'POST',
    body: txHex,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}
/** Get transaction list with filters */
export async function getTransactionList(
  client: HiroApiClient,
  limit = 50,
  offset = 0,
  type?: string,
): Promise<{ results: TransactionResponse[]; total: number }> {
  const params: Record<string, string | number> = { limit, offset };
  if (type) params['type'] = type;
  return client.fetch('/extended/v1/tx', undefined, params);
}
