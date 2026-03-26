// Example: Send a chat message using ChainChat protocol
export const EXAMPLE_CONTRACT_ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const EXAMPLE_CONTRACT_NAME = 'chainchat-v1';
export const EXAMPLE_FUNCTION_POST_MSG = 'post-message';
export const EXAMPLE_CHANNEL_ID = 1n;
export const EXAMPLE_MESSAGE_CONTENT = 'Hello from ChainChat!';
export const EXAMPLE_FEE_MICROSX = 2500n;
export const EXAMPLE_NETWORK = 'mainnet';
export const EXAMPLE_ANCHOR_MODE = 3;

export interface SendMessageOptions {
  senderAddress: string;
  channelId: bigint;
  content: string;
  fee?: bigint;
}
export interface SendMessageResult {
  txId: string;
  status: 'pending' | 'submitted' | 'error';
  error?: string;
}
export function buildPostMessageArgs(opts: SendMessageOptions): unknown[] {
  return [{ type: 'uint', value: opts.channelId }, { type: 'string-ascii', value: opts.content }];
}
export function validateSendMessageOptions(opts: SendMessageOptions): string | null {
  if (!opts.senderAddress) return 'senderAddress is required';
  if (opts.channelId <= 0n) return 'channelId must be positive';
  if (!opts.content) return 'content cannot be empty';
  if (opts.content.length > 1024) return 'content too long';
  return null;
}
export async function simulateSendMessage(opts: SendMessageOptions): Promise<SendMessageResult> {
  const error = validateSendMessageOptions(opts);
  if (error) return { txId: '', status: 'error', error };
  return { txId: '0x' + '0'.repeat(64), status: 'pending' };
}
export const SEND_MSG_CONST_1 = 1;
export const SEND_MSG_CONST_2 = 2;
export const SEND_MSG_CONST_3 = 3;
export const SEND_MSG_CONST_4 = 4;
