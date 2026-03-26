// Account balance hook
import { useState, useCallback, useEffect } from 'react';
/** Account balance state */
export interface AccountBalanceState {
  balance: bigint;
  locked: bigint;
  available: bigint;
  total: bigint;
  formatted: string;
  loading: boolean;
  error: string | null;
}
