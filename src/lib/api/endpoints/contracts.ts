// Contract-related Hiro API endpoints
import type { HiroApiClient } from '../client';
/** Contract info response */
export interface ContractInfoResponse {
  tx_id: string;
  canonical: boolean;
  contract_id: string;
  source_code: string;
  abi: string;
  publish_height: number;
}
