/**
 * Transaction monitor for watching multiple transactions simultaneously
 * Manages a queue of pending transactions and emits status updates
 */

import { getHiroClient } from './hiro-api';
import { type TxId, type TransactionStatus } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';

export type TransactionMonitorCallback = (
  txId: TxId,
  status: TransactionStatus,
  data: any
) => void;

interface MonitoredTransaction {
  txId: TxId;
  status: TransactionStatus | null;
  attempts: number;
  addedAt: number;
  callbacks: TransactionMonitorCallback[];
}

const TERMINAL_STATUSES: TransactionStatus[] = [
  'success',
  'abort_by_response',
  'abort_by_post_condition',
  'dropped_replace_by_fee',
  'dropped_expired',
  'dropped_stale_garbage_collect',
];

export class TransactionMonitor {
  private transactions = new Map<string, MonitoredTransaction>();
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private network?: StacksNetworkName;
  private readonly pollIntervalMs: number;
  private readonly maxAttempts: number;

  constructor(
    network?: StacksNetworkName,
    pollIntervalMs = 10_000,
    maxAttempts = 60
  ) {
    this.network = network;
    this.pollIntervalMs = pollIntervalMs;
    this.maxAttempts = maxAttempts;
  }

  /**
   * Start monitoring a transaction
   */
  watch(txId: TxId | string, callback?: TransactionMonitorCallback): void {
    const id = txId.toString();

    if (this.transactions.has(id)) {
      if (callback) {
        this.transactions.get(id)!.callbacks.push(callback);
      }
      return;
    }

    this.transactions.set(id, {
      txId: id as TxId,
      status: null,
      attempts: 0,
      addedAt: Date.now(),
      callbacks: callback ? [callback] : [],
    });

    this.ensurePolling();
  }

  /**
   * Stop monitoring a transaction
   */
  unwatch(txId: TxId | string): void {
    this.transactions.delete(txId.toString());
    if (this.transactions.size === 0) this.stopPolling();
  }

  /**
   * Get current status of a monitored transaction
   */
  getStatus(txId: TxId | string): TransactionStatus | null {
    return this.transactions.get(txId.toString())?.status ?? null;
  }

  /**
   * Get all monitored transaction IDs
   */
  getWatchedTxIds(): TxId[] {
    return Array.from(this.transactions.keys()) as TxId[];
  }

  /**
   * Poll all pending transactions
   */
  private async pollAll(): Promise<void> {
    const client = getHiroClient(this.network);

    const promises = Array.from(this.transactions.entries()).map(
      async ([id, tx]) => {
        if (tx.status !== null && TERMINAL_STATUSES.includes(tx.status)) return;
        if (tx.attempts >= this.maxAttempts) {
          this.unwatch(id);
          return;
        }

        try {
          const data = await client.getTransaction(id);
          const newStatus = data.tx_status as TransactionStatus;
          tx.status = newStatus;
          tx.attempts++;

          tx.callbacks.forEach((cb) => cb(id as TxId, newStatus, data));

          if (TERMINAL_STATUSES.includes(newStatus)) {
            this.unwatch(id);
          }
        } catch {
          tx.attempts++;
        }
      }
    );

    await Promise.allSettled(promises);
  }

  private ensurePolling(): void {
    if (this.pollInterval !== null) return;
    this.pollInterval = setInterval(() => this.pollAll(), this.pollIntervalMs);
    // Run immediately
    this.pollAll();
  }

  private stopPolling(): void {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Stop all polling and clear state
   */
  destroy(): void {
    this.stopPolling();
    this.transactions.clear();
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _monitor: TransactionMonitor | null = null;

export function getTransactionMonitor(network?: StacksNetworkName): TransactionMonitor {
  if (!_monitor) {
    _monitor = new TransactionMonitor(network);
  }
  return _monitor;
}
