/**
 * React hook for calling read-only contract functions
 * Generic hook that returns typed results with loading/error state
 */

import { useState, useEffect, useCallback } from 'react';
import { callReadOnly, type ReadOnlyCallOptions } from '../lib/contract-caller';

interface UseReadOnlyOptions<T> {
  transform?: (raw: any) => T;
  enabled?: boolean;
  deps?: any[];
}

interface UseReadOnlyResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Generic hook for read-only contract calls
 *
 * @example
 * const { data, isLoading } = useReadOnly<string>({
 *   contractId: 'SP...',
 *   functionName: 'get-contract-version',
 * });
 */
export function useReadOnly<T = unknown>(
  callOptions: ReadOnlyCallOptions | null,
  hookOptions: UseReadOnlyOptions<T> = {}
): UseReadOnlyResult<T> {
  const { transform, enabled = true, deps = [] } = hookOptions;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!callOptions || !enabled) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await callReadOnly<T>(callOptions);

      if (!result.success) {
        throw new Error(`Contract call failed for ${callOptions.functionName}`);
      }

      const value = transform ? transform(result.value) : (result.value as T);
      setData(value);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Contract call failed'));
    } finally {
      setIsLoading(false);
    }
  }, [callOptions?.contractId, callOptions?.functionName, enabled, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

/**
 * Hook for getting a contract version
 */
export function useContractVersion(
  contractId: string | null | undefined,
  network?: string
): UseReadOnlyResult<string> {
  return useReadOnly<string>(
    contractId
      ? {
          contractId: contractId as any,
          functionName: 'get-contract-version',
          network: network as any,
        }
      : null,
    {
      transform: (raw: any) => raw?.value ?? raw ?? 'unknown',
    }
  );
}
