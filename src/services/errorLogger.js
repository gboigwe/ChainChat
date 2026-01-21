/**
 * Error Logging Service
 * Centralized error logging with support for external services
 */

class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.listeners = [];
  }

  /**
   * Log an error with context
   */
  logError({ error, errorInfo, context, errorType, ...metadata }) {
    const errorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack
      } : null,
      context,
      errorType,
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in memory
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Store in localStorage for persistence
    this.persistToLocalStorage(errorLog);

    // Notify listeners
    this.notifyListeners(errorLog);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 Error Log [${context}]`);
      console.error('Error:', error);
      console.log('Error Type:', errorType);
      console.log('Metadata:', metadata);
      console.groupEnd();
    }

    // Send to external logging service (if configured)
    this.sendToExternalService(errorLog);

    return errorLog;
  }

  /**
   * Log a warning (non-critical error)
   */
  logWarning({ message, context, ...metadata }) {
    const warningLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      message,
      context,
      metadata,
      url: window.location.href
    };

    this.logs.unshift(warningLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Warning [${context}]:`, message, metadata);
    }

    return warningLog;
  }

  /**
   * Get all error logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get errors by context
   */
  getLogsByContext(context) {
    return this.logs.filter(log => log.context === context);
  }

  /**
   * Get errors by type
   */
  getLogsByType(errorType) {
    return this.logs.filter(log => log.errorType === errorType);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('error_logs');
    } catch (e) {
      console.error('Failed to clear error logs from localStorage:', e);
    }
  }

  /**
   * Subscribe to error events
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of new error
   */
  notifyListeners(errorLog) {
    this.listeners.forEach(listener => {
      try {
        listener(errorLog);
      } catch (e) {
        console.error('Error in error logger listener:', e);
      }
    });
  }

  /**
   * Persist error to localStorage
   */
  persistToLocalStorage(errorLog) {
    try {
      const stored = localStorage.getItem('error_logs');
      const logs = stored ? JSON.parse(stored) : [];
      logs.unshift(errorLog);

      // Keep only last 50 errors in localStorage
      const trimmedLogs = logs.slice(0, 50);
      localStorage.setItem('error_logs', JSON.stringify(trimmedLogs));
    } catch (e) {
      console.error('Failed to persist error to localStorage:', e);
    }
  }

  /**
   * Load persisted errors from localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('error_logs');
      if (stored) {
        const logs = JSON.parse(stored);
        this.logs = [...logs, ...this.logs].slice(0, this.maxLogs);
      }
    } catch (e) {
      console.error('Failed to load errors from localStorage:', e);
    }
  }

  /**
   * Send error to external logging service
   */
  sendToExternalService(errorLog) {
    // TODO: Integrate with external service (e.g., Sentry, LogRocket)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(errorLog.error, {
    //     tags: {
    //       context: errorLog.context,
    //       errorType: errorLog.errorType
    //     },
    //     extra: errorLog.metadata
    //   });
    // }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    const stats = {
      total: this.logs.length,
      byContext: {},
      byType: {},
      last24Hours: 0
    };

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    this.logs.forEach(log => {
      // Count by context
      if (log.context) {
        stats.byContext[log.context] = (stats.byContext[log.context] || 0) + 1;
      }

      // Count by type
      if (log.errorType) {
        stats.byType[log.errorType] = (stats.byType[log.errorType] || 0) + 1;
      }

      // Count last 24 hours
      if (new Date(log.timestamp).getTime() > oneDayAgo) {
        stats.last24Hours++;
      }
    });

    return stats;
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Load persisted errors on initialization
errorLogger.loadFromLocalStorage();

// Expose globally for error boundaries
if (typeof window !== 'undefined') {
  window.errorLogger = errorLogger;
}

export default errorLogger;
