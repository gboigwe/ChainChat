// Generic read-only contract call hook
import { useState, useCallback } from 'react';
/** Options for useReadOnly hook */
export interface UseReadOnlyOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: unknown[];
  sender?: string;
  apiUrl?: string;
}
/** State returned by useReadOnly */
export interface UseReadOnlyState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
/** Return type of useReadOnly */
export type UseReadOnlyReturn<T> = UseReadOnlyState<T> & {
  call: () => Promise<void>;
  refetch: () => Promise<void>;
};
/** Generic read-only contract call hook */
export function useReadOnly<T = unknown>(options: UseReadOnlyOptions): UseReadOnlyReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
