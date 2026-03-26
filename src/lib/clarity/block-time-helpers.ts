// Clarity v4 block-time utilities for timestamps and expiry

/** Average Stacks block time in seconds (~10 min) */
export const AVERAGE_BLOCK_TIME_SECONDS = 600;

/** Blocks per hour on Stacks mainnet */
export const BLOCKS_PER_HOUR = 6;

/** Blocks per day on Stacks mainnet */
export const BLOCKS_PER_DAY = 144;

/** Blocks per week on Stacks mainnet */
export const BLOCKS_PER_WEEK = 1008;

/** Blocks per 30-day month approximation */
export const BLOCKS_PER_MONTH = 4320;

/** Unix timestamp of Stacks genesis block (mainnet) */
export const STACKS_GENESIS_TIMESTAMP = 1604956800;

/** Estimate Unix timestamp from block height */
export function blockHeightToTimestamp(
  blockHeight: bigint,
  genesisTimestamp = STACKS_GENESIS_TIMESTAMP,
): number {
  return genesisTimestamp + Number(blockHeight) * AVERAGE_BLOCK_TIME_SECONDS;
}

/** Estimate block height from Unix timestamp */
export function timestampToBlockHeight(
  timestamp: number,
  genesisTimestamp = STACKS_GENESIS_TIMESTAMP,
): bigint {
  const elapsed = timestamp - genesisTimestamp;
  return BigInt(Math.floor(elapsed / AVERAGE_BLOCK_TIME_SECONDS));
}

/** Convert block height to a JavaScript Date object */
export function blockHeightToDate(blockHeight: bigint): Date {
  return new Date(blockHeightToTimestamp(blockHeight) * 1000);
}

/** Format block height as a locale date string */
export function formatBlockDate(blockHeight: bigint, locale = 'en-US'): string {
  return blockHeightToDate(blockHeight).toLocaleDateString(locale);
}
