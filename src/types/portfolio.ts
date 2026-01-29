/**
 * Portfolio Types and Interfaces
 * Type definitions for portfolio analytics system
 */

export interface PortfolioBalance {
  stx: number;
  usd: number;
  tokens: TokenBalance[];
  lastUpdated: Date;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  valueInSTX: number;
  valueInUSD: number;
  contractAddress?: string;
}

export interface PerformanceMetrics {
  change24h: number;
  change7d: number;
  change30d: number;
  changeAllTime: number;
  percentage24h: number;
  percentage7d: number;
  percentage30d: number;
  percentageAllTime: number;
}

export interface ProfitLoss {
  realized: number;
  unrealized: number;
  total: number;
  byToken: Map<string, number>;
  byPeriod: PeriodProfitLoss[];
}

export interface PeriodProfitLoss {
  period: string;
  profit: number;
  loss: number;
  net: number;
  startDate: Date;
  endDate: Date;
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  beta: number;
  diversificationScore: number;
  concentrationRisk: number;
}

export interface Transaction {
  id: string;
  txId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  token: string;
  timestamp: Date;
  gasFee: number;
  blockHeight: number;
  sender?: string;
  recipient?: string;
  memo?: string;
}

export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  SWAP = 'swap',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CONTRACT_CALL = 'contract_call',
  CONTRACT_DEPLOY = 'contract_deploy',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  DROPPED = 'dropped',
}

export interface PortfolioSnapshot {
  timestamp: Date;
  totalValue: number;
  balances: PortfolioBalance;
  performance: PerformanceMetrics;
}

export interface AllocationData {
  token: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface TransactionFilter {
  type?: TransactionType[];
  status?: TransactionStatus[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  token?: string[];
}

export interface TransactionStats {
  total: number;
  successRate: number;
  totalFees: number;
  averageFee: number;
  averageAmount: number;
  byType: Map<TransactionType, number>;
}

export interface PortfolioState {
  balance: PortfolioBalance | null;
  performance: PerformanceMetrics | null;
  profitLoss: ProfitLoss | null;
  riskMetrics: RiskMetrics | null;
  transactions: Transaction[];
  snapshots: PortfolioSnapshot[];
  isLoading: boolean;
  error: Error | null;
  lastUpdate: Date | null;
}

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export const TIME_RANGES: TimeRange[] = [
  { label: '24H', value: '24h', days: 1 },
  { label: '7D', value: '7d', days: 7 },
  { label: '30D', value: '30d', days: 30 },
  { label: '90D', value: '90d', days: 90 },
  { label: '1Y', value: '1y', days: 365 },
  { label: 'ALL', value: 'all', days: -1 },
];

export default {
  TransactionType,
  TransactionStatus,
  TIME_RANGES,
};
