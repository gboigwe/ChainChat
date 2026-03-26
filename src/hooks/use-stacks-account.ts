/**
 * React hook for Stacks account balances and info
 * Fetches STX and fungible token balances for an address
 */

import { useState, useEffect, useCallback } from 'react';
import { getHiroClient } from '../lib/hiro-api';
import { type StacksAddress, type AccountBalances, type MicroStx } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';
import { microStxToStx } from '../types/stacks';

interface UseStacksAccountResult {
  balances: AccountBalances | null;
  stxBalance: MicroStx | null;
  stxBalanceFormatted: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStacksAccount(
  address: StacksAddress | string | null | undefined,
  network?: StacksNetworkName
): UseStacksAccountResult {
  const [balances, setBalances] = useState<AccountBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);

    try {
      const client = getHiroClient(network);
      const data = await client.getAccountBalances(address);
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch account balances'));
    } finally {
      setIsLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const stxBalance = balances?.stx.balance ?? null;
  const stxBalanceFormatted = stxBalance !== null
    ? `${microStxToStx(stxBalance).toFixed(6)} STX`
    : null;

  return {
    balances,
    stxBalance,
    stxBalanceFormatted,
    isLoading,
    error,
    refresh: fetchBalances,
  };
}
