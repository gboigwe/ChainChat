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
/** Get contract interface (ABI) */
export async function getContractInterface(
  client: HiroApiClient,
  contractAddress: string,
  contractName: string,
): Promise<unknown> {
  return client.fetch(`/v2/contracts/interface/${contractAddress}/${contractName}`);
}
/** Get contract source code */
export async function getContractSource(
  client: HiroApiClient,
  contractAddress: string,
  contractName: string,
): Promise<{ source: string; publish_height: number }> {
  return client.fetch(`/v2/contracts/source/${contractAddress}/${contractName}`);
}
/** Get contract data map entry */
export async function getContractDataMapEntry(
  client: HiroApiClient,
  contractAddress: string,
  contractName: string,
  mapName: string,
  key: string,
): Promise<{ data?: string }> {
  return client.fetch(
    `/v2/map_entry/${contractAddress}/${contractName}/${mapName}`,
    { method: 'POST', body: key },
  );
}
/** Call a read-only contract function */
export async function callReadOnlyFunction(
  client: HiroApiClient,
  contractAddress: string,
  contractName: string,
  functionName: string,
  sender: string,
  args: string[],
): Promise<{ okay: boolean; result?: string; cause?: string }> {
  return client.fetch(
    `/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
    { method: 'POST', body: JSON.stringify({ sender, arguments: args }) },
  );
}
