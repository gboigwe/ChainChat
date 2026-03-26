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
/** Get contract info */
export async function getContractInfo(
  client: HiroApiClient,
  contractId: string,
): Promise<ContractInfoResponse> {
  return client.fetch<ContractInfoResponse>(`/extended/v1/contract/${contractId}`);
}
