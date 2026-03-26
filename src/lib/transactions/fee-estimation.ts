// Transaction fee estimation utilities
/** Minimum fee in microSTX */
export const MINIMUM_FEE = 180n;
/** High priority fee multiplier */
export const HIGH_PRIORITY_FEE_MULTIPLIER = 2;
/** Low priority fee (50% of standard) */
export const LOW_PRIORITY_FEE_MULTIPLIER = 0.5;
/** Standard base fee rate (microSTX per byte) */
export const BASE_FEE_RATE = 1;
/** Estimate fee based on transaction size */
export function estimateFee(txSizeBytes: number, feeRate = BASE_FEE_RATE): bigint {
  const estimated = BigInt(Math.ceil(txSizeBytes * feeRate));
  return estimated > MINIMUM_FEE ? estimated : MINIMUM_FEE;
}
/** Convert fee rate to fee for given size */
export function feeRateToFee(feeRate: number, sizeBytes: number): bigint {
  return estimateFee(sizeBytes, feeRate);
}
/** Get high priority fee */
export function getHighPriorityFee(baseFee: bigint): bigint {
  return BigInt(Math.ceil(Number(baseFee) * HIGH_PRIORITY_FEE_MULTIPLIER));
}
/** Get low priority fee */
export function getLowPriorityFee(baseFee: bigint): bigint {
  const low = BigInt(Math.floor(Number(baseFee) * LOW_PRIORITY_FEE_MULTIPLIER));
  return low > MINIMUM_FEE ? low : MINIMUM_FEE;
}
/** Fee tier options */
export type FeeTier = 'low' | 'standard' | 'high';
