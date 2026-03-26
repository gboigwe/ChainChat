/**
 * React hook for monitoring transaction status
 * Polls a transaction until it is confirmed or fails
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getHiroClient } from '../lib/hiro-api';
import { type TxId, type TransactionStatus } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';
import { getTxExplorerUrl } from '../config/network-config';

interface UseTransactionStatusOptions {
  pollInterval?: number; // ms, default 10000
  maxAttempts?: number; // default 60 (10 minutes at 10s intervals)
  onSuccess?: (txId: TxId) => void;
  onFailure?: (txId: TxId, status: TransactionStatus) => void;
}

interface UseTransactionStatusResult {
  status: TransactionStatus | null;
  isLoading: boolean;
  isSuccess: boolean;
  isFailure: boolean;
  isPending: boolean;
  explorerUrl: string | null;
  error: Error | null;
  attempts: number;
}

const TERMINAL_STATUSES: TransactionStatus[] = [
  'success',
  'abort_by_response',
  'abort_by_post_condition',
  'dropped_replace_by_fee',
  'dropped_expired',
  'dropped_stale_garbage_collect',
];

const FAILURE_STATUSES: TransactionStatus[] = [
  'abort_by_response',
  'abort_by_post_condition',
  'dropped_replace_by_fee',
  'dropped_expired',
  'dropped_stale_garbage_collect',
];

export function useTransactionStatus(
  txId: TxId | string | null | undefined,
  network?: StacksNetworkName,
  options: UseTransactionStatusOptions = {}
): UseTransactionStatusResult {
  const { pollInterval = 10_000, maxAttempts = 60, onSuccess, onFailure } = options;

  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const pollStatus = useCallback(async () => {
    if (!txId) return;

    try {
      const client = getHiroClient(network);
      const currentStatus = await client.getTransactionStatus(txId);
      setStatus(currentStatus);
      attemptsRef.current++;
      setAttempts(attemptsRef.current);

      const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
      const isFailure = FAILURE_STATUSES.includes(currentStatus);

      if (isTerminal) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (currentStatus === 'success') {
          onSuccess?.(txId as TxId);
        } else if (isFailure) {
          onFailure?.(txId as TxId, currentStatus);
        }
      }

      if (attemptsRef.current >= maxAttempts && !isTerminal) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setError(new Error(`Transaction monitoring timed out after ${maxAttempts} attempts`));
      }
    } catch (err) {
      // Transaction may not be indexed yet, keep polling
    } finally {
      setIsLoading(false);
    }
  }, [txId, network, maxAttempts, onSuccess, onFailure]);

  useEffect(() => {
    if (!txId) return;
    setIsLoading(true);
    attemptsRef.current = 0;
    setAttempts(0);
    setStatus(null);
    setError(null);

    pollStatus();
    intervalRef.current = setInterval(pollStatus, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [txId, pollInterval]);

  const currentStatus = status;
  const isTerminal = currentStatus !== null && TERMINAL_STATUSES.includes(currentStatus);

  return {
    status,
    isLoading: isLoading && !isTerminal,
    isSuccess: status === 'success',
    isFailure: status !== null && FAILURE_STATUSES.includes(status),
    isPending: status === 'pending' || status === null,
    explorerUrl: txId ? getTxExplorerUrl(txId.toString(), network ?? 'mainnet') : null,
    error,
    attempts,
  };
}
