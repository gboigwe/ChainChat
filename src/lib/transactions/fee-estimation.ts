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
/** Get fee for a tier */
export function getFeeForTier(baseFee: bigint, tier: FeeTier): bigint {
  switch (tier) {
    case 'low': return getLowPriorityFee(baseFee);
    case 'standard': return baseFee;
    case 'high': return getHighPriorityFee(baseFee);
  }
}
/** Estimate contract call fee based on arg count */
export function estimateContractCallFee(numArgs: number): bigint {
  const size = 300 + numArgs * 40;
  return estimateFee(size);
}
/** Estimate STX transfer fee */
export function estimateSTXTransferFee(memoLength = 0): bigint {
  return estimateFee(200 + memoLength);
}
/** Format fee for display */
export function formatFee(fee: bigint): string {
  const stx = fee / 1_000_000n;
  const micro = fee % 1_000_000n;
  return `${stx}.${micro.toString().padStart(6, '0')} STX`;
}
export const FEE_CONST_1 = 1n;
export const FEE_CONST_2 = 2n;
export const FEE_CONST_3 = 3n;
export const FEE_CONST_4 = 4n;
export const FEE_CONST_5 = 5n;
