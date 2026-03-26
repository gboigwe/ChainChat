// Stacks Connect contract call helpers
/** Contract call options for openContractCall */
export interface ContractCallRegularOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  network: string;
  fee?: bigint;
  nonce?: bigint;
  postConditionMode?: 'allow' | 'deny';
  postConditions?: unknown[];
  onFinish?: (data: FinishedTxData) => void;
  onCancel?: () => void;
}
/** Data returned after a finished transaction */
export interface FinishedTxData {
  txId: string;
  txRaw: string;
  stacksTransaction?: unknown;
}
