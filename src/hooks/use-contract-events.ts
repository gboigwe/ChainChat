/**
 * React hook for contract events
 * Fetches and decodes Clarity print events for a contract
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getHiroClient } from '../lib/hiro-api';
import { decodeContractEvents, type DecodedContractEvent } from '../lib/event-decoder';
import { type ContractId } from '../types/stacks';
import { type StacksNetworkName } from '../config/network-config';

interface UseContractEventsOptions {
  limit?: number;
  pollInterval?: number; // ms, 0 to disable polling
  enabled?: boolean;
  filterEventName?: string;
}

interface UseContractEventsResult {
  events: DecodedContractEvent[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useContractEvents(
  contractId: ContractId | string | null | undefined,
  network?: StacksNetworkName,
  options: UseContractEventsOptions = {}
): UseContractEventsResult {
  const { limit = 20, pollInterval = 0, enabled = true, filterEventName } = options;

  const [events, setEvents] = useState<DecodedContractEvent[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(
    async (newOffset = 0, append = false) => {
      if (!contractId || !enabled) return;
      setIsLoading(true);
      setError(null);

      try {
        const client = getHiroClient(network);
        const data = await client.getContractEvents(contractId, { limit, offset: newOffset });

        const decoded = decodeContractEvents(data.results || []);
        const filtered = filterEventName
          ? decoded.filter((e) => {
              const eventField = e.value?.event ?? e.value?.type;
              return typeof eventField === 'string' && eventField.includes(filterEventName);
            })
          : decoded;

        setEvents((prev) => (append ? [...prev, ...filtered] : filtered));
        setHasMore(data.results.length === limit);
        setOffset(newOffset + data.results.length);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch contract events'));
      } finally {
        setIsLoading(false);
      }
    },
    [contractId, network, limit, enabled, filterEventName]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await fetchEvents(offset, true);
  }, [fetchEvents, isLoading, hasMore, offset]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setEvents([]);
    setHasMore(true);
    await fetchEvents(0, false);
  }, [fetchEvents]);

  useEffect(() => {
    if (!contractId || !enabled) return;
    fetchEvents(0);

    if (pollInterval > 0) {
      intervalRef.current = setInterval(() => refresh(), pollInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [contractId, network, enabled, pollInterval]);

  return { events, isLoading, error, hasMore, loadMore, refresh };
}
