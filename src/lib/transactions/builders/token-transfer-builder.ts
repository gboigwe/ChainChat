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
