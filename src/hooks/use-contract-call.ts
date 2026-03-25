/**
 * React hook for executing contract call transactions
 * Manages pending state, fee estimation, and nonce handling
 */

import { useState, useCallback } from 'react';
import { contractCall, type ContractCallOptions } from '../lib/stacks-transactions';
import { getTransactionMonitor } from '../lib/transaction-monitor';
import { type TxId, type TransactionStatus } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';

interface UseContractCallOptions {
  network?: StacksNetworkName;
  onSuccess?: (txId: TxId) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: TransactionStatus, data: any) => void;
}

interface UseContractCallResult {
  execute: (options: ContractCallOptions) => Promise<TxId | null>;
  txId: TxId | null;
  txStatus: TransactionStatus | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for submitting contract call transactions with built-in monitoring
 *
 * @example
 * const { execute, txId, isLoading } = useContractCall({
 *   onSuccess: (txId) => console.log('TX submitted:', txId),
 * });
 * await execute({ contractId, functionName, functionArgs });
 */
export function useContractCall(opts: UseContractCallOptions = {}): UseContractCallResult {
  const { network, onSuccess, onError, onStatusChange } = opts;

  const [txId, setTxId] = useState<TxId | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (callOptions: ContractCallOptions): Promise<TxId | null> => {
      setIsLoading(true);
      setError(null);
      setTxStatus(null);

      try {
        const result = await contractCall({ ...callOptions, network });

        if (!result.success || !result.txId) {
          throw new Error(result.error ?? 'Contract call failed');
        }

        const id = result.txId as TxId;
        setTxId(id);
        onSuccess?.(id);

        // Start monitoring the transaction
        const monitor = getTransactionMonitor(network);
        monitor.watch(id, (txId, status, data) => {
          setTxStatus(status);
          onStatusChange?.(status, data);
        });

        return id;
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Contract call failed');
        setError(e);
        onError?.(e);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [network, onSuccess, onError, onStatusChange]
  );

  const reset = useCallback(() => {
    setTxId(null);
    setTxStatus(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, txId, txStatus, isLoading, error, reset };
}
