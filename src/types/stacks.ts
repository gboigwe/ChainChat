/**
 * Stacks SDK Type Definitions
 */

export interface StacksTransaction {
  txid: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
}

export interface StacksNetwork {
  version: number;
  chainId: number;
  url: string;
}
