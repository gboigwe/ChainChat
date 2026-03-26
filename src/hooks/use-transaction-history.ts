/**
 * React hook for transaction history
 * Fetches paginated transaction history for a Stacks address
 */

import { useState, useEffect, useCallback } from 'react';
import { getHiroClient } from '../lib/hiro-api';
import { type StacksAddress, type TransactionSummary } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';

interface UseTransactionHistoryOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseTransactionHistoryResult {
  transactions: any[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactionHistory(
  address: StacksAddress | string | null | undefined,
  network?: StacksNetworkName,
  options: UseTransactionHistoryOptions = {}
): UseTransactionHistoryResult {
  const { limit = 20, enabled = true } = options;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(
    async (newOffset = 0, append = false) => {
      if (!address || !enabled) return;
      setIsLoading(true);
      setError(null);

      try {
        const client = getHiroClient(network);
        const data = await client.getAccountTransactions(address, {
          limit,
          offset: newOffset,
        });

        setTotal(data.total);
        setTransactions((prev) =>
          append ? [...prev, ...data.results] : data.results
        );
        setOffset(newOffset + data.results.length);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch transaction history')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [address, network, limit, enabled]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || transactions.length >= total) return;
    await fetchHistory(offset, true);
  }, [fetchHistory, isLoading, offset, transactions.length, total]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setTransactions([]);
    await fetchHistory(0, false);
  }, [fetchHistory]);

  useEffect(() => {
    if (!address || !enabled) return;
    fetchHistory(0);
  }, [address, network, enabled]);

  return {
    transactions,
    total,
    isLoading,
    error,
    hasMore: transactions.length < total,
    loadMore,
    refresh,
  };
}
