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
  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/extended/v1/tx/mempool?sender_address=${address}&limit=50`);
      const data = await res.json();
      setPending(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch mempool');
    } finally { setLoading(false); }
  }, [address, apiUrl]);
  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), refreshInterval);
    return () => clearInterval(id);
  }, [refresh, refreshInterval]);
  const hasTx = (txId: string) => pending.some((tx: any) => tx.tx_id === txId);
  return { pending, count: pending.length, loading, error, hasTx, refresh };
}
