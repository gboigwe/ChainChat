/**
 * CSV Export Utilities
 * Functions for exporting portfolio data to CSV
 */

import { Transaction, PortfolioSnapshot, ProfitLoss } from '../types/portfolio';

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(transactions: Transaction[], filename?: string): void {
  const headers = ['Date', 'Type', 'Amount', 'Token', 'Fee (STX)', 'Status', 'TX ID', 'Sender', 'Recipient'];

  const rows = transactions.map((tx) => [
    tx.timestamp.toISOString(),
    tx.type,
    tx.amount.toString(),
    tx.token,
    tx.gasFee.toString(),
    tx.status,
    tx.txId,
    tx.sender || '',
    tx.recipient || '',
  ]);

  downloadCSV([headers, ...rows], filename || `transactions-${Date.now()}.csv`);
}

/**
 * Export portfolio snapshots to CSV
 */
export function exportSnapshotsToCSV(snapshots: PortfolioSnapshot[], filename?: string): void {
  const headers = ['Timestamp', 'Total Value (USD)', 'STX Balance', '24h Change', '7d Change', '30d Change'];

  const rows = snapshots.map((snapshot) => [
    snapshot.timestamp.toISOString(),
    snapshot.totalValue.toString(),
    snapshot.balances.stx.toString(),
    snapshot.performance.change24h.toString(),
    snapshot.performance.change7d.toString(),
    snapshot.performance.change30d.toString(),
  ]);

  downloadCSV([headers, ...rows], filename || `portfolio-history-${Date.now()}.csv`);
}

/**
 * Export profit/loss summary to CSV
 */
export function exportProfitLossToCSV(profitLoss: ProfitLoss, filename?: string): void {
  const headers = ['Metric', 'Value'];

  const rows = [
    ['Realized P/L', profitLoss.realized.toString()],
    ['Unrealized P/L', profitLoss.unrealized.toString()],
    ['Total P/L', profitLoss.total.toString()],
  ];

  // Add by-token breakdown
  profitLoss.byToken.forEach((value, token) => {
    rows.push([`${token} P/L`, value.toString()]);
  });

  downloadCSV([headers, ...rows], filename || `profit-loss-${Date.now()}.csv`);
}

/**
 * Download CSV file
 */
function downloadCSV(data: string[][], filename: string): void {
  const csvContent = data.map((row) => row.map(escapeCSVValue).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Escape CSV value
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default {
  exportTransactionsToCSV,
  exportSnapshotsToCSV,
  exportProfitLossToCSV,
};
