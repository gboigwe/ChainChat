/**
 * Typed contract caller for ChainChat contracts
 * Provides strongly-typed wrappers for common contract interactions
 */

import { hexToCV, cvToJSON } from '@stacks/transactions';
import { getHiroClient } from './hiro-api';
import { getStacksNetwork } from './stacks-network';
import { type ContractId, type StacksAddress } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';
import { NETWORK_CONFIG } from '../config/contracts';

export interface ReadOnlyCallOptions {
  contractId: ContractId | string;
  functionName: string;
  functionArgs?: string[]; // hex-encoded Clarity values
  senderAddress?: string;
  network?: StacksNetworkName;
}

export interface ReadOnlyResult<T = unknown> {
  success: boolean;
  value: T | null;
  rawResult: any;
}

/**
 * Call a read-only contract function and parse the Clarity response
 */
export async function callReadOnly<T = unknown>(
  options: ReadOnlyCallOptions
): Promise<ReadOnlyResult<T>> {
  const client = getHiroClient(options.network);
  const sender = options.senderAddress ?? NETWORK_CONFIG.contractOwner;

  try {
    const result = await client.callReadOnly(
      options.contractId,
      options.functionName,
      options.functionArgs ?? [],
      sender
    );

    if (!result.okay) {
      return { success: false, value: null, rawResult: result };
    }

    const cv = hexToCV(result.result);
    const parsed = cvToJSON(cv) as T;

    return { success: true, value: parsed, rawResult: result };
  } catch (error) {
    return { success: false, value: null, rawResult: error };
  }
}

/**
 * Get the contract version for a ChainChat contract
 */
export async function getContractVersion(
  contractId: ContractId | string,
  senderAddress?: string,
  network?: StacksNetworkName
): Promise<string | null> {
  const result = await callReadOnly<{ value: string }>({
    contractId,
    functionName: 'get-contract-version',
    senderAddress,
    network,
  });

  if (result.success && result.value) {
    return (result.value as any)?.value ?? null;
  }
  return null;
}

/**
 * Check if a contract is paused
 */
export async function isContractPaused(
  contractId: ContractId | string,
  senderAddress?: string,
  network?: StacksNetworkName
): Promise<boolean> {
  const result = await callReadOnly<boolean>({
    contractId,
    functionName: 'is-paused',
    senderAddress,
    network,
  });

  if (result.success) {
    return !!(result.value as any)?.value;
  }
  return false;
}

/**
 * Get contract info (version + paused status)
 */
export async function getContractInfo(
  contractId: ContractId | string,
  senderAddress?: string,
  network?: StacksNetworkName
): Promise<{
  contractId: string;
  version: string | null;
  isPaused: boolean;
}> {
  const [version, isPaused] = await Promise.allSettled([
    getContractVersion(contractId, senderAddress, network),
    isContractPaused(contractId, senderAddress, network),
  ]);

  return {
    contractId: contractId.toString(),
    version: version.status === 'fulfilled' ? version.value : null,
    isPaused: isPaused.status === 'fulfilled' ? isPaused.value : false,
  };
}

/**
 * Batch read-only calls (runs in parallel)
 */
export async function batchReadOnly<T = unknown>(
  calls: ReadOnlyCallOptions[]
): Promise<ReadOnlyResult<T>[]> {
  return Promise.all(calls.map((opts) => callReadOnly<T>(opts)));
}
