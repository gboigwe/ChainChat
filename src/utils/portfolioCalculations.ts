/**
 * Portfolio Calculation Utilities
 * Mathematical functions for portfolio analytics
 */

import {
  PerformanceMetrics,
  ProfitLoss,
  RiskMetrics,
  PortfolioSnapshot,
  Transaction,
  TransactionStats,
  TransactionType,
  TransactionStatus,
  AllocationData,
} from '../types/portfolio';

/**
 * Calculate performance metrics
 */
export function calculatePerformance(
  snapshots: PortfolioSnapshot[]
): PerformanceMetrics {
  if (snapshots.length === 0) {
    return {
      change24h: 0,
      change7d: 0,
      change30d: 0,
      changeAllTime: 0,
      percentage24h: 0,
      percentage7d: 0,
      percentage30d: 0,
      percentageAllTime: 0,
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const latestValue = latest.totalValue;

  const get24hAgo = () => snapshots.find((s) => isDaysAgo(s.timestamp, 1));
  const get7dAgo = () => snapshots.find((s) => isDaysAgo(s.timestamp, 7));
  const get30dAgo = () => snapshots.find((s) => isDaysAgo(s.timestamp, 30));
  const getFirst = () => snapshots[0];

  const snapshot24h = get24hAgo() || latest;
  const snapshot7d = get7dAgo() || latest;
  const snapshot30d = get30dAgo() || latest;
  const snapshotFirst = getFirst();

  return {
    change24h: latestValue - snapshot24h.totalValue,
    change7d: latestValue - snapshot7d.totalValue,
    change30d: latestValue - snapshot30d.totalValue,
    changeAllTime: latestValue - snapshotFirst.totalValue,
    percentage24h: calculatePercentageChange(snapshot24h.totalValue, latestValue),
    percentage7d: calculatePercentageChange(snapshot7d.totalValue, latestValue),
    percentage30d: calculatePercentageChange(snapshot30d.totalValue, latestValue),
    percentageAllTime: calculatePercentageChange(snapshotFirst.totalValue, latestValue),
  };
}

/**
 * Check if timestamp is N days ago
 */
function isDaysAgo(timestamp: Date, days: number): boolean {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - days);
  const diff = Math.abs(timestamp.getTime() - targetDate.getTime());
  const hoursDiff = diff / (1000 * 60 * 60);
  return hoursDiff < 12; // Within 12 hours of target
}

/**
 * Calculate percentage change
 */
function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate profit/loss
 */
export function calculateProfitLoss(
  transactions: Transaction[],
  currentValue: number
): ProfitLoss {
  let realized = 0;
  let costBasis = 0;

  transactions.forEach((tx) => {
    if (tx.status !== TransactionStatus.SUCCESS) return;

    if (tx.type === TransactionType.RECEIVE) {
      costBasis += tx.amount;
    } else if (tx.type === TransactionType.SEND) {
      // Simplified: assume FIFO for cost basis
      realized += tx.amount;
    }
  });

  const unrealized = currentValue - costBasis;
  const total = realized + unrealized;

  return {
    realized,
    unrealized,
    total,
    byToken: new Map([['STX', total]]),
    byPeriod: [],
  };
}

/**
 * Calculate risk metrics
 */
export function calculateRiskMetrics(snapshots: PortfolioSnapshot[]): RiskMetrics {
  if (snapshots.length < 2) {
    return {
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      beta: 0,
      diversificationScore: 0,
      concentrationRisk: 0,
    };
  }

  const returns = calculateReturns(snapshots);
  const volatility = calculateVolatility(returns);
  const sharpeRatio = calculateSharpeRatio(returns, volatility);
  const { maxDrawdown, currentDrawdown } = calculateDrawdown(snapshots);

  return {
    volatility,
    sharpeRatio,
    maxDrawdown,
    currentDrawdown,
    beta: 0, // Requires market data
    diversificationScore: 0.5, // Placeholder
    concentrationRisk: 1.0, // All in STX for now
  };
}

/**
 * Calculate returns from snapshots
 */
function calculateReturns(snapshots: PortfolioSnapshot[]): number[] {
  const returns: number[] = [];

  for (let i = 1; i < snapshots.length; i++) {
    const prevValue = snapshots[i - 1].totalValue;
    const currentValue = snapshots[i].totalValue;

    if (prevValue > 0) {
      returns.push((currentValue - prevValue) / prevValue);
    }
  }

  return returns;
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance) * 100; // Convert to percentage
}

/**
 * Calculate Sharpe Ratio
 */
function calculateSharpeRatio(returns: number[], volatility: number): number {
  if (volatility === 0 || returns.length === 0) return 0;

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const riskFreeRate = 0.02 / 365; // Assume 2% annual risk-free rate

  return ((meanReturn - riskFreeRate) / (volatility / 100)) * Math.sqrt(365);
}

/**
 * Calculate drawdown
 */
function calculateDrawdown(snapshots: PortfolioSnapshot[]): {
  maxDrawdown: number;
  currentDrawdown: number;
} {
  let peak = snapshots[0].totalValue;
  let maxDrawdown = 0;

  snapshots.forEach((snapshot) => {
    const value = snapshot.totalValue;

    if (value > peak) {
      peak = value;
    }

    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const currentValue = snapshots[snapshots.length - 1].totalValue;
  const currentDrawdown = peak > 0 ? ((peak - currentValue) / peak) * 100 : 0;

  return { maxDrawdown, currentDrawdown };
}

/**
 * Calculate transaction statistics
 */
export function calculateTransactionStats(
  transactions: Transaction[]
): TransactionStats {
  const successful = transactions.filter((tx) => tx.status === TransactionStatus.SUCCESS);
  const successRate = transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0;

  const totalFees = transactions.reduce((sum, tx) => sum + tx.gasFee, 0);
  const averageFee = transactions.length > 0 ? totalFees / transactions.length : 0;

  const totalAmount = successful.reduce((sum, tx) => sum + tx.amount, 0);
  const averageAmount = successful.length > 0 ? totalAmount / successful.length : 0;

  const byType = new Map<TransactionType, number>();
  Object.values(TransactionType).forEach((type) => {
    byType.set(type, transactions.filter((tx) => tx.type === type).length);
  });

  return {
    total: transactions.length,
    successRate,
    totalFees,
    averageFee,
    averageAmount,
    byType,
  };
}

/**
 * Calculate allocation breakdown
 */
export function calculateAllocation(
  balance: { stx: number; usd: number; tokens: any[] }
): AllocationData[] {
  const totalValue = balance.usd;

  const allocation: AllocationData[] = [
    {
      token: 'STX',
      value: balance.usd,
      percentage: 100,
      color: '#667eea',
    },
  ];

  // Add token allocations when token support is added
  balance.tokens.forEach((token) => {
    allocation.push({
      token: token.symbol,
      value: token.valueInUSD,
      percentage: (token.valueInUSD / totalValue) * 100,
    });
  });

  return allocation;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: 'USD' | 'STX' = 'USD'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return `${value.toFixed(2)} STX`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default {
  calculatePerformance,
  calculateProfitLoss,
  calculateRiskMetrics,
  calculateTransactionStats,
  calculateAllocation,
  formatCurrency,
  formatPercentage,
};
