import React, { useEffect, useState } from 'react';
import { useChainhookEvents, getEventDescription } from '../hooks/useChainhookEvents';

export const RealtimeActivityFeed = ({
  limit = 10,
  showNotifications = true,
  className = '',
  serverUrl = 'http://localhost:3001',
}) => {
  const { events: eventData, isLoading, error, latestEvent } = useChainhookEvents({
    limit,
    serverUrl,
  });

  // Ensure events is always an array
  const events = Array.isArray(eventData) ? eventData : [];
  const [lastSeenEvent, setLastSeenEvent] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Show toast notification for new events
  useEffect(() => {
    if (latestEvent && latestEvent !== lastSeenEvent && showNotifications) {
      setShowToast(true);
      setLastSeenEvent(latestEvent);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestEvent, lastSeenEvent, showNotifications]);

  const formatPrincipal = (principal) => {
    if (!principal) return 'Unknown';
    if (principal.length > 20) {
      return `${principal.slice(0, 8)}...${principal.slice(-6)}`;
    }
    return principal;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getEventIcon = (event) => {
    if (event.success) {
      return (
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-xs">✓</span>
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-xs">✗</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Error loading events: {error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toast Notification for new events */}
      {showToast && latestEvent && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg p-4 border border-blue-200 max-w-md animate-slide-down"
        >
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-2xl">🔔</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New Activity</p>
              <p className="text-sm text-gray-600">{getEventDescription(latestEvent)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Block #{latestEvent.blockHeight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Live Activity Feed
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading && events.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-300 text-4xl mb-3">🔔</div>
              <p className="text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">
                Events will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={`${event.txHash}-${index}`}
                  className="p-4 hover:bg-gray-50 transition-colors"
                  style={{
                    animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`,
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {getEventDescription(event)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        From: {formatPrincipal(event.sender)}
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                        <span>Block #{event.blockHeight}</span>
                        <span>•</span>
                        <span>{formatTimestamp(event.timestamp)}</span>
                        {event.success && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Success</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -50px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RealtimeActivityFeed;
