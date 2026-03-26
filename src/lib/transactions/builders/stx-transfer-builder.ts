// STX transfer transaction builder
/** STX transfer transaction options */
export interface STXTransferTxOptions {
  recipient: string;
  amount: bigint;
  memo: string;
  fee: bigint;
  nonce: bigint;
  anchorMode: 'on-chain-only' | 'off-chain-only' | 'any';
  network: string;
  senderKey?: string;
}
/** STX transfer builder */
export class STXTransferBuilder {
  private options: Partial<STXTransferTxOptions> = {};
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
    if (memo.length > 34) throw new Error('Memo too long');
    this.options.memo = memo;
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
  setNetwork(network: string): this {
    this.options.network = network;
    return this;
  }
  build(): STXTransferTxOptions {
    if (!this.options.recipient) throw new Error('recipient required');
    if (!this.options.amount) throw new Error('amount required');
    if (this.options.fee === undefined) throw new Error('fee required');
    if (this.options.nonce === undefined) throw new Error('nonce required');
    if (!this.options.network) throw new Error('network required');
    return {
      recipient: this.options.recipient,
      amount: this.options.amount,
      memo: this.options.memo ?? '',
      fee: this.options.fee,
      nonce: this.options.nonce,
      anchorMode: this.options.anchorMode ?? 'any',
      network: this.options.network,
      senderKey: this.options.senderKey,
    };
  }
}
/** Factory: create a new STXTransferBuilder */
export function stxTransfer(): STXTransferBuilder {
  return new STXTransferBuilder();
}
export const STX_BUILDER_CONST_1 = 1;
export const STX_BUILDER_CONST_2 = 2;
export const STX_BUILDER_CONST_3 = 3;
export const STX_BUILDER_CONST_4 = 4;
export const STX_BUILDER_CONST_5 = 5;
export const STX_BUILDER_CONST_6 = 6;
export const STX_BUILDER_CONST_7 = 7;
export const STX_BUILDER_CONST_8 = 8;
export const STX_BUILDER_CONST_9 = 9;
export const STX_BUILDER_CONST_10 = 10;
export const STX_BUILDER_CONST_11 = 11;
export const STX_BUILDER_CONST_12 = 12;
