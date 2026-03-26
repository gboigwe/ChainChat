/**
 * Typed transaction builders for Stacks contract calls
 * Provides strongly-typed wrappers around @stacks/transactions
 */

import {
  makeContractCall,
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  intCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  bufferCV,
  boolCV,
  tupleCV,
  listCV,
  noneCV,
  someCV,
  type ClarityValue,
} from '@stacks/transactions';
import { getStacksNetwork } from './stacks-network';
import { type StacksNetworkName } from '../config/network-config';
import { type TxId, type MicroStx, type StacksAddress, type ContractId, toTxId } from '../types/stacks';

// ─── Transaction Options ──────────────────────────────────────────────────────

export interface ContractCallTxOptions {
  contractId: ContractId | string;
  functionName: string;
  functionArgs: ClarityValue[];
  senderKey: string;
  fee?: MicroStx | bigint;
  nonce?: bigint;
  network?: StacksNetworkName;
  postConditions?: any[];
  postConditionMode?: PostConditionMode;
  anchorMode?: AnchorMode;
}

export interface StxTransferTxOptions {
  recipient: StacksAddress | string;
  amount: MicroStx | bigint;
  senderKey: string;
  memo?: string;
  fee?: MicroStx | bigint;
  nonce?: bigint;
  network?: StacksNetworkName;
}

// ─── Transaction Builders ─────────────────────────────────────────────────────

/**
 * Build and broadcast a contract call transaction
 * Returns the transaction ID on success
 */
export async function contractCall(options: ContractCallTxOptions): Promise<TxId> {
  const network = getStacksNetwork(options.network);
  const [contractAddress, contractName] = options.contractId.includes('.')
    ? options.contractId.split('.')
    : (() => {
        throw new Error(`Invalid contract ID: ${options.contractId}`);
      })();

  const txOptions: any = {
    contractAddress,
    contractName,
    functionName: options.functionName,
    functionArgs: options.functionArgs,
    senderKey: options.senderKey,
    network,
    postConditions: options.postConditions ?? [],
    postConditionMode: options.postConditionMode ?? PostConditionMode.Deny,
    anchorMode: options.anchorMode ?? AnchorMode.Any,
  };

  if (options.fee !== undefined) txOptions.fee = options.fee;
  if (options.nonce !== undefined) txOptions.nonce = options.nonce;

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if ('error' in broadcastResponse) {
    throw new Error(`Transaction broadcast failed: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
  }

  return toTxId(broadcastResponse.txid);
}

/**
 * Build and broadcast an STX token transfer
 */
export async function stxTransfer(options: StxTransferTxOptions): Promise<TxId> {
  const network = getStacksNetwork(options.network);

  const txOptions: any = {
    recipient: options.recipient,
    amount: options.amount,
    senderKey: options.senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  if (options.memo) txOptions.memo = options.memo;
  if (options.fee !== undefined) txOptions.fee = options.fee;
  if (options.nonce !== undefined) txOptions.nonce = options.nonce;

  const transaction = await makeSTXTokenTransfer(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if ('error' in broadcastResponse) {
    throw new Error(`STX transfer failed: ${broadcastResponse.error}`);
  }

  return toTxId(broadcastResponse.txid);
}

// ─── Clarity Value Builders ───────────────────────────────────────────────────

/** Convenience wrappers for Clarity value construction */
export const cv = {
  uint: (n: bigint | number) => uintCV(n.toString()),
  int: (n: bigint | number) => intCV(n.toString()),
  principal: (addr: string) => principalCV(addr),
  ascii: (s: string) => stringAsciiCV(s),
  utf8: (s: string) => stringUtf8CV(s),
  buff: (b: Uint8Array) => bufferCV(b),
  bool: (b: boolean) => boolCV(b),
  tuple: (fields: Record<string, ClarityValue>) => tupleCV(fields),
  list: (items: ClarityValue[]) => listCV(items),
  none: () => noneCV(),
  some: (val: ClarityValue) => someCV(val),
  optionalUint: (n?: bigint | number) => n !== undefined ? someCV(uintCV(n.toString())) : noneCV(),
  optionalPrincipal: (addr?: string) => addr ? someCV(principalCV(addr)) : noneCV(),
  optionalAscii: (s?: string) => s !== undefined ? someCV(stringAsciiCV(s)) : noneCV(),
};

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Split a contract ID into its parts
 */
export function splitContractId(contractId: string): [string, string] {
  const parts = contractId.split('.');
  if (parts.length !== 2) throw new Error(`Invalid contract ID: ${contractId}`);
  return [parts[0], parts[1]];
}

/**
 * Estimate gas cost for a contract call (conservative upper bound)
 */
export function estimateContractCallFee(argsCount: number): MicroStx {
  // Base fee + per-arg overhead
  const base = BigInt(2000);
  const perArg = BigInt(200);
  return (base + perArg * BigInt(argsCount)) as MicroStx;
}
