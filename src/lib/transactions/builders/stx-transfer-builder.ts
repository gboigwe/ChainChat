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
