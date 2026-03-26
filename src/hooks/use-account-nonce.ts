/**
 * React hook for account nonce tracking
 * Fetches and caches the current nonce for a Stacks address
 */

import { useState, useEffect, useCallback } from 'react';
import { getHiroClient } from '../lib/hiro-api';
import { type StacksAddress } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';

interface UseAccountNonceResult {
  nonce: bigint | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAccountNonce(
  address: StacksAddress | string | null | undefined,
  network?: StacksNetworkName
): UseAccountNonceResult {
  const [nonce, setNonce] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNonce = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);

    try {
      const client = getHiroClient(network);
      const n = await client.getAccountNonce(address);
      setNonce(n);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch nonce'));
    } finally {
      setIsLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    fetchNonce();
  }, [fetchNonce]);

  return { nonce, isLoading, error, refresh: fetchNonce };
}
