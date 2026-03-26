// Price oracle hook for STX/USD and BTC/USD
import { useState, useEffect, useCallback } from 'react';
/** Price oracle state */
export interface PriceOracleState {
  stxUsd: number | null;
  btcUsd: number | null;
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}
/** Convert STX amount to USD */
export function stxToUsd(microStx: bigint, stxUsdPrice: number): number {
  const stx = Number(microStx) / 1_000_000;
  return stx * stxUsdPrice;
}
/** Format USD value */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
