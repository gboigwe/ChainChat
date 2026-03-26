// Clarity v4 encoding utility functions
/** Encode a bigint as hex string (little-endian 16 bytes) */
export function bigintToHex(value: bigint): string {
  return value.toString(16).padStart(32, '0');
}
/** Decode hex string to bigint */
export function hexToBigint(hex: string): bigint {
  return BigInt('0x' + hex.replace(/^0x/, ''));
}
/** Encode string as ASCII byte array */
export function stringToAsciiBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}
/** Decode ASCII byte array to string */
export function asciiBytesToString(bytes: Uint8Array): string {
  return new TextDecoder('ascii').decode(bytes);
}
