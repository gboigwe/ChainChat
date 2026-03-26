// Block-related Hiro API endpoints
import type { HiroApiClient } from '../client';
/** Block response */
export interface BlockResponse {
  canonical: boolean;
  height: number;
  hash: string;
  index_block_hash: string;
  parent_block_hash: string;
  burn_block_time: number;
  burn_block_time_iso: string;
  burn_block_hash: string;
  burn_block_height: number;
  txs: string[];
}
