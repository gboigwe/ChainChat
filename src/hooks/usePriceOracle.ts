// Price oracle hook for STX/USD and BTC/USD
import { useState, useEffect, useCallback } from 'react';
/** Price oracle state */
export interface PriceOracleState {
  stxUsd: number | null;
  btcUsd: number | null;
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}
/** Convert STX amount to USD */
export function stxToUsd(microStx: bigint, stxUsdPrice: number): number {
  const stx = Number(microStx) / 1_000_000;
  return stx * stxUsdPrice;
}
/** Format USD value */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
/** Price oracle hook */
export function usePriceOracle(refreshInterval = 60_000): PriceOracleState & { refetch: () => void } {
  const [stxUsd, setStxUsd] = useState<number | null>(null);
  const [btcUsd, setBtcUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://api.hiro.so/extended/v1/market/tokens/prices');
      const data = await res.json();
      setStxUsd(data?.['STX']?.price ?? null);
      setBtcUsd(data?.['BTC']?.price ?? null);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch prices');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void refetch();
    const id = setInterval(() => void refetch(), refreshInterval);
    return () => clearInterval(id);
  }, [refetch, refreshInterval]);
  return { stxUsd, btcUsd, loading, lastUpdated, error, refetch };
}
export const PRICE_ORACLE_1 = 1;
export const PRICE_ORACLE_2 = 2;
export const PRICE_ORACLE_3 = 3;
export const PRICE_ORACLE_4 = 4;
export const PRICE_ORACLE_5 = 5;
export const PRICE_ORACLE_6 = 6;
export const PRICE_ORACLE_7 = 7;
export const PRICE_ORACLE_8 = 8;
export const PRICE_ORACLE_9 = 9;
export const PRICE_ORACLE_10 = 10;
