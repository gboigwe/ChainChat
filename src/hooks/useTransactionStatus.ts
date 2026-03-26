// Transaction status polling hook
import { useState, useEffect, useCallback } from 'react';
/** Transaction status state */
export interface TxStatusState {
  status: string | null;
  confirmations: number;
  isFinalized: boolean;
  blockHeight: number | null;
  isFailed: boolean;
  loading: boolean;
}
/** Poll transaction status until finalized */
export function useTransactionStatus(
  txId: string | null,
  apiUrl = 'https://api.hiro.so',
  pollInterval = 5000,
): TxStatusState {
  const [status, setStatus] = useState<string | null>(null);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const poll = useCallback(async () => {
    if (!txId || isFinalized) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
      const data = await res.json();
      setStatus(data.tx_status);
      setBlockHeight(data.block_height ?? null);
      if (data.tx_status !== 'pending') setIsFinalized(true);
    } catch { } finally { setLoading(false); }
  }, [txId, apiUrl, isFinalized]);
  useEffect(() => {
    if (!txId || isFinalized) return;
    void poll();
    const id = setInterval(() => void poll(), pollInterval);
    return () => clearInterval(id);
  }, [txId, isFinalized, poll, pollInterval]);
  return {
    status,
    confirmations: 0,
    isFinalized,
    blockHeight,
    isFailed: status === 'abort_by_response' || status === 'abort_by_post_condition',
    loading,
  };
}
export const TX_STATUS_1 = 1;
export const TX_STATUS_2 = 2;
export const TX_STATUS_3 = 3;
export const TX_STATUS_4 = 4;
export const TX_STATUS_5 = 5;
export const TX_STATUS_6 = 6;
export const TX_STATUS_7 = 7;
export const TX_STATUS_8 = 8;
export const TX_STATUS_9 = 9;
export const TX_STATUS_10 = 10;
export const TX_STATUS_11 = 11;
export const TX_STATUS_12 = 12;
export const TX_STATUS_13 = 13;
export const TX_STATUS_14 = 14;
export const TX_STATUS_15 = 15;
export const TX_STATUS_16 = 16;
export const TX_STATUS_17 = 17;
export const TX_STATUS_18 = 18;
export const TX_STATUS_19 = 19;
export const TX_STATUS_20 = 20;
export const TX_STATUS_21 = 21;
export const TX_STATUS_22 = 22;
export const TX_STATUS_23 = 23;
export const TX_STATUS_24 = 24;
