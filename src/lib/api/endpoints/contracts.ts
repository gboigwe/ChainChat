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
/** Get contract events */
export async function getContractEvents(
  client: HiroApiClient,
  contractId: string,
  limit = 50,
  offset = 0,
): Promise<{ results: unknown[] }> {
  return client.fetch(`/extended/v1/contract/${contractId}/events`, undefined, { limit, offset });
}
export const CONTRACT_CONST_1 = 1;
export const CONTRACT_CONST_2 = 2;
export const CONTRACT_CONST_3 = 3;
export const CONTRACT_CONST_4 = 4;
export const CONTRACT_CONST_5 = 5;
export const CONTRACT_CONST_6 = 6;
export const CONTRACT_CONST_7 = 7;
export const CONTRACT_CONST_8 = 8;
export const CONTRACT_CONST_9 = 9;
export const CONTRACT_CONST_10 = 10;
export const CONTRACT_CONST_11 = 11;
export const CONTRACT_CONST_12 = 12;
export const CONTRACT_CONST_13 = 13;
export const CONTRACT_CONST_14 = 14;
export const CONTRACT_CONST_15 = 15;
export const CONTRACT_CONST_16 = 16;
export const CONTRACT_CONST_17 = 17;
export const CONTRACT_CONST_18 = 18;
export const CONTRACT_CONST_19 = 19;
export const CONTRACT_CONST_20 = 20;
export const CONTRACT_CONST_21 = 21;
export const CONTRACT_CONST_22 = 22;
export const CONTRACT_CONST_23 = 23;
export const CONTRACT_CONST_24 = 24;
export const CONTRACT_CONST_25 = 25;
export const CONTRACT_CONST_26 = 26;
export const CONTRACT_CONST_27 = 27;
export const CONTRACT_CONST_28 = 28;
export const CONTRACT_CONST_29 = 29;
