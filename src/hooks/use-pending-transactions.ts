/**
 * React hook for pending mempool transactions
 * Polls the mempool for pending transactions for an address
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getHiroClient } from '../lib/hiro-api';
import { type StacksAddress, type PendingTransaction } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';

interface UsePendingTransactionsOptions {
  pollInterval?: number; // ms, default 15000
  enabled?: boolean;
}

interface UsePendingTransactionsResult {
  transactions: PendingTransaction[];
  count: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePendingTransactions(
  address: StacksAddress | string | null | undefined,
  network?: StacksNetworkName,
  options: UsePendingTransactionsOptions = {}
): UsePendingTransactionsResult {
  const { pollInterval = 15_000, enabled = true } = options;

  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPending = useCallback(async () => {
    if (!address || !enabled) return;
    setIsLoading(true);
    setError(null);

    try {
      const client = getHiroClient(network);
      const data = await client.getAddressMempoolTransactions(address);

      const pending = (data.results || []).map((tx: any) => ({
        txId: tx.tx_id,
        nonce: BigInt(tx.nonce),
        fee: BigInt(tx.fee_rate),
        senderAddress: tx.sender_address as StacksAddress,
        receiptTime: tx.receipt_time,
        txType: tx.tx_type,
      })) as PendingTransaction[];

      setTransactions(pending);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pending transactions'));
    } finally {
      setIsLoading(false);
    }
  }, [address, network, enabled]);

  useEffect(() => {
    if (!address || !enabled) return;
    fetchPending();

    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchPending, pollInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPending, pollInterval, enabled, address]);

  return {
    transactions,
    count: transactions.length,
    isLoading,
    error,
    refresh: fetchPending,
  };
}
