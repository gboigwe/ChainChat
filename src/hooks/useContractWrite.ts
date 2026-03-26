// Generic contract write hook
import { useState, useCallback } from 'react';
/** Write hook state */
export interface UseContractWriteState {
  txId: string | null;
  txStatus: string | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}
