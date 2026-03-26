// Step-by-step ContractCallTransaction builder
/** Contract call transaction options */
export interface ContractCallTxOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  fee: bigint;
  nonce: bigint;
  anchorMode: 'on-chain-only' | 'off-chain-only' | 'any';
  postConditionMode: 'allow' | 'deny';
  postConditions: unknown[];
  network: string;
  senderKey?: string;
}
/** Mutable builder for ContractCallTransaction */
export class ContractCallBuilder {
  private options: Partial<ContractCallTxOptions> = {};
  setContractAddress(address: string): this {
    this.options.contractAddress = address;
    return this;
  }
