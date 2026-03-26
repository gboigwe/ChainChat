// Shared Stacks.js utilities and constants
/** Stacks mainnet chain ID */
export const MAINNET_CHAIN_ID = 1;
/** Stacks testnet chain ID */
export const TESTNET_CHAIN_ID = 2147483648;
/** Stacks mainnet API base URL */
export const MAINNET_API_URL = 'https://api.hiro.so';
/** Stacks testnet API base URL */
export const TESTNET_API_URL = 'https://api.testnet.hiro.so';
/** Network type */
export type StacksNetwork = 'mainnet' | 'testnet' | 'devnet';
/** Get API URL for network */
export function getApiUrl(network: StacksNetwork): string {
  switch (network) {
    case 'mainnet': return MAINNET_API_URL;
    case 'testnet': return TESTNET_API_URL;
    case 'devnet': return 'http://localhost:3999';
    default: throw new Error(`Unknown network: ${network}`);
  }
}
/** Get chain ID for network */
export function getChainId(network: StacksNetwork): number {
  return network === 'mainnet' ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID;
}
/** MicroSTX per STX */
export const MICRO_STX_PER_STX = 1_000_000n;
/** Convert STX to microSTX */
export function stxToMicroStx(stx: bigint): bigint { return stx * MICRO_STX_PER_STX; }
/** Convert microSTX to STX */
export function microStxToStx(microStx: bigint): bigint { return microStx / MICRO_STX_PER_STX; }
/** Format microSTX as decimal STX string */
export function formatMicroStx(microStx: bigint, decimals = 6): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = microStx / divisor;
  const frac = microStx % divisor;
  return `${whole}.${frac.toString().padStart(decimals, '0')}`;
}
/** Check if two addresses are equal */
export function addressesEqual(a: string, b: string): boolean { return a === b; }
/** Minimum transaction fee in microSTX */
export const MIN_TX_FEE = 180n;
/** Default anchor mode */
export const DEFAULT_ANCHOR_MODE = 'any';
/** Transaction version for mainnet */
export const TX_VERSION_MAINNET = 0;
/** Transaction version for testnet */
export const TX_VERSION_TESTNET = 128;
/** Get transaction version for network */
export function getTxVersion(network: StacksNetwork): number {
  return network === 'mainnet' ? TX_VERSION_MAINNET : TX_VERSION_TESTNET;
}
/** Post condition modes */
export type PostConditionMode = 'allow' | 'deny';
/** Anchor mode options */
export type AnchorMode = 'on-chain-only' | 'off-chain-only' | 'any';
/** Transaction status values */
export type TxStatus = 'pending' | 'success' | 'abort_by_response' | 'abort_by_post_condition';
/** Check if tx status is final */
export function isTxFinalized(status: TxStatus): boolean {
  return status !== 'pending';
}
/** Check if tx was successful */
export function isTxSuccess(status: TxStatus): boolean {
  return status === 'success';
}
