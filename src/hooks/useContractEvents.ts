// Contract events polling hook
import { useState, useCallback, useEffect } from 'react';
/** Contract event */
export interface ContractEvent {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log?: { contract_id: string; topic: string; value: string };
}
/** Contract events hook state */
export interface UseContractEventsState {
  events: ContractEvent[];
  loading: boolean;
  error: string | null;
}
/** Poll contract events */
export function useContractEvents(
  contractId: string | null,
  apiUrl = 'https://api.hiro.so',
  pollInterval = 10000,
): UseContractEventsState & { refetch: () => void } {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/extended/v1/contract/${contractId}/events?limit=50`);
      const data = await res.json();
      setEvents(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch events');
    } finally { setLoading(false); }
  }, [contractId, apiUrl]);
  useEffect(() => {
    void refetch();
    const id = setInterval(() => void refetch(), pollInterval);
    return () => clearInterval(id);
  }, [refetch, pollInterval]);
  return { events, loading, error, refetch };
}
export const CONTRACT_EVENTS_1 = 1;
export const CONTRACT_EVENTS_2 = 2;
export const CONTRACT_EVENTS_3 = 3;
export const CONTRACT_EVENTS_4 = 4;
export const CONTRACT_EVENTS_5 = 5;
export const CONTRACT_EVENTS_6 = 6;
export const CONTRACT_EVENTS_7 = 7;
export const CONTRACT_EVENTS_8 = 8;
export const CONTRACT_EVENTS_9 = 9;
export const CONTRACT_EVENTS_10 = 10;
export const CONTRACT_EVENTS_11 = 11;
export const CONTRACT_EVENTS_12 = 12;
