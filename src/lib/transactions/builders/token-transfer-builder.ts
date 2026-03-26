// FT (fungible token) transfer transaction builder
/** FT transfer transaction options */
export interface FTTransferTxOptions {
  contractAddress: string;
  contractName: string;
  tokenName: string;
  recipient: string;
  amount: bigint;
  memo?: string;
  fee: bigint;
  nonce: bigint;
  network: string;
  anchorMode: 'on-chain-only' | 'off-chain-only' | 'any';
}
/** FT transfer builder */
export class FTTransferBuilder {
  private options: Partial<FTTransferTxOptions> = {};
  setContractAddress(address: string): this {
    this.options.contractAddress = address;
    return this;
  }
  setContractName(name: string): this {
    this.options.contractName = name;
    return this;
  }
  setTokenName(name: string): this {
    this.options.tokenName = name;
    return this;
  }
  setRecipient(recipient: string): this {
    this.options.recipient = recipient;
    return this;
  }
  setAmount(amount: bigint): this {
    if (amount <= 0n) throw new Error('Amount must be positive');
    this.options.amount = amount;
    return this;
  }
  setMemo(memo: string): this {
    this.options.memo = memo;
    return this;
  }
  setFee(fee: bigint): this { this.options.fee = fee; return this; }
  setNonce(nonce: bigint): this { this.options.nonce = nonce; return this; }
  setNetwork(net: string): this { this.options.network = net; return this; }
  setAnchorMode(m: 'on-chain-only' | 'off-chain-only' | 'any'): this { this.options.anchorMode = m; return this; }
  build(): FTTransferTxOptions {
    const { contractAddress, contractName, tokenName, recipient, amount, fee, nonce, network } = this.options;
    if (!contractAddress || !contractName || !tokenName || !recipient || !amount || fee === undefined || nonce === undefined || !network)
      throw new Error('Missing required FT transfer fields');
    return { contractAddress, contractName, tokenName, recipient, amount, memo: this.options.memo ?? '', fee, nonce, network, anchorMode: this.options.anchorMode ?? 'any' };
  }
}
/** Factory: create FTTransferBuilder */
export function ftTransfer(): FTTransferBuilder {
  return new FTTransferBuilder();
}
export const FT_BUILDER_CONST_1 = 1;
export const FT_BUILDER_CONST_2 = 2;
export const FT_BUILDER_CONST_3 = 3;
export const FT_BUILDER_CONST_4 = 4;
export const FT_BUILDER_CONST_5 = 5;
export const FT_BUILDER_CONST_6 = 6;
export const FT_BUILDER_CONST_7 = 7;
export const FT_BUILDER_CONST_8 = 8;
export const FT_BUILDER_CONST_9 = 9;
export const FT_BUILDER_CONST_10 = 10;
export const FT_BUILDER_CONST_11 = 11;
export const FT_BUILDER_CONST_12 = 12;
export const FT_BUILDER_CONST_13 = 13;
export const FT_BUILDER_CONST_14 = 14;
export const FT_BUILDER_CONST_15 = 15;
export const FT_BUILDER_CONST_16 = 16;
export const FT_BUILDER_CONST_17 = 17;
export const FT_BUILDER_CONST_18 = 18;
export const FT_BUILDER_CONST_19 = 19;
export const FT_BUILDER_CONST_20 = 20;
export const FT_BUILDER_CONST_21 = 21;
export const FT_BUILDER_CONST_22 = 22;
export const FT_BUILDER_CONST_23 = 23;
export const FT_BUILDER_CONST_24 = 24;
export const FT_BUILDER_CONST_25 = 25;
