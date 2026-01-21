/**
 * Error Recovery Utilities
 * Provides strategies for recovering from different types of errors
 */

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff(
  operation,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 8000
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await operation();
      return { success: true, result, attempts: attempt + 1 };
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        console.log(`Retry attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxRetries
  };
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  reset() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Timeout wrapper for async operations
 */
export function withTimeout(operation, timeoutMs = 30000) {
  return Promise.race([
    operation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

/**
 * Safe execution wrapper that catches and logs errors
 */
export async function safeExecute(operation, fallbackValue = null, context = 'Unknown') {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);

    if (window.errorLogger) {
      window.errorLogger.logError({
        error,
        context,
        timestamp: new Date().toISOString()
      });
    }

    return fallbackValue;
  }
}

/**
 * Debounced error recovery - prevents rapid retry storms
 */
export function createDebouncedRecovery(recoveryFn, delay = 2000) {
  let timeoutId = null;
  let lastAttempt = 0;

  return function debouncedRecover(...args) {
    const now = Date.now();

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // If last attempt was too recent, delay further
    const timeSinceLastAttempt = now - lastAttempt;
    const actualDelay = timeSinceLastAttempt < delay ? delay : 0;

    timeoutId = setTimeout(() => {
      lastAttempt = Date.now();
      recoveryFn(...args);
    }, actualDelay);
  };
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error) {
  const message = error?.message?.toLowerCase() || '';

  // Non-recoverable errors
  const nonRecoverablePatterns = [
    'not found',
    'unauthorized',
    'forbidden',
    'invalid',
    'parse error',
    'syntax error'
  ];

  for (const pattern of nonRecoverablePatterns) {
    if (message.includes(pattern)) {
      return false;
    }
  }

  // Recoverable errors
  const recoverablePatterns = [
    'timeout',
    'network',
    'connection',
    'rate limit',
    'server error',
    'service unavailable'
  ];

  for (const pattern of recoverablePatterns) {
    if (message.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Get recovery strategy based on error type
 */
export function getRecoveryStrategy(error) {
  const message = error?.message?.toLowerCase() || '';

  if (message.includes('timeout')) {
    return {
      strategy: 'RETRY',
      maxRetries: 3,
      delay: 2000,
      reason: 'Request timed out, retrying with longer timeout'
    };
  }

  if (message.includes('network') || message.includes('connection')) {
    return {
      strategy: 'RETRY',
      maxRetries: 5,
      delay: 3000,
      reason: 'Network error, retrying with exponential backoff'
    };
  }

  if (message.includes('rate limit')) {
    return {
      strategy: 'WAIT',
      delay: 60000,
      reason: 'Rate limited, waiting before retry'
    };
  }

  if (message.includes('server error') || message.includes('500')) {
    return {
      strategy: 'RETRY',
      maxRetries: 3,
      delay: 5000,
      reason: 'Server error, retrying after delay'
    };
  }

  return {
    strategy: 'NONE',
    reason: 'Error is not recoverable automatically'
  };
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Graceful degradation - try primary operation, fallback to secondary
 */
export async function withFallback(primaryOperation, fallbackOperation) {
  try {
    return await primaryOperation();
  } catch (primaryError) {
    console.warn('Primary operation failed, trying fallback:', primaryError);

    try {
      return await fallbackOperation();
    } catch (fallbackError) {
      console.error('Fallback operation also failed:', fallbackError);
      throw new Error('Both primary and fallback operations failed', {
        cause: { primaryError, fallbackError }
      });
    }
  }
}

export default {
  retryWithBackoff,
  CircuitBreaker,
  withTimeout,
  safeExecute,
  createDebouncedRecovery,
  isRecoverableError,
  getRecoveryStrategy,
  withFallback
};
