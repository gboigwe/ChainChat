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
/** Validate contract call args before opening */
export function validateContractCallArgs(options: Partial<ContractCallRegularOptions>): string[] {
  const errors: string[] = [];
  if (!options.contractAddress) errors.push('contractAddress is required');
  if (!options.contractName) errors.push('contractName is required');
  if (!options.functionName) errors.push('functionName is required');
  if (!Array.isArray(options.functionArgs)) errors.push('functionArgs must be an array');
  return errors;
}
/** Build contract call options with defaults */
export function buildContractCallOptions(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: unknown[],
  network: string,
  overrides?: Partial<ContractCallRegularOptions>,
): ContractCallRegularOptions {
  return {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    network,
    postConditionMode: 'deny',
    ...overrides,
  };
}
