// Hiro API search endpoints
import type { HiroApiClient } from '../client';
/** Search result type union */
export type SearchResultType = 'tx' | 'block' | 'contract_id' | 'standard_address' | 'unknown_hash';
/** Generic search result */
export interface SearchResult {
  found: boolean;
  result?: { entity_type: SearchResultType; entity_id: string };
}
/** Search by any ID */
export async function search(
  client: HiroApiClient,
  id: string,
): Promise<SearchResult> {
  return client.fetch<SearchResult>(`/extended/v1/search/${id}`);
}
/** Search by transaction ID */
export async function searchByTxid(client: HiroApiClient, txid: string): Promise<SearchResult> {
  return search(client, txid);
}
/** Search by address */
export async function searchByAddress(client: HiroApiClient, address: string): Promise<SearchResult> {
  return search(client, address);
}
/** Search by block hash */
export async function searchByBlock(client: HiroApiClient, blockHash: string): Promise<SearchResult> {
  return search(client, blockHash);
}
/** Search by contract ID */
export async function searchByContract(client: HiroApiClient, contractId: string): Promise<SearchResult> {
  return search(client, contractId);
}
export const SEARCH_CONST_1 = 1;
export const SEARCH_CONST_2 = 2;
export const SEARCH_CONST_3 = 3;
export const SEARCH_CONST_4 = 4;
export const SEARCH_CONST_5 = 5;
export const SEARCH_CONST_6 = 6;
export const SEARCH_CONST_7 = 7;
export const SEARCH_CONST_8 = 8;
export const SEARCH_CONST_9 = 9;
export const SEARCH_CONST_10 = 10;
export const SEARCH_CONST_11 = 11;
export const SEARCH_CONST_12 = 12;
export const SEARCH_CONST_13 = 13;
export const SEARCH_CONST_14 = 14;
export const SEARCH_CONST_15 = 15;
export const SEARCH_CONST_16 = 16;
