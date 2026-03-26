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
