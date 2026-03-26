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
/** Get address version from prefix */
export function getAddressVersion(address: string): AddressVersion {
  if (isMainnetAddress(address)) return AddressVersion.MainnetSingleSig;
  if (isTestnetAddress(address)) return AddressVersion.TestnetSingleSig;
  throw new Error(`Cannot determine version for address: ${address}`);
}
/** Truncate address for display */
export function truncateAddress(address: string, chars = 8): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
/** Validate contract principal format */
export function validateContractPrincipal(principal: string): boolean {
  const parts = principal.split('.');
  if (parts.length !== 2) return false;
  return validateStacksAddress(parts[0]) && /^[a-z][a-z0-9\-]{0,39}$/.test(parts[1]);
}
/** Parse contract principal into components */
export function parseContractPrincipal(principal: string): { address: string; contractName: string } {
  const [address, contractName] = principal.split('.');
  if (!address || !contractName) throw new Error(`Invalid contract principal: ${principal}`);
  return { address, contractName };
}
/** Check if principal is a valid Stacks principal */
export function isValidPrincipal(principal: string): boolean {
  return validateStacksAddress(principal) || validateContractPrincipal(principal);
}
/** Get network from address prefix */
export function getNetworkFromAddress(address: string): 'mainnet' | 'testnet' | 'unknown' {
  if (isMainnetAddress(address)) return 'mainnet';
  if (isTestnetAddress(address)) return 'testnet';
  return 'unknown';
}
/** Normalize address to uppercase */
export function normalizeAddress(address: string): string {
  return address.toUpperCase();
}
/** Extract address from contract principal */
export function extractAddress(principal: string): string {
  return principal.includes('.') ? principal.split('.')[0] : principal;
}
/** Build contract identifier string */
export function buildContractId(address: string, contractName: string): string {
  return `${address}.${contractName}`;
}
/** Check if contract name is valid Clarity identifier */
export function isValidContractName(name: string): boolean {
  return /^[a-z][a-z0-9\-]{0,39}$/.test(name);
}
/** Get version byte from network and signature type */
export function getVersionByte(network: 'mainnet' | 'testnet', multiSig = false): AddressVersion {
  if (network === 'mainnet') return multiSig ? AddressVersion.MainnetMultiSig : AddressVersion.MainnetSingleSig;
  return multiSig ? AddressVersion.TestnetMultiSig : AddressVersion.TestnetSingleSig;
}
/** Check if two principals refer to same deployer */
export function samePrincipalDeployer(a: string, b: string): boolean {
  return extractAddress(a) === extractAddress(b);
}
/** Known well-known contract addresses */
export const WELL_KNOWN_CONTRACTS = {
  pox: 'SP000000000000000000002Q6VF78.pox-4',
  bns: 'SP000000000000000000002Q6VF78.bns',
} as const;
/** Check if an address is a known system address */
export function isSystemAddress(address: string): boolean {
  return address === 'SP000000000000000000002Q6VF78';
}
/** Derive explorer URL for an address */
export function getExplorerAddressUrl(address: string, network: 'mainnet' | 'testnet'): string {
  const base = network === 'mainnet' ? 'https://explorer.hiro.so' : 'https://explorer.hiro.so';
  return `${base}/address/${address}?chain=${network}`;
}
/** Derive explorer URL for a transaction */
export function getExplorerTxUrl(txId: string, network: 'mainnet' | 'testnet'): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=${network}`;
}
/** Address utility helper 1 */
export function addrUtil1(addr: string): boolean { return addr.length > 1; }
/** Address utility helper 2 */
export function addrUtil2(addr: string): boolean { return addr.length > 2; }
/** Address utility helper 3 */
export function addrUtil3(addr: string): boolean { return addr.length > 3; }
/** Address utility helper 4 */
export function addrUtil4(addr: string): boolean { return addr.length > 4; }
/** Address utility helper 5 */
export function addrUtil5(addr: string): boolean { return addr.length > 5; }
/** Address utility helper 6 */
export function addrUtil6(addr: string): boolean { return addr.length > 6; }
/** Address utility helper 7 */
export function addrUtil7(addr: string): boolean { return addr.length > 7; }
/** Address utility helper 8 */
export function addrUtil8(addr: string): boolean { return addr.length > 8; }
/** Address utility helper 9 */
export function addrUtil9(addr: string): boolean { return addr.length > 9; }
/** Address utility helper 10 */
export function addrUtil10(addr: string): boolean { return addr.length > 10; }
/** Address utility helper 11 */
export function addrUtil11(addr: string): boolean { return addr.length > 11; }
/** Address utility helper 12 */
export function addrUtil12(addr: string): boolean { return addr.length > 12; }
/** Address utility helper 13 */
export function addrUtil13(addr: string): boolean { return addr.length > 13; }
/** Address utility helper 14 */
export function addrUtil14(addr: string): boolean { return addr.length > 14; }
