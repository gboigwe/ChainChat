// Stacks Connect contract call helpers
/** Contract call options for openContractCall */
export interface ContractCallRegularOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  network: string;
  fee?: bigint;
  nonce?: bigint;
  postConditionMode?: 'allow' | 'deny';
  postConditions?: unknown[];
  onFinish?: (data: FinishedTxData) => void;
  onCancel?: () => void;
}
/** Data returned after a finished transaction */
export interface FinishedTxData {
  txId: string;
  txRaw: string;
  stacksTransaction?: unknown;
}
/** Validate contract call args before opening */
export function validateContractCallArgs(options: Partial<ContractCallRegularOptions>): string[] {
  const errors: string[] = [];
  if (!options.contractAddress) errors.push('contractAddress is required');
  if (!options.contractName) errors.push('contractName is required');
  if (!options.functionName) errors.push('functionName is required');
  if (!Array.isArray(options.functionArgs)) errors.push('functionArgs must be an array');
  return errors;
}
/** Build contract call options with defaults */
export function buildContractCallOptions(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: unknown[],
  network: string,
  overrides?: Partial<ContractCallRegularOptions>,
): ContractCallRegularOptions {
  return {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    network,
    postConditionMode: 'deny',
    ...overrides,
  };
}
/** Known function names for ChainChat contract */
export const CHAINCHAT_FUNCTIONS = {
  postMessage: 'post-message',
  createChannel: 'create-channel',
  joinChannel: 'join-channel',
  leaveChannel: 'leave-channel',
  inviteMember: 'invite-member',
  kickMember: 'kick-member',
  reactToMessage: 'react-to-message',
  deleteMessage: 'delete-message',
  updateChannelInfo: 'update-channel-info',
} as const;
/** Check if tx was cancelled by user */
export function isCancelled(data: unknown): boolean {
  return data === null || data === undefined;
}
/** Extract txId from finished data */
export function extractTxId(data: FinishedTxData): string {
  return data.txId.startsWith('0x') ? data.txId.slice(2) : data.txId;
}
/** Post-condition type options */
export type PostConditionCode = 'sent-equal-to' | 'sent-less-than' | 'sent-greater-than' | 'sent-less-than-or-equal-to' | 'sent-greater-than-or-equal-to';
/** Build a STX post-condition */
export function buildSTXPostCondition(
  principal: string,
  code: PostConditionCode,
  amount: bigint,
): Record<string, unknown> {
  return { type: 'stx', principal, conditionCode: code, amount: amount.toString() };
}
/** Check if options are ready to submit */
export function isReadyToSubmit(options: ContractCallRegularOptions): boolean {
  return validateContractCallArgs(options).length === 0;
}
export const CALL_CONST_1 = 1;
export const CALL_CONST_2 = 2;
export const CALL_CONST_3 = 3;
export const CALL_CONST_4 = 4;
export const CALL_CONST_5 = 5;
export const CALL_CONST_6 = 6;
export const CALL_CONST_7 = 7;
export const CALL_CONST_8 = 8;
export const CALL_CONST_9 = 9;
export const CALL_CONST_10 = 10;
export const CALL_CONST_11 = 11;
export const CALL_CONST_12 = 12;
export const CALL_CONST_13 = 13;
export const CALL_CONST_14 = 14;
export const CALL_CONST_15 = 15;
export const CALL_CONST_16 = 16;
export const CALL_CONST_17 = 17;
export const CALL_CONST_18 = 18;
export const CALL_CONST_19 = 19;
export const CALL_CONST_20 = 20;
export const CALL_CONST_21 = 21;
export const CALL_CONST_22 = 22;
export const CALL_CONST_23 = 23;
export const CALL_CONST_24 = 24;
