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
