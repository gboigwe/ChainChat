// Stacks Connect STX transfer helpers
/** STX transfer options */
export interface STXTransferOptions {
  recipient: string;
  amount: bigint;
  memo?: string;
  network: string;
  fee?: bigint;
  nonce?: bigint;
  onFinish?: (data: { txId: string; txRaw: string }) => void;
  onCancel?: () => void;
}
