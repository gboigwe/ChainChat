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
  validate(): string[] {
    const errors: string[] = [];
    if (!this.options.contractAddress) errors.push('contractAddress required');
    if (!this.options.contractName) errors.push('contractName required');
    if (!this.options.functionName) errors.push('functionName required');
    if (!this.options.network) errors.push('network required');
    if (this.options.fee === undefined) errors.push('fee required');
    if (this.options.nonce === undefined) errors.push('nonce required');
    return errors;
  }
  build(): ContractCallTxOptions {
    const errors = this.validate();
    if (errors.length > 0) throw new Error(`Build failed: ${errors.join(', ')}`);
    return {
      contractAddress: this.options.contractAddress!,
      contractName: this.options.contractName!,
      functionName: this.options.functionName!,
      functionArgs: this.options.functionArgs ?? [],
      fee: this.options.fee!,
      nonce: this.options.nonce!,
      anchorMode: this.options.anchorMode ?? 'any',
      postConditionMode: this.options.postConditionMode ?? 'deny',
      postConditions: this.options.postConditions ?? [],
      network: this.options.network!,
      senderKey: this.options.senderKey,
    };
  }
}
/** Factory: create a new ContractCallBuilder */
export function contractCall(): ContractCallBuilder {
  return new ContractCallBuilder();
}
export const CC_BUILDER_CONST_1 = 1;
export const CC_BUILDER_CONST_2 = 2;
export const CC_BUILDER_CONST_3 = 3;
export const CC_BUILDER_CONST_4 = 4;
export const CC_BUILDER_CONST_5 = 5;
export const CC_BUILDER_CONST_6 = 6;
export const CC_BUILDER_CONST_7 = 7;
export const CC_BUILDER_CONST_8 = 8;
export const CC_BUILDER_CONST_9 = 9;
export const CC_BUILDER_CONST_10 = 10;
export const CC_BUILDER_CONST_11 = 11;
