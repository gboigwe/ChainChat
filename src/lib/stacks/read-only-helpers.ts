// Read-only contract call helper utilities
import type { AnyCV } from './clarity-values';
/** Read-only call result with parsed value */
export interface ParsedReadOnlyResult<T> {
  success: boolean;
  value: T | null;
  rawHex: string;
}
