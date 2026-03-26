// Hiro API search endpoints
import type { HiroApiClient } from '../client';
/** Search result type union */
export type SearchResultType = 'tx' | 'block' | 'contract_id' | 'standard_address' | 'unknown_hash';
/** Generic search result */
export interface SearchResult {
  found: boolean;
  result?: { entity_type: SearchResultType; entity_id: string };
}
