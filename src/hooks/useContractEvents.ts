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
