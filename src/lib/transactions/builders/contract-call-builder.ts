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
  setContractName(name: string): this {
    this.options.contractName = name;
    return this;
  }
  setFunctionName(name: string): this {
    this.options.functionName = name;
    return this;
  }
  setFunctionArgs(args: unknown[]): this {
    this.options.functionArgs = args;
    return this;
  }
  addFunctionArg(arg: unknown): this {
    if (!this.options.functionArgs) this.options.functionArgs = [];
    this.options.functionArgs.push(arg);
    return this;
  }
  setFee(fee: bigint): this {
    this.options.fee = fee;
    return this;
  }
  setNonce(nonce: bigint): this {
    this.options.nonce = nonce;
    return this;
  }
  setAnchorMode(mode: 'on-chain-only' | 'off-chain-only' | 'any'): this {
    this.options.anchorMode = mode;
    return this;
  }
  setPostConditionMode(mode: 'allow' | 'deny'): this {
    this.options.postConditionMode = mode;
    return this;
  }
  addPostCondition(pc: unknown): this {
    if (!this.options.postConditions) this.options.postConditions = [];
    this.options.postConditions.push(pc);
    return this;
  }
  setNetwork(network: string): this {
    this.options.network = network;
    return this;
  }
  setSenderKey(key: string): this {
    this.options.senderKey = key;
    return this;
  }
