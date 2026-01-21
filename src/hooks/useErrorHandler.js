import { useState, useCallback, useEffect } from 'react';
import errorLogger from '../services/errorLogger';
import { createError, getErrorSeverity } from '../utils/errorTypes';
import { formatErrorMessage, shouldShowRetry } from '../utils/errorMessages';
import { retryWithBackoff, isRecoverableError } from '../services/errorRecovery';

/**
 * Custom hook for error handling
 * Provides error state management, logging, and recovery
 */
export function useErrorHandler(context = 'Unknown') {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Handle error - log and set error state
   */
  const handleError = useCallback((err, errorType, metadata = {}) => {
    let processedError = err;

    // Create structured error if not already
    if (!err?.type) {
      processedError = createError(
        err?.message || 'Unknown error',
        errorType || 'UNKNOWN',
        metadata
      );
    }

    // Log error
    errorLogger.logError({
      error: processedError,
      context,
      errorType: processedError.type,
      ...metadata
    });

    // Set error state
    setError(processedError);
    setRetryCount(0);

    return processedError;
  }, [context]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  /**
   * Retry operation with error handling
   */
  const retry = useCallback(async (operation, maxRetries = 3) => {
    if (!operation) {
      console.error('No operation provided to retry');
      return;
    }

    setIsRetrying(true);

    try {
      const result = await retryWithBackoff(operation, maxRetries);

      if (result.success) {
        clearError();
        return result.result;
      } else {
        setRetryCount(result.attempts);
        handleError(result.error, null, { retryAttempts: result.attempts });
        throw result.error;
      }
    } catch (err) {
      handleError(err, null, { retryFailed: true });
      throw err;
    } finally {
      setIsRetrying(false);
    }
  }, [handleError, clearError]);

  /**
   * Execute operation with automatic error handling
   */
  const executeWithHandler = useCallback(async (operation, errorType) => {
    try {
      clearError();
      const result = await operation();
      return result;
    } catch (err) {
      handleError(err, errorType);
      throw err;
    }
  }, [handleError, clearError]);

  /**
   * Execute operation with retry on failure
   */
  const executeWithRetry = useCallback(async (operation, errorType, maxRetries = 3) => {
    try {
      clearError();
      return await retry(operation, maxRetries);
    } catch (err) {
      handleError(err, errorType, { autoRetryFailed: true });
      throw err;
    }
  }, [handleError, clearError, retry]);

  // Get formatted error message
  const formattedError = error ? formatErrorMessage(error) : null;

  // Check if can retry
  const canRetry = error && isRecoverableError(error) && shouldShowRetry(error.type);

  // Get error severity
  const severity = error ? getErrorSeverity(error) : null;

  return {
    error,
    formattedError,
    severity,
    isRetrying,
    retryCount,
    canRetry,
    handleError,
    clearError,
    retry,
    executeWithHandler,
    executeWithRetry
  };
}

/**
 * Hook for async operation with error handling
 */
export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const { error, handleError, clearError } = useErrorHandler('useAsync');

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    clearError();

    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      handleError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction, handleError, clearError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

/**
 * Hook for error boundary integration
 */
export function useErrorBoundary() {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const throwError = useCallback((err) => {
    setError(err);
  }, []);

  return { throwError };
}

export default useErrorHandler;
