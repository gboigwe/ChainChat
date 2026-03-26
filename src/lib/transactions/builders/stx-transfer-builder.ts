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
