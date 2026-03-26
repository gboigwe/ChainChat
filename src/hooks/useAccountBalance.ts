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
