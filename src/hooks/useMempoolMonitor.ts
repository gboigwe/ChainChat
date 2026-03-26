// Mempool monitoring hook
import { useState, useEffect, useCallback } from 'react';
/** Mempool state */
export interface MempoolState {
  pending: unknown[];
  count: number;
  loading: boolean;
  error: string | null;
}
/** Monitor pending transactions for address */
export function useMempoolMonitor(
  address: string | null,
  apiUrl = 'https://api.hiro.so',
  refreshInterval = 15000,
): MempoolState & { hasTx: (txId: string) => boolean; refresh: () => void } {
  const [pending, setPending] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
