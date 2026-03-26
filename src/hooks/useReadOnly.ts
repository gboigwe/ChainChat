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
  const call = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = options.apiUrl ?? 'https://api.hiro.so';
      const url = `${apiUrl}/v2/contracts/call-read/${options.contractAddress}/${options.contractName}/${options.functionName}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: options.sender ?? options.contractAddress, arguments: options.functionArgs ?? [] }),
      });
      const json = await res.json();
      if (json.okay) setData(json.result as T);
      else setError(json.cause ?? 'Call failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options]);
  return { data, loading, error, call, refetch: call };
}
export const READ_ONLY_1 = 1;
export const READ_ONLY_2 = 2;
export const READ_ONLY_3 = 3;
export const READ_ONLY_4 = 4;
export const READ_ONLY_5 = 5;
export const READ_ONLY_6 = 6;
export const READ_ONLY_7 = 7;
export const READ_ONLY_8 = 8;
export const READ_ONLY_9 = 9;
export const READ_ONLY_10 = 10;
export const READ_ONLY_11 = 11;
export const READ_ONLY_12 = 12;
export const READ_ONLY_13 = 13;
export const READ_ONLY_14 = 14;
export const READ_ONLY_15 = 15;
export const READ_ONLY_16 = 16;
export const READ_ONLY_17 = 17;
export const READ_ONLY_18 = 18;
export const READ_ONLY_19 = 19;
export const READ_ONLY_20 = 20;
export const READ_ONLY_21 = 21;
export const READ_ONLY_22 = 22;
