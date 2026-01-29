/**
 * Profit/Loss Analytics Component
 * Display realized and unrealized P/L
 */

import React from 'react';
import { ProfitLoss } from '../../types/portfolio';
import { formatCurrency } from '../../utils/portfolioCalculations';

interface ProfitLossAnalyticsProps {
  profitLoss: ProfitLoss | null;
  isLoading?: boolean;
}

const ProfitLossAnalytics: React.FC<ProfitLossAnalyticsProps> = ({
  profitLoss,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="profit-loss loading"><div className="skeleton-loader"></div></div>;
  }

  if (!profitLoss) {
    return <div className="profit-loss empty"><p>No P/L data</p></div>;
  }

  return (
    <div className="profit-loss-analytics">
      <h3 className="section-title">Profit & Loss</h3>
      <div className="pl-metrics">
        <div className="pl-card">
          <span className="pl-label">Realized P/L</span>
          <span className={`pl-value ${profitLoss.realized >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(profitLoss.realized)}
          </span>
        </div>
        <div className="pl-card">
          <span className="pl-label">Unrealized P/L</span>
          <span className={`pl-value ${profitLoss.unrealized >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(profitLoss.unrealized)}
          </span>
        </div>
        <div className="pl-card total">
          <span className="pl-label">Total P/L</span>
          <span className={`pl-value ${profitLoss.total >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(profitLoss.total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossAnalytics;
