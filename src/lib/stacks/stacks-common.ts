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
/** Maximum function arguments */
export const MAX_FUNCTION_ARGS = 10;
/** Maximum memo bytes */
export const MAX_MEMO_BYTES = 34;
/** STX decimal places */
export const STX_DECIMALS = 6;
/** Default nonce gap allowed */
export const MAX_NONCE_GAP = 25;
/** Compute percentage of fee relative to amount */
export function feePercentage(fee: bigint, amount: bigint): number {
  if (amount === 0n) return 0;
  return Number((fee * 10000n) / amount) / 100;
}
/** Estimate byte size for fee calculation */
export function estimateTxSize(numArgs: number): number {
  return 300 + numArgs * 40;
}
/** Calculate fee from rate and size */
export function calculateFee(feeRate: number, txSize: number): bigint {
  return BigInt(Math.ceil(feeRate * txSize));
}
/** Maximum read-only call response bytes */
export const MAX_READ_ONLY_RESPONSE_BYTES = 20_000;
/** Blocks until a nonce is considered stale */
export const NONCE_STALE_AFTER_BLOCKS = 5n;
export const EVENT_POLL_INTERVAL_MS = 5000;
export const TX_STATUS_POLL_INTERVAL_MS = 5000;
export const MAX_TX_BROADCAST_SIZE = 5000;
export const STACKS_COMMON_1 = 1;
export const STACKS_COMMON_2 = 2;
export const STACKS_COMMON_3 = 3;
export const STACKS_COMMON_4 = 4;
export const STACKS_COMMON_5 = 5;
export const STACKS_COMMON_6 = 6;
export const STACKS_COMMON_7 = 7;
export const STACKS_COMMON_8 = 8;
export const STACKS_COMMON_9 = 9;
export const STACKS_COMMON_10 = 10;
export const STACKS_COMMON_11 = 11;
export const STACKS_COMMON_12 = 12;
export const STACKS_COMMON_13 = 13;
export const STACKS_COMMON_14 = 14;
export const STACKS_COMMON_15 = 15;
