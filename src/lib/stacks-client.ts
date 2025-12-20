/**
 * Stacks.js Client for ChainChat Contracts
 * Provides utilities to interact with deployed contracts on Mainnet
 */

import {
  makeContractCall,
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  BufferCV,
  UIntCV,
  PrincipalCV,
  StringAsciiCV,
  StringUtf8CV,
  TupleCV,
  ListCV,
  BooleanCV,
  cvToJSON,
  hexToCV,
} from '@stacks/transactions';

import { StacksMainnet, StacksNetwork } from '@stacks/network';
import { NETWORK_CONFIG, getContractId } from '../config/contracts';

/**
 * Get configured network
 */
export function getNetwork(): StacksNetwork {
  return new StacksMainnet({ url: NETWORK_CONFIG.stacksNode });
}

/**
 * Call a read-only contract function
 */
export async function callReadOnlyFunction(
  contractName: string,
  functionName: string,
  functionArgs: any[],
  senderAddress: string
): Promise<any> {
  const network = getNetwork();
  const [contractAddress, contractNameOnly] = contractName.includes('.')
    ? contractName.split('.')
    : [NETWORK_CONFIG.contractOwner, contractName];

  const response = await fetch(
    `${network.coreApiUrl}/v2/contracts/call-read/${contractAddress}/${contractNameOnly}/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderAddress,
        arguments: functionArgs.map((arg) => arg.hex || arg),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to call read-only function: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Build and broadcast a contract call transaction
 */
export async function executeContractCall(
  contractName: string,
  functionName: string,
  functionArgs: any[],
  senderKey: string,
  postConditions: any[] = [],
  options: {
    fee?: number;
    nonce?: number;
    anchorMode?: AnchorMode;
  } = {}
): Promise<string> {
  const network = getNetwork();
  const [contractAddress, contractNameOnly] = contractName.includes('.')
    ? contractName.split('.')
    : [NETWORK_CONFIG.contractOwner, contractName];

  const txOptions = {
    contractAddress,
    contractName: contractNameOnly,
    functionName,
    functionArgs,
    senderKey,
    network,
    postConditions,
    anchorMode: options.anchorMode || AnchorMode.Any,
    fee: options.fee,
    nonce: options.nonce,
    postConditionMode: PostConditionMode.Deny,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if ('error' in broadcastResponse) {
    throw new Error(`Transaction failed: ${broadcastResponse.error}`);
  }

  return broadcastResponse.txid;
}

/**
 * Get contract info
 */
export async function getContractInfo(contractId: string): Promise<any> {
  const network = getNetwork();
  const [contractAddress, contractName] = contractId.split('.');

  const response = await fetch(
    `${network.coreApiUrl}/v2/contracts/interface/${contractAddress}/${contractName}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get contract info: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get contract source
 */
export async function getContractSource(contractId: string): Promise<string> {
  const network = getNetwork();
  const [contractAddress, contractName] = contractId.split('.');

  const response = await fetch(
    `${network.coreApiUrl}/v2/contracts/source/${contractAddress}/${contractName}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get contract source: ${response.statusText}`);
  }

  const data = await response.json();
  return data.source;
}

/**
 * Get account balance
 */
export async function getAccountBalance(address: string): Promise<{
  stx: string;
  fungibleTokens: Record<string, string>;
  nonFungibleTokens: Record<string, string>;
}> {
  const network = getNetwork();

  const response = await fetch(
    `${network.coreApiUrl}/extended/v1/address/${address}/balances`
  );

  if (!response.ok) {
    throw new Error(`Failed to get account balance: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    stx: data.stx.balance,
    fungibleTokens: data.fungible_tokens,
    nonFungibleTokens: data.non_fungible_tokens,
  };
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txId: string): Promise<any> {
  const network = getNetwork();

  const response = await fetch(
    `${network.coreApiUrl}/extended/v1/tx/${txId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get transaction status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txId: string,
  maxWaitTime: number = 120000
): Promise<any> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const status = await getTransactionStatus(txId);

      if (status.tx_status === 'success') {
        return status;
      } else if (status.tx_status === 'abort_by_response' || status.tx_status === 'abort_by_post_condition') {
        throw new Error(`Transaction failed: ${status.tx_status}`);
      }
    } catch (error) {
      // Transaction not found yet, continue polling
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error('Transaction confirmation timeout');
}

/**
 * Helper to create Clarity values
 */
export const cv = {
  uint: (value: number | bigint) => new UIntCV(BigInt(value)),
  principal: (address: string) => new PrincipalCV(address),
  stringAscii: (value: string) => new StringAsciiCV(value),
  stringUtf8: (value: string) => new StringUtf8CV(value),
  buffer: (value: Uint8Array) => new BufferCV(value),
  bool: (value: boolean) => new BooleanCV(value),
  tuple: (data: Record<string, any>) => new TupleCV(data),
  list: (values: any[]) => new ListCV(values),
};
