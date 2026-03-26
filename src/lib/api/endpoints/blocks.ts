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
/** Get block by hash or height */
export async function getBlock(
  client: HiroApiClient,
  hashOrHeight: string | number,
): Promise<BlockResponse> {
  return client.fetch<BlockResponse>(`/extended/v1/block/${hashOrHeight}`);
}
/** Get recent blocks */
export async function getBlockList(
  client: HiroApiClient,
  limit = 20,
  offset = 0,
): Promise<{ results: BlockResponse[]; total: number }> {
  return client.fetch('/extended/v1/block', undefined, { limit, offset });
}
