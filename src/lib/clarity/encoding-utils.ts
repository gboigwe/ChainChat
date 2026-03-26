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
/** Encode buffer as hex string */
export function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}
/** Decode hex string to Uint8Array buffer */
export function hexToBuffer(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
/** Pad hex string to 64 chars (32 bytes) */
export function padHex(hex: string): string {
  return hex.replace(/^0x/, '').padStart(64, '0');
}
/** Check if string is valid hex */
export function isHexString(str: string): boolean {
  return /^(0x)?[0-9a-fA-F]*$/.test(str);
}
/** Normalize hex string by removing 0x prefix */
export function normalizeHex(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex;
}
