// Mempool monitoring hook
import { useState, useEffect, useCallback } from 'react';
/** Mempool state */
export interface MempoolState {
  pending: unknown[];
  count: number;
  loading: boolean;
  error: string | null;
}
