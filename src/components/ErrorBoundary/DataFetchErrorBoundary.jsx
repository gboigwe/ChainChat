import { Component } from 'react';

class DataFetchErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    };
    this.retryTimeoutId = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataFetchErrorBoundary caught error:', error);

    const errorType = this.categorizeDataError(error);

    if (window.errorLogger) {
      window.errorLogger.logError({
        error,
        errorInfo,
        errorType,
        context: 'DataFetchErrorBoundary',
        dataSource: this.props.dataSource || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  categorizeDataError = (error) => {
    const message = error?.message?.toLowerCase() || '';
    const statusCode = error?.response?.status;

    if (statusCode === 404) {
      return 'NOT_FOUND';
    }
    if (statusCode === 403 || statusCode === 401) {
      return 'UNAUTHORIZED';
    }
    if (statusCode === 429) {
      return 'RATE_LIMITED';
    }
    if (statusCode >= 500) {
      return 'SERVER_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('parse') || message.includes('json')) {
      return 'PARSE_ERROR';
    }
    return 'UNKNOWN_DATA_ERROR';
  };

  getErrorMessage = (errorType) => {
    const messages = {
      NOT_FOUND: 'The requested data could not be found.',
      UNAUTHORIZED: 'You are not authorized to access this data.',
      RATE_LIMITED: 'Too many requests. Please wait before trying again.',
      SERVER_ERROR: 'Server error while fetching data.',
      TIMEOUT: 'Request timed out. The server took too long to respond.',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      PARSE_ERROR: 'Error parsing the response data.',
      UNKNOWN_DATA_ERROR: 'An error occurred while fetching data.'
    };

    return messages[errorType] || messages.UNKNOWN_DATA_ERROR;
  };

  getRetryDelay = (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s, 8s
    return Math.min(1000 * Math.pow(2, retryCount), 8000);
  };

  shouldAutoRetry = (errorType) => {
    const autoRetryableErrors = ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_ERROR'];
    return autoRetryableErrors.includes(errorType) && this.state.retryCount < 3;
  };

  handleRetry = async () => {
    const { retryCount } = this.state;
    const newRetryCount = retryCount + 1;

    this.setState({
      isRetrying: true,
      retryCount: newRetryCount
    });

    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
        this.setState({
          hasError: false,
          error: null,
          isRetrying: false
        });
      } catch (error) {
        console.error('Data fetch retry failed:', error);
        this.setState({ isRetrying: false });
      }
    } else {
      // If no onRetry callback, just reset the error
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          isRetrying: false
        });
      }, 500);
    }
  };

  handleAutoRetry = (errorType) => {
    const delay = this.getRetryDelay(this.state.retryCount);

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  handleReset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount, isRetrying } = this.state;
      const errorType = this.categorizeDataError(error);
      const errorMessage = this.getErrorMessage(errorType);
      const maxRetries = 3;
      const canRetry = retryCount < maxRetries;
      const autoRetry = this.shouldAutoRetry(errorType);

      // Auto-retry for certain error types
      if (autoRetry && !isRetrying && this.retryTimeoutId === null) {
        this.handleAutoRetry(errorType);
      }

      return (
        <div className="error-boundary-data-fetch">
          <div className="error-boundary-content">
            <div className="error-icon">📡</div>
            <h3 className="error-title">Data Loading Error</h3>
            <p className="error-message">{errorMessage}</p>

            {isRetrying && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Retrying... (Attempt {retryCount} of {maxRetries})</p>
              </div>
            )}

            {autoRetry && !isRetrying && (
              <p className="auto-retry-info">
                Auto-retrying in {this.getRetryDelay(retryCount) / 1000}s...
              </p>
            )}

            {!isRetrying && (
              <>
                {retryCount > 0 && (
                  <p className="retry-count">
                    Retry attempts: {retryCount} of {maxRetries}
                  </p>
                )}

                <div className="error-actions">
                  {canRetry && (
                    <button
                      onClick={this.handleRetry}
                      className="error-button error-button-primary"
                      disabled={isRetrying}
                    >
                      Retry Now
                    </button>
                  )}
                  <button
                    onClick={this.handleReset}
                    className="error-button error-button-secondary"
                  >
                    Dismiss
                  </button>
                </div>

                {!canRetry && (
                  <div className="error-warning">
                    <p>Maximum retry attempts reached. Please try again later.</p>
                  </div>
                )}
              </>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">{error?.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

DataFetchErrorBoundary.displayName = 'DataFetchErrorBoundary';

export default DataFetchErrorBoundary;
