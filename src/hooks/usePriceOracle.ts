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
