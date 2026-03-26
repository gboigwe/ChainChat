// Clarity v4 encoding utility functions
/** Encode a bigint as hex string (little-endian 16 bytes) */
export function bigintToHex(value: bigint): string {
  return value.toString(16).padStart(32, '0');
}
