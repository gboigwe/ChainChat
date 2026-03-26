// Account balance hook
import { useState, useCallback, useEffect } from 'react';
/** Account balance state */
export interface AccountBalanceState {
  balance: bigint;
  locked: bigint;
  available: bigint;
  total: bigint;
  formatted: string;
  loading: boolean;
  error: string | null;
}
/** Fetch and format balance */
export function useAccountBalance(
  address: string | null,
  apiUrl = 'https://api.hiro.so',
): AccountBalanceState & { refetch: () => void } {
  const [balance, setBalance] = useState(0n);
  const [locked, setLocked] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/v2/accounts/${address}?proof=0`);
      const data = await res.json();
      setBalance(BigInt(data.balance ?? '0'));
      setLocked(BigInt(data.locked ?? '0'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [address, apiUrl]);
  useEffect(() => { void fetchBalance(); }, [fetchBalance]);
  const available = balance - locked;
  const total = balance;
  const formatted = `${(balance / 1_000_000n).toString()}.${(balance % 1_000_000n).toString().padStart(6, '0')} STX`;
  return { balance, locked, available, total, formatted, loading, error, refetch: fetchBalance };
}
export const ACCOUNT_BALANCE_1 = 1;
export const ACCOUNT_BALANCE_2 = 2;
export const ACCOUNT_BALANCE_3 = 3;
export const ACCOUNT_BALANCE_4 = 4;
export const ACCOUNT_BALANCE_5 = 5;
export const ACCOUNT_BALANCE_6 = 6;
export const ACCOUNT_BALANCE_7 = 7;
export const ACCOUNT_BALANCE_8 = 8;
export const ACCOUNT_BALANCE_9 = 9;
export const ACCOUNT_BALANCE_10 = 10;
export const ACCOUNT_BALANCE_11 = 11;
export const ACCOUNT_BALANCE_12 = 12;
export const ACCOUNT_BALANCE_13 = 13;
export const ACCOUNT_BALANCE_14 = 14;
export const ACCOUNT_BALANCE_15 = 15;
export const ACCOUNT_BALANCE_16 = 16;
export const ACCOUNT_BALANCE_17 = 17;
export const ACCOUNT_BALANCE_18 = 18;
export const ACCOUNT_BALANCE_19 = 19;
export const ACCOUNT_BALANCE_20 = 20;
export const ACCOUNT_BALANCE_21 = 21;
export const ACCOUNT_BALANCE_22 = 22;
export const ACCOUNT_BALANCE_23 = 23;
