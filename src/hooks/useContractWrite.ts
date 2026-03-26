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
/** Write hook options */
export interface UseContractWriteOptions {
  onSuccess?: (txId: string) => void;
  onError?: (error: string) => void;
}
/** Return type of useContractWrite */
export type UseContractWriteReturn = UseContractWriteState & {
  execute: (options: unknown) => Promise<void>;
  reset: () => void;
};
/** Generic contract write hook */
export function useContractWrite(hookOptions?: UseContractWriteOptions): UseContractWriteReturn {
  const [txId, setTxId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
