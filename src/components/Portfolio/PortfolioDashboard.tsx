/**
 * Portfolio Dashboard Component
 * Main dashboard integrating all portfolio components
 */

import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { usePortfolio } from '../../hooks/usePortfolio';
import PortfolioOverview from './PortfolioOverview';
import PerformanceChart from './PerformanceChart';
import ProfitLossAnalytics from './ProfitLossAnalytics';
import RiskMetrics from './RiskMetrics';
import TransactionHistory from './TransactionHistory';
import AllocationChart from './AllocationChart';

const PortfolioDashboard: React.FC = () => {
  const { address, isConnected } = useWallet();

  const {
    balance,
    performance,
    profitLoss,
    riskMetrics,
    transactions,
    snapshots,
    allocation,
    isLoading,
    error,
    refresh,
  } = usePortfolio(address);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const csvContent = [
      ['Date', 'Type', 'Amount', 'Token', 'Fee', 'Status', 'TX ID'].join(','),
      ...transactions.map((tx) =>
        [
          tx.timestamp.toISOString(),
          tx.type,
          tx.amount,
          tx.token,
          tx.gasFee,
          tx.status,
          tx.txId,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-${address}-${Date.now()}.csv`;
    link.click();
  };

  if (!isConnected) {
    return (
      <div className="portfolio-dashboard empty">
        <div className="empty-state">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view portfolio analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-dashboard error">
        <div className="error-state">
          <h2>Error Loading Portfolio</h2>
          <p>{error.message}</p>
          <button onClick={refresh}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Portfolio Analytics</h1>
        <button className="refresh-button" onClick={refresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="grid-section full-width">
          <PortfolioOverview
            balance={balance}
            performance={performance}
            isLoading={isLoading}
          />
        </div>

        <div className="grid-section full-width">
          <PerformanceChart snapshots={snapshots} isLoading={isLoading} />
        </div>

        <div className="grid-section half-width">
          <ProfitLossAnalytics profitLoss={profitLoss} isLoading={isLoading} />
        </div>

        <div className="grid-section half-width">
          <AllocationChart allocation={allocation} isLoading={isLoading} />
        </div>

        <div className="grid-section full-width">
          <RiskMetrics riskMetrics={riskMetrics} isLoading={isLoading} />
        </div>

        <div className="grid-section full-width">
          <TransactionHistory
            transactions={transactions}
            isLoading={isLoading}
            onExport={handleExportCSV}
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
