import { useState, useEffect, useCallback, useRef } from 'react';

export function useChainhookEvents(options = {}) {
  const {
    pollInterval = 5000,
    limit = 50,
    enabled = true,
    serverUrl = 'http://localhost:3001',
  } = options;

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestEvent, setLatestEvent] = useState(null);
  const intervalRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/api/events/recent?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
        setError(null);

        // Update latest event if there are new events
        if (data.events.length > 0 && data.events[0] !== latestEvent) {
          setLatestEvent(data.events[0]);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching chainhook events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, [limit, latestEvent, serverUrl]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchEvents();

    // Set up polling
    intervalRef.current = setInterval(fetchEvents, pollInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollInterval, fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
    latestEvent,
  };
}

// Helper function to filter events by type
export function filterEventsByType(events, eventType) {
  return events.filter(event => event.type === eventType);
}

// Helper function to filter events by topic (for print_event)
export function filterEventsByTopic(events, topic) {
  return events.filter(event => event.topic === topic);
}

// Helper function to get event description
export function getEventDescription(event) {
  if (event.topic) {
    switch (event.topic) {
      case 'deposit':
        return 'User deposited STX to vault';
      case 'withdraw':
        return 'User withdrew STX from vault';
      case 'allocate-funds':
        return 'Funds allocated to strategy';
      case 'return-funds':
        return 'Funds returned from strategy';
      case 'emergency-withdraw':
        return 'Emergency withdrawal executed';
      case 'start-strategy':
        return 'Strategy started';
      case 'stop-strategy':
        return 'Strategy stopped';
      case 'set-risk-level':
        return 'Risk level updated';
      default:
        return event.topic;
    }
  }

  if (event.type === 'stx_transfer_event') {
    return `STX transfer: ${event.amount}`;
  }

  return event.type;
}
