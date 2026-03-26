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

/** Format block height as a locale date-time string */
export function formatBlockDateTime(blockHeight: bigint, locale = 'en-US'): string {
  return blockHeightToDate(blockHeight).toLocaleString(locale);
}

/** Compute expiry block height from current + duration in blocks */
export function computeExpiryBlock(currentBlock: bigint, durationBlocks: bigint): bigint {
  return currentBlock + durationBlocks;
}

/** Check if a message has expired given current block */
export function isExpired(expiryBlock: bigint, currentBlock: bigint): boolean {
  return currentBlock >= expiryBlock;
}

/** Blocks remaining until expiry */
export function blocksUntilExpiry(expiryBlock: bigint, currentBlock: bigint): bigint {
  if (isExpired(expiryBlock, currentBlock)) return 0n;
  return expiryBlock - currentBlock;
}

/** Convert block duration to approximate seconds */
export function blockDurationToSeconds(blocks: bigint): number {
  return Number(blocks) * AVERAGE_BLOCK_TIME_SECONDS;
}

/** Convert seconds to approximate block count */
export function secondsToBlocks(seconds: number): bigint {
  return BigInt(Math.ceil(seconds / AVERAGE_BLOCK_TIME_SECONDS));
}

/** Human-readable duration from block count */
export function blockDurationToHuman(blocks: bigint): string {
  const secs = blockDurationToSeconds(blocks);
  if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
  if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
  return `${Math.round(secs / 86400)} days`;
}

/** Time elapsed since message creation block */
export function blocksSinceCreation(createdAt: bigint, currentBlock: bigint): bigint {
  if (currentBlock < createdAt) return 0n;
  return currentBlock - createdAt;
}

/** Check if message was created within last N blocks */
export function isRecent(createdAt: bigint, currentBlock: bigint, withinBlocks: bigint): boolean {
  return blocksSinceCreation(createdAt, currentBlock) <= withinBlocks;
}

/** Message TTL presets in blocks */
export const TTL_ONE_DAY    = BigInt(BLOCKS_PER_DAY);
export const TTL_ONE_WEEK   = BigInt(BLOCKS_PER_WEEK);
export const TTL_ONE_MONTH  = BigInt(BLOCKS_PER_MONTH);

/** Format remaining blocks as a countdown string */
export function formatCountdown(blocks: bigint): string {
  const seconds = blockDurationToSeconds(blocks);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/** Return relative age of a message as human string */
export function messageAge(createdAt: bigint, currentBlock: bigint): string {
  const elapsed = blocksSinceCreation(createdAt, currentBlock);
  return blockDurationToHuman(elapsed) + ' ago';
}

/** Compute block range for last N days */
export function blockRangeForDays(
  currentBlock: bigint,
  days: number,
): { start: bigint; end: bigint } {
  const blocks = BigInt(days * BLOCKS_PER_DAY);
  return { start: currentBlock - blocks, end: currentBlock };
}
