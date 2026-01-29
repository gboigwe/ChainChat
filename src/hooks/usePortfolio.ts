/**
 * usePortfolio Hook
 * React hook for portfolio data management
 */

import { useState, useEffect, useCallback } from 'react';
import { PortfolioState } from '../types/portfolio';
import * as portfolioService from '../services/portfolioService';
import {
  calculatePerformance,
  calculateProfitLoss,
  calculateRiskMetrics,
  calculateAllocation,
} from '../utils/portfolioCalculations';

export function usePortfolio(address: string | null) {
  const [state, setState] = useState<PortfolioState>({
    balance: null,
    performance: null,
    profitLoss: null,
    riskMetrics: null,
    transactions: [],
    snapshots: [],
    isLoading: false,
    error: null,
    lastUpdate: null,
  });

  const fetchPortfolioData = useCallback(async () => {
    if (!address) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [balance, transactions, snapshots] = await Promise.all([
        portfolioService.fetchPortfolioBalance(address),
        portfolioService.fetchTransactions(address, 50),
        portfolioService.fetchPortfolioSnapshots(address, 30),
      ]);

      const performance = calculatePerformance(snapshots);
      const profitLoss = calculateProfitLoss(transactions, balance.usd);
      const riskMetrics = calculateRiskMetrics(snapshots);

      setState({
        balance,
        performance,
        profitLoss,
        riskMetrics,
        transactions,
        snapshots,
        isLoading: false,
        error: null,
        lastUpdate: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [address]);

  useEffect(() => {
    fetchPortfolioData();

    const interval = setInterval(fetchPortfolioData, 60000);
    return () => clearInterval(interval);
  }, [fetchPortfolioData]);

  const refresh = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const allocation = state.balance ? calculateAllocation(state.balance) : [];

  return {
    ...state,
    allocation,
    refresh,
  };
}

export default usePortfolio;
