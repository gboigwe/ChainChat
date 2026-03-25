/**
 * General Stacks utility functions
 * Format addresses, amounts, dates, and other common operations
 */

import { type StacksAddress, type MicroStx, type TxId, type UnixTimestamp } from '../types/stacks';

// ─── Address Utils ─────────────────────────────────────────────────────────────

/**
 * Shorten a Stacks address for display (SP1abc...xyz)
 */
export function shortenAddress(address: StacksAddress | string, chars = 6): string {
  const addr = address.toString();
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

/**
 * Check if two addresses are equal (case-insensitive)
 */
export function addressesEqual(a: string, b: string): boolean {
  return a.toUpperCase() === b.toUpperCase();
}

/**
 * Determine if an address is a contract principal
 */
export function isContractPrincipal(address: string): boolean {
  return address.includes('.');
}

// ─── Amount Utils ─────────────────────────────────────────────────────────────

/**
 * Format micro-STX as a readable STX amount
 */
export function formatMicroStx(amount: MicroStx | bigint, decimals = 6): string {
  const stx = Number(amount) / 1_000_000;
  return `${stx.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} STX`;
}

/**
 * Format a token amount with configurable decimals
 */
export function formatTokenAmount(amount: bigint, decimals = 6, symbol = ''): string {
  const divisor = 10 ** decimals;
  const value = Number(amount) / divisor;
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Parse a human-readable STX amount to micro-STX
 */
export function parseStxAmount(stx: string | number): MicroStx {
  const n = typeof stx === 'string' ? parseFloat(stx.replace(/,/g, '')) : stx;
  if (isNaN(n) || n < 0) throw new Error(`Invalid STX amount: ${stx}`);
  return BigInt(Math.round(n * 1_000_000)) as MicroStx;
}

// ─── Date/Time Utils ──────────────────────────────────────────────────────────

/**
 * Format a Unix timestamp as a localized date string
 */
export function formatTimestamp(ts: UnixTimestamp | number, options?: Intl.DateTimeFormatOptions): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get a human-readable relative time string ("2 hours ago")
 */
export function timeAgo(ts: UnixTimestamp | number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatTimestamp(ts as UnixTimestamp, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── TxId Utils ───────────────────────────────────────────────────────────────

/**
 * Shorten a transaction ID for display
 */
export function shortenTxId(txId: TxId | string, chars = 8): string {
  const id = txId.toString().replace(/^0x/, '');
  return `${id.slice(0, chars)}...${id.slice(-chars)}`;
}

/**
 * Normalize a txId to include 0x prefix
 */
export function normalizeTxId(txId: string): string {
  return txId.startsWith('0x') ? txId : `0x${txId}`;
}

// ─── Clarity Value Utils ──────────────────────────────────────────────────────

/**
 * Extract the unwrapped value from a Clarity (ok ...) or (some ...) response
 */
export function unwrapClarityValue(cv: any): any {
  if (cv && typeof cv === 'object') {
    if ('success' in cv && 'value' in cv) return unwrapClarityValue(cv.value);
    if ('type' in cv && cv.type === 'ok') return unwrapClarityValue(cv.value);
    if ('type' in cv && cv.type === 'some') return unwrapClarityValue(cv.value);
  }
  return cv;
}
