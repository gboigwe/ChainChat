/**
 * Portfolio Service
 * Handles blockchain data fetching and portfolio management
 */

import {
  PortfolioBalance,
  Transaction,
  TransactionType,
  TransactionStatus,
  PortfolioSnapshot,
  TransactionFilter,
} from '../types/portfolio';

const STACKS_API_URL = 'https://api.mainnet.hiro.so';
const PRICE_API_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetch STX balance for address
 */
export async function fetchSTXBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/balances`);

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }

    const data = await response.json();
    return parseInt(data.stx.balance) / 1000000; // Convert from micro-STX
  } catch (error) {
    console.error('Error fetching STX balance:', error);
    throw error;
  }
}

/**
 * Fetch STX price in USD
 */
export async function fetchSTXPrice(): Promise<number> {
  try {
    const response = await fetch(`${PRICE_API_URL}/simple/price?ids=blockstack&vs_currencies=usd`);

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    return data.blockstack?.usd || 0;
  } catch (error) {
    console.error('Error fetching STX price:', error);
    return 0;
  }
}

/**
 * Fetch portfolio balance
 */
export async function fetchPortfolioBalance(address: string): Promise<PortfolioBalance> {
  try {
    const [stxBalance, stxPrice] = await Promise.all([
      fetchSTXBalance(address),
      fetchSTXPrice(),
    ]);

    return {
      stx: stxBalance,
      usd: stxBalance * stxPrice,
      tokens: [], // TODO: Fetch token balances
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching portfolio balance:', error);
    throw error;
  }
}

/**
 * Fetch transactions for address
 */
export async function fetchTransactions(
  address: string,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `${STACKS_API_URL}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data = await response.json();

    return data.results.map((tx: any) => parseTransaction(tx, address));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Parse raw transaction data
 */
function parseTransaction(rawTx: any, userAddress: string): Transaction {
  const type = determineTransactionType(rawTx, userAddress);
  const status = mapTransactionStatus(rawTx.tx_status);

  return {
    id: rawTx.tx_id,
    txId: rawTx.tx_id,
    type,
    status,
    amount: parseTransactionAmount(rawTx),
    token: 'STX',
    timestamp: new Date(rawTx.burn_block_time_iso || rawTx.receipt_time_iso),
    gasFee: parseInt(rawTx.fee_rate || '0') / 1000000,
    blockHeight: rawTx.block_height || 0,
    sender: rawTx.sender_address,
    recipient: rawTx.token_transfer?.recipient_address,
    memo: rawTx.token_transfer?.memo,
  };
}

/**
 * Determine transaction type
 */
function determineTransactionType(tx: any, userAddress: string): TransactionType {
  if (tx.tx_type === 'token_transfer') {
    return tx.sender_address === userAddress
      ? TransactionType.SEND
      : TransactionType.RECEIVE;
  }

  if (tx.tx_type === 'contract_call') {
    return TransactionType.CONTRACT_CALL;
  }

  if (tx.tx_type === 'smart_contract') {
    return TransactionType.CONTRACT_DEPLOY;
  }

  return TransactionType.CONTRACT_CALL;
}

/**
 * Map transaction status
 */
function mapTransactionStatus(status: string): TransactionStatus {
  switch (status) {
    case 'success':
      return TransactionStatus.SUCCESS;
    case 'abort_by_response':
    case 'abort_by_post_condition':
      return TransactionStatus.FAILED;
    case 'pending':
      return TransactionStatus.PENDING;
    default:
      return TransactionStatus.FAILED;
  }
}

/**
 * Parse transaction amount
 */
function parseTransactionAmount(tx: any): number {
  if (tx.token_transfer?.amount) {
    return parseInt(tx.token_transfer.amount) / 1000000;
  }

  if (tx.stx_sent) {
    return parseInt(tx.stx_sent) / 1000000;
  }

  return 0;
}

/**
 * Filter transactions
 */
export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter
): Transaction[] {
  return transactions.filter((tx) => {
    if (filter.type && !filter.type.includes(tx.type)) {
      return false;
    }

    if (filter.status && !filter.status.includes(tx.status)) {
      return false;
    }

    if (filter.startDate && tx.timestamp < filter.startDate) {
      return false;
    }

    if (filter.endDate && tx.timestamp > filter.endDate) {
      return false;
    }

    if (filter.minAmount !== undefined && tx.amount < filter.minAmount) {
      return false;
    }

    if (filter.maxAmount !== undefined && tx.amount > filter.maxAmount) {
      return false;
    }

    if (filter.token && !filter.token.includes(tx.token)) {
      return false;
    }

    return true;
  });
}

/**
 * Fetch portfolio snapshots
 */
export async function fetchPortfolioSnapshots(
  address: string,
  days: number = 30
): Promise<PortfolioSnapshot[]> {
  // For now, return mock data
  // In production, this would fetch historical snapshots from a database
  const snapshots: PortfolioSnapshot[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const balance = await fetchPortfolioBalance(address).catch(() => null);

    if (balance) {
      snapshots.push({
        timestamp: date,
        totalValue: balance.usd,
        balances: balance,
        performance: {
          change24h: 0,
          change7d: 0,
          change30d: 0,
          changeAllTime: 0,
          percentage24h: 0,
          percentage7d: 0,
          percentage30d: 0,
          percentageAllTime: 0,
        },
      });
    }
  }

  return snapshots;
}

/**
 * Cache key generator
 */
export function getCacheKey(type: string, ...params: any[]): string {
  return `portfolio:${type}:${params.join(':')}`;
}

export default {
  fetchSTXBalance,
  fetchSTXPrice,
  fetchPortfolioBalance,
  fetchTransactions,
  filterTransactions,
  fetchPortfolioSnapshots,
  getCacheKey,
};
