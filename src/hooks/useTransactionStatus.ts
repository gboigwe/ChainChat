// Transaction status polling hook
import { useState, useEffect, useCallback } from 'react';
/** Transaction status state */
export interface TxStatusState {
  status: string | null;
  confirmations: number;
  isFinalized: boolean;
  blockHeight: number | null;
  isFailed: boolean;
  loading: boolean;
}
