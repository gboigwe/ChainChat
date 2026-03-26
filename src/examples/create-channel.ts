// Example: Create a channel using ChainChat protocol
export const CHANNEL_EXAMPLE_CONTRACT = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.chainchat-v1';
export const CHANNEL_EXAMPLE_FUNCTION = 'create-channel';
export const CHANNEL_EXAMPLE_MIN_NAME_LEN = 3;
export const CHANNEL_EXAMPLE_MAX_NAME_LEN = 48;
export const CHANNEL_EXAMPLE_VISIBILITY_PUBLIC = 0;
export const CHANNEL_EXAMPLE_VISIBILITY_PRIVATE = 1;
export const CHANNEL_EXAMPLE_MAX_MEMBERS = 256n;
export const CHANNEL_EXAMPLE_FEE = 5000n;

export interface CreateChannelOptions {
  creatorAddress: string;
  name: string;
  visibility: 0 | 1;
  maxMembers?: bigint;
  fee?: bigint;
}
export interface CreateChannelResult {
  txId: string;
  channelId?: bigint;
  status: 'pending' | 'submitted' | 'error';
  error?: string;
}
export function buildCreateChannelArgs(opts: CreateChannelOptions): unknown[] {
  return [
    { type: 'string-ascii', value: opts.name },
    { type: 'uint', value: opts.visibility },
    { type: 'uint', value: opts.maxMembers ?? CHANNEL_EXAMPLE_MAX_MEMBERS },
  ];
}
export function validateCreateChannelOptions(opts: CreateChannelOptions): string | null {
  if (!opts.creatorAddress) return 'creatorAddress is required';
  if (opts.name.length < CHANNEL_EXAMPLE_MIN_NAME_LEN) return 'name too short';
  if (opts.name.length > CHANNEL_EXAMPLE_MAX_NAME_LEN) return 'name too long';
  if (opts.visibility !== 0 && opts.visibility !== 1) return 'invalid visibility';
  return null;
}
export async function simulateCreateChannel(opts: CreateChannelOptions): Promise<CreateChannelResult> {
  const error = validateCreateChannelOptions(opts);
  if (error) return { txId: '', status: 'error', error };
  return { txId: '0x' + '1'.repeat(64), channelId: 1n, status: 'pending' };
}
export const CREATE_CHAN_CONST_1 = 1;
export const CREATE_CHAN_CONST_2 = 2;
