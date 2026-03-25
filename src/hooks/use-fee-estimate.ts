/**
 * React hook for fetching fee estimates for Stacks transactions
 * Returns tiered fee options (slow / normal / fast / urgent)
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchFeeEstimates, type FeeEstimates, type FeeMultiplier } from '../lib/fee-estimator';
import { type StacksNetworkName } from '../config/network-config';

interface UseFeeEstimateOptions {
  /** Byte size of the serialized transaction (approximate) */
  estimatedBytes?: number;
  network?: StacksNetworkName;
  /** Refresh fee estimate every N ms (default: 30_000) */
  refreshIntervalMs?: number;
}

interface UseFeeEstimateResult {
  fees: FeeEstimates | null;
  recommended: bigint | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get current Stacks transaction fee estimates
 *
 * @example
 * const { fees, recommended } = useFeeEstimate({ estimatedBytes: 256 });
 * console.log('Suggested fee (normal):', recommended);
 */
export function useFeeEstimate(opts: UseFeeEstimateOptions = {}): UseFeeEstimateResult {
  const {
    estimatedBytes = 256,
    network,
    refreshIntervalMs = 30_000,
  } = opts;

  const [fees, setFees] = useState<FeeEstimates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const estimates = await fetchFeeEstimates(estimatedBytes, network);
      setFees(estimates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch fee estimates'));
    } finally {
      setIsLoading(false);
    }
  }, [estimatedBytes, network]);

  useEffect(() => {
    refresh();
    if (refreshIntervalMs > 0) {
      const id = setInterval(refresh, refreshIntervalMs);
      return () => clearInterval(id);
    }
  }, [refresh, refreshIntervalMs]);

  const recommended = fees ? fees.normal : null;

  return { fees, recommended, isLoading, error, refresh };
}

/**
 * Get a specific fee tier from fee estimates
 */
export function getFeeForTier(fees: FeeEstimates | null, tier: FeeMultiplier): bigint | null {
  if (!fees) return null;
  return fees[tier] ?? fees.normal;
}
