/**
 * Portfolio Overview Component
 * Displays real-time portfolio value and performance metrics
 */

import React from 'react';
import { PortfolioBalance, PerformanceMetrics } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/portfolioCalculations';

interface PortfolioOverviewProps {
  balance: PortfolioBalance | null;
  performance: PerformanceMetrics | null;
  isLoading?: boolean;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  balance,
  performance,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="portfolio-overview loading">
        <div className="skeleton-loader"></div>
      </div>
    );
  }

  if (!balance || !performance) {
    return (
      <div className="portfolio-overview empty">
        <p>No portfolio data available</p>
      </div>
    );
  }

  const metrics = [
    {
      label: '24H',
      value: formatCurrency(performance.change24h),
      percentage: formatPercentage(performance.percentage24h),
      isPositive: performance.change24h >= 0,
    },
    {
      label: '7D',
      value: formatCurrency(performance.change7d),
      percentage: formatPercentage(performance.percentage7d),
      isPositive: performance.change7d >= 0,
    },
    {
      label: '30D',
      value: formatCurrency(performance.change30d),
      percentage: formatPercentage(performance.percentage30d),
      isPositive: performance.change30d >= 0,
    },
    {
      label: 'ALL TIME',
      value: formatCurrency(performance.changeAllTime),
      percentage: formatPercentage(performance.percentageAllTime),
      isPositive: performance.changeAllTime >= 0,
    },
  ];

  return (
    <div className="portfolio-overview">
      <div className="portfolio-header">
        <h2 className="portfolio-title">Portfolio Overview</h2>
        <p className="portfolio-subtitle">
          Last updated: {balance.lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="portfolio-value-section">
        <div className="total-value">
          <span className="value-label">Total Value</span>
          <h1 className="value-amount">{formatCurrency(balance.usd)}</h1>
          <p className="value-stx">{formatCurrency(balance.stx, 'STX')}</p>
        </div>
      </div>

      <div className="performance-metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <span className="metric-label">{metric.label}</span>
            <div className={`metric-value ${metric.isPositive ? 'positive' : 'negative'}`}>
              <span className="change-value">{metric.value}</span>
              <span className="change-percentage">{metric.percentage}</span>
            </div>
          </div>
        ))}
      </div>

      {balance.tokens.length > 0 && (
        <div className="token-balances">
          <h3 className="tokens-title">Token Balances</h3>
          <div className="tokens-list">
            {balance.tokens.map((token) => (
              <div key={token.symbol} className="token-item">
                <span className="token-symbol">{token.symbol}</span>
                <span className="token-balance">{token.balance.toFixed(2)}</span>
                <span className="token-value">{formatCurrency(token.valueInUSD)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioOverview;
