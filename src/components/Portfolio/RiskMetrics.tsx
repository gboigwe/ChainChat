/**
 * Risk Metrics Component
 * Display portfolio risk analytics
 */

import React from 'react';
import { RiskMetrics as RiskMetricsType } from '../../types/portfolio';

interface RiskMetricsProps {
  riskMetrics: RiskMetricsType | null;
  isLoading?: boolean;
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ riskMetrics, isLoading = false }) => {
  if (isLoading) {
    return <div className="risk-metrics loading"><div className="skeleton-loader"></div></div>;
  }

  if (!riskMetrics) {
    return <div className="risk-metrics empty"><p>No risk data</p></div>;
  }

  const metrics = [
    { label: 'Volatility', value: `${riskMetrics.volatility.toFixed(2)}%` },
    { label: 'Sharpe Ratio', value: riskMetrics.sharpeRatio.toFixed(2) },
    { label: 'Max Drawdown', value: `${riskMetrics.maxDrawdown.toFixed(2)}%` },
    { label: 'Current Drawdown', value: `${riskMetrics.currentDrawdown.toFixed(2)}%` },
    { label: 'Diversification', value: `${(riskMetrics.diversificationScore * 100).toFixed(0)}%` },
    { label: 'Concentration Risk', value: `${(riskMetrics.concentrationRisk * 100).toFixed(0)}%` },
  ];

  return (
    <div className="risk-metrics">
      <h3 className="section-title">Risk Metrics</h3>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-item">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskMetrics;
