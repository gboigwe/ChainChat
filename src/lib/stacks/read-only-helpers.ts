// Read-only contract call helper utilities
import type { AnyCV } from './clarity-values';
/** Read-only call result with parsed value */
export interface ParsedReadOnlyResult<T> {
  success: boolean;
  value: T | null;
  rawHex: string;
}
/** Build read-only call URL */
export function buildReadOnlyUrl(
  apiBase: string,
  contractAddress: string,
  contractName: string,
  functionName: string,
): string {
  return `${apiBase}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
}
/** Build read-only request body */
export function buildReadOnlyBody(
  sender: string,
  args: string[],
): Record<string, unknown> {
  return { sender, arguments: args };
}
/** Parse success status from read-only result */
export function isReadOnlySuccess(result: { okay: boolean }): boolean {
  return result.okay === true;
}
/** Extract cause from failed read-only result */
export function getReadOnlyError(result: { cause?: string }): string {
  return result.cause ?? 'Unknown error';
}
/** Common read-only functions for ChainChat */
export const READ_ONLY_FUNCTIONS = {
  getMessage: 'get-message',
  getChannel: 'get-channel',
  getMember: 'get-member',
  getChannelStats: 'get-channel-stats',
  getReactionCount: 'get-reaction-count',
  isChannelMember: 'is-channel-member',
} as const;
/** Read-only call timeout in milliseconds */
export const READ_ONLY_TIMEOUT_MS = 15_000;
/** Max args for read-only calls */
export const MAX_READ_ONLY_ARGS = 10;
/** Check if function is a read-only function */
export function isReadOnlyFunction(name: string): boolean {
  return Object.values(READ_ONLY_FUNCTIONS).includes(name as never);
}
