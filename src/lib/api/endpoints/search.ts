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
