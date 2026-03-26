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
/** Get mempool transactions */
export async function getMempoolTransactions(
  client: HiroApiClient,
  senderAddress?: string,
  limit = 50,
): Promise<{ results: TransactionResponse[]; total: number }> {
  const params: Record<string, string | number> = { limit };
  if (senderAddress) params['sender_address'] = senderAddress;
  return client.fetch('/extended/v1/tx/mempool', undefined, params);
}
/** Get dropped mempool transactions */
export async function getDroppedMempoolTransactions(
  client: HiroApiClient,
  limit = 50,
): Promise<{ results: TransactionResponse[] }> {
  return client.fetch('/extended/v1/tx/mempool/dropped', undefined, { limit });
}
/** Get fee estimate for transaction */
export async function getFeeEstimate(
  client: HiroApiClient,
  txPayload: string,
  estimatedLen?: number,
): Promise<{ cost_scalar_change_by_byte: number; estimated_cost: unknown; estimated_cost_scalar: number }> {
  return client.fetch('/v2/fees/transaction', {
    method: 'POST',
    body: JSON.stringify({ transaction_payload: txPayload, estimated_len: estimatedLen }),
  });
}
/** Get transaction events */
export async function getTxEvents(
  client: HiroApiClient,
  txId: string,
  limit = 50,
  offset = 0,
): Promise<{ results: unknown[]; limit: number; offset: number }> {
  return client.fetch(`/extended/v1/tx/${txId}/events`, undefined, { limit, offset });
}
export const TX_ENDPOINT_CONST_1 = 1;
export const TX_ENDPOINT_CONST_2 = 2;
export const TX_ENDPOINT_CONST_3 = 3;
export const TX_ENDPOINT_CONST_4 = 4;
export const TX_ENDPOINT_CONST_5 = 5;
export const TX_ENDPOINT_CONST_6 = 6;
export const TX_ENDPOINT_CONST_7 = 7;
export const TX_ENDPOINT_CONST_8 = 8;
export const TX_ENDPOINT_CONST_9 = 9;
export const TX_ENDPOINT_CONST_10 = 10;
export const TX_ENDPOINT_CONST_11 = 11;
export const TX_ENDPOINT_CONST_12 = 12;
export const TX_ENDPOINT_CONST_13 = 13;
export const TX_ENDPOINT_CONST_14 = 14;
export const TX_ENDPOINT_CONST_15 = 15;
export const TX_ENDPOINT_CONST_16 = 16;
export const TX_ENDPOINT_CONST_17 = 17;
