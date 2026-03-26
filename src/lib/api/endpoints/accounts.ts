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
/** Get account info */
export async function getAccountInfo(
  client: HiroApiClient,
  address: string,
): Promise<AccountInfoResponse> {
  return client.fetch<AccountInfoResponse>(`/v2/accounts/${address}`, undefined, { proof: 0 });
}
/** Get account balance */
export async function getAccountBalance(
  client: HiroApiClient,
  address: string,
): Promise<AccountBalanceResponse> {
  return client.fetch<AccountBalanceResponse>(`/extended/v1/address/${address}/balances`);
}
/** Get account STX balance only */
export async function getAccountSTXBalance(
  client: HiroApiClient,
  address: string,
): Promise<string> {
  const info = await getAccountInfo(client, address);
  return info.balance;
}
/** Get account nonces */
export async function getAccountNonces(
  client: HiroApiClient,
  address: string,
): Promise<{ possible_next_nonce: number; detected_missing_nonces: number[] }> {
  return client.fetch(`/extended/v1/address/${address}/nonces`);
}
/** Get account transaction history */
export async function getAccountTransactions(
  client: HiroApiClient,
  address: string,
  limit = 50,
  offset = 0,
): Promise<{ results: unknown[]; total: number }> {
  return client.fetch(`/extended/v1/address/${address}/transactions`, undefined, { limit, offset });
}
/** Get account asset holdings */
export async function getAccountAssets(
  client: HiroApiClient,
  address: string,
  limit = 50,
  offset = 0,
): Promise<{ results: unknown[]; total: number }> {
  return client.fetch(`/extended/v1/address/${address}/assets`, undefined, { limit, offset });
}
/** Get inbound STX transfers */
export async function getAccountInboundSTX(
  client: HiroApiClient,
  address: string,
  limit = 50,
): Promise<{ results: unknown[]; total: number }> {
  return client.fetch(`/extended/v1/address/${address}/stx_inbound`, undefined, { limit });
}
export const ACCOUNT_CONST_1 = 1;
export const ACCOUNT_CONST_2 = 2;
export const ACCOUNT_CONST_3 = 3;
export const ACCOUNT_CONST_4 = 4;
export const ACCOUNT_CONST_5 = 5;
export const ACCOUNT_CONST_6 = 6;
export const ACCOUNT_CONST_7 = 7;
export const ACCOUNT_CONST_8 = 8;
export const ACCOUNT_CONST_9 = 9;
export const ACCOUNT_CONST_10 = 10;
export const ACCOUNT_CONST_11 = 11;
export const ACCOUNT_CONST_12 = 12;
export const ACCOUNT_CONST_13 = 13;
export const ACCOUNT_CONST_14 = 14;
