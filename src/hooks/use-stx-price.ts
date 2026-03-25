/**
 * React hook for STX price data
 * Auto-refreshes price at a configurable interval
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStxPrice, type StxPriceData } from '../lib/stx-price';

interface UseStxPriceOptions {
  refreshInterval?: number; // ms, default 60000
  enabled?: boolean;
}

interface UseStxPriceResult {
  price: StxPriceData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useStxPrice(options: UseStxPriceOptions = {}): UseStxPriceResult {
  const { refreshInterval = 60_000, enabled = true } = options;

  const [price, setPrice] = useState<StxPriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPrice = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await getStxPrice(forceRefresh);
      setPrice(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch STX price'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const refresh = useCallback(() => fetchPrice(true), [fetchPrice]);

  useEffect(() => {
    if (!enabled) return;
    fetchPrice();

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => fetchPrice(), refreshInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrice, refreshInterval, enabled]);

  return { price, isLoading, error, refresh, lastUpdated };
}
