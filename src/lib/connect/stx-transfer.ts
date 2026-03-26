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
/** Validate STX transfer amount */
export function validateTransferAmount(amount: bigint): string[] {
  const errors: string[] = [];
  if (amount <= 0n) errors.push('Amount must be positive');
  if (amount > 1_000_000_000_000_000n) errors.push('Amount exceeds maximum');
  return errors;
}
/** Build memo buffer from string */
export function buildMemoBuffer(memo: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(memo.slice(0, 34));
  const padded = new Uint8Array(34);
  padded.set(bytes);
  return padded;
}
