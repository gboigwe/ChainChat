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
