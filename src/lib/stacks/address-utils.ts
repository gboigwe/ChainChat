// Stacks address encoding and validation utilities
/** C32 alphabet for Stacks addresses */
const C32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
/** Address version bytes */
export enum AddressVersion {
  MainnetSingleSig = 22,
  MainnetMultiSig = 20,
  TestnetSingleSig = 26,
  TestnetMultiSig = 21,
}
/** Check if address is mainnet */
export function isMainnetAddress(address: string): boolean {
  return address.startsWith('SP');
}
/** Check if address is testnet */
export function isTestnetAddress(address: string): boolean {
  return address.startsWith('ST');
}
/** Validate Stacks address format */
export function validateStacksAddress(address: string): boolean {
  if (!address) return false;
  if (!isMainnetAddress(address) && !isTestnetAddress(address)) return false;
  if (address.length < 38 || address.length > 42) return false;
  return /^S[PT][0-9A-Z]+$/.test(address);
}
