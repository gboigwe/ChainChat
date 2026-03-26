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
