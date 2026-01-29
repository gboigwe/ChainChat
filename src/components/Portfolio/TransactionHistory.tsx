/**
 * Transaction History Component
 * Filterable transaction log with export
 */

import React, { useState } from 'react';
import { Transaction, TransactionFilter, TransactionType, TransactionStatus } from '../../types/portfolio';
import { formatCurrency } from '../../utils/portfolioCalculations';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onExport?: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading = false,
  onExport,
}) => {
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (isLoading) {
    return <div className="transaction-history loading"><div className="skeleton-loader"></div></div>;
  }

  const filteredTxs = applyFilter(transactions, filter);
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const displayedTxs = filteredTxs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h3 className="section-title">Transaction History</h3>
        {onExport && (
          <button className="export-button" onClick={onExport}>
            Export CSV
          </button>
        )}
      </div>

      <div className="filter-bar">
        <select
          value={filter.type?.[0] || ''}
          onChange={(e) =>
            setFilter({ ...filter, type: e.target.value ? [e.target.value as TransactionType] : undefined })
          }
        >
          <option value="">All Types</option>
          {Object.values(TransactionType).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filter.status?.[0] || ''}
          onChange={(e) =>
            setFilter({ ...filter, status: e.target.value ? [e.target.value as TransactionStatus] : undefined })
          }
        >
          <option value="">All Status</option>
          {Object.values(TransactionStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Status</th>
              <th>TX ID</th>
            </tr>
          </thead>
          <tbody>
            {displayedTxs.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.timestamp.toLocaleDateString()}</td>
                <td><span className={`tx-type ${tx.type}`}>{tx.type}</span></td>
                <td>{formatCurrency(tx.amount, 'STX')}</td>
                <td>{tx.gasFee.toFixed(6)} STX</td>
                <td><span className={`tx-status ${tx.status}`}>{tx.status}</span></td>
                <td className="tx-id">{tx.txId.slice(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

function applyFilter(transactions: Transaction[], filter: TransactionFilter): Transaction[] {
  return transactions.filter((tx) => {
    if (filter.type && !filter.type.includes(tx.type)) return false;
    if (filter.status && !filter.status.includes(tx.status)) return false;
    return true;
  });
}

export default TransactionHistory;
