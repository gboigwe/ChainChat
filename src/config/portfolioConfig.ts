/**
 * Portfolio Configuration
 * Constants and settings for portfolio analytics
 */

export const PORTFOLIO_CONFIG = {
  refreshInterval: 60000, // 1 minute
  snapshotRetentionDays: 90,
  transactionsPerPage: 10,
  maxTransactionsFetch: 200,
  cacheExpiry: 300000, // 5 minutes
};

export const API_ENDPOINTS = {
  stacks: 'https://api.mainnet.hiro.so',
  stacksTestnet: 'https://api.testnet.hiro.so',
  prices: 'https://api.coingecko.com/api/v3',
};

export const CHART_COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#fee140',
  '#30cfd0',
];

export const RISK_THRESHOLDS = {
  volatility: {
    low: 10,
    medium: 25,
    high: 50,
  },
  sharpeRatio: {
    poor: 0,
    acceptable: 1,
    good: 2,
    excellent: 3,
  },
  drawdown: {
    low: 10,
    medium: 25,
    high: 50,
  },
};

export const CACHE_KEYS = {
  balance: 'portfolio:balance',
  transactions: 'portfolio:transactions',
  snapshots: 'portfolio:snapshots',
  performance: 'portfolio:performance',
  price: 'portfolio:price',
};

export default {
  PORTFOLIO_CONFIG,
  API_ENDPOINTS,
  CHART_COLORS,
  RISK_THRESHOLDS,
  CACHE_KEYS,
};
