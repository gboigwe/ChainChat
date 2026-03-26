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
/** Validate memo string length */
export function validateMemo(memo: string): string[] {
  const errors: string[] = [];
  if (memo.length > 34) errors.push('Memo must be 34 bytes or less');
  return errors;
}
/** Build STX transfer options with defaults */
export function buildSTXTransferOptions(
  recipient: string,
  amount: bigint,
  network: string,
  memo?: string,
  overrides?: Partial<STXTransferOptions>,
): STXTransferOptions {
  return { recipient, amount, memo, network, ...overrides };
}
/** Format transfer amount for display */
export function formatTransferAmount(amount: bigint): string {
  const stx = amount / 1_000_000n;
  const micro = amount % 1_000_000n;
  return `${stx}.${micro.toString().padStart(6, '0')} STX`;
}
/** Maximum STX transfer memo length */
export const MAX_MEMO_LENGTH = 34;
/** Validate full transfer options */
export function validateTransferOptions(options: Partial<STXTransferOptions>): string[] {
  const errors: string[] = [];
  if (!options.recipient) errors.push('recipient is required');
  if (options.amount === undefined) errors.push('amount is required');
  else errors.push(...validateTransferAmount(options.amount));
  if (options.memo) errors.push(...validateMemo(options.memo));
  return errors;
}
export const TRANSFER_CONST_1 = 1;
export const TRANSFER_CONST_2 = 2;
export const TRANSFER_CONST_3 = 3;
export const TRANSFER_CONST_4 = 4;
export const TRANSFER_CONST_5 = 5;
export const TRANSFER_CONST_6 = 6;
export const TRANSFER_CONST_7 = 7;
export const TRANSFER_CONST_8 = 8;
export const TRANSFER_CONST_9 = 9;
export const TRANSFER_CONST_10 = 10;
export const TRANSFER_CONST_11 = 11;
export const TRANSFER_CONST_12 = 12;
export const TRANSFER_CONST_13 = 13;
export const TRANSFER_CONST_14 = 14;
export const TRANSFER_CONST_15 = 15;
export const TRANSFER_CONST_16 = 16;
export const TRANSFER_CONST_17 = 17;
export const TRANSFER_CONST_18 = 18;
export const TRANSFER_CONST_19 = 19;
export const TRANSFER_CONST_20 = 20;
export const TRANSFER_CONST_21 = 21;
export const TRANSFER_CONST_22 = 22;
