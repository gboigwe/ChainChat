// Shared TypeScript types for Stacks.js SDK integration
/** Contract call options */
export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  network: string;
}
/** Read-only call result */
export interface ReadOnlyResult {
  okay: boolean;
  result?: string;
  cause?: string;
}
