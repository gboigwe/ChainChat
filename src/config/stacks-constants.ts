/**
 * Stacks blockchain constants used across the application
 */

/** Minimum Stacks transaction fee in micro-STX */
export const MIN_TX_FEE = BigInt(200);

/** Default fee for contract calls if estimation fails */
export const DEFAULT_CONTRACT_CALL_FEE = BigInt(10_000);

/** Default fee for STX transfers if estimation fails */
export const DEFAULT_STX_TRANSFER_FEE = BigInt(3_000);

/** Number of micro-STX per STX */
export const MICROSTX_PER_STX = 1_000_000n;

/** Approximate Stacks block time in seconds */
export const STACKS_BLOCK_TIME_SECONDS = 600;

/** Maximum number of function arguments for a contract call */
export const MAX_CONTRACT_CALL_ARGS = 10;

/** Maximum number of post-conditions per transaction */
export const MAX_POST_CONDITIONS = 25;

/** Maximum memo length for STX transfers (bytes) */
export const MAX_MEMO_LENGTH = 34;

/** Stacks address version byte for mainnet (P2PKH) */
export const MAINNET_P2PKH_ADDRESS_VERSION = 22;

/** Stacks address version byte for mainnet (P2SH) */
export const MAINNET_P2SH_ADDRESS_VERSION = 20;

/** Stacks address version byte for testnet (P2PKH) */
export const TESTNET_P2PKH_ADDRESS_VERSION = 26;

/** Stacks address version byte for testnet (P2SH) */
export const TESTNET_P2SH_ADDRESS_VERSION = 21;

/** Mainnet address prefix */
export const MAINNET_ADDRESS_PREFIX = 'SP';

/** Testnet address prefix */
export const TESTNET_ADDRESS_PREFIX = 'ST';

/** Current ChainChat contract version */
export const CONTRACT_VERSION = '4.0.0';

/**
 * Known terminal transaction statuses that will not change
 */
export const TERMINAL_TX_STATUSES = [
  'success',
  'abort_by_response',
  'abort_by_post_condition',
  'dropped_replace_by_fee',
  'dropped_expired',
  'dropped_stale_garbage_collect',
] as const;

/**
 * Hiro API rate limit: requests per 60-second window
 */
export const HIRO_API_RATE_LIMIT = 500;
