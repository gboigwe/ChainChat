import { Component } from 'react';

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('RootErrorBoundary caught error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Log to error logging service (to be implemented)
    if (window.errorLogger) {
      window.errorLogger.logError({
        error,
        errorInfo,
        context: 'RootErrorBoundary',
        timestamp: new Date().toISOString()
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorCount } = this.state;
      const isPersistentError = errorCount > 2;

      return (
        <div className="error-boundary-root">
          <div className="error-boundary-container">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              {error?.message || 'An unexpected error occurred'}
            </p>

            {isPersistentError && (
              <div className="error-warning">
                <p>This error persists. Please try reloading the page or contact support.</p>
              </div>
            )}

            <div className="error-actions">
              {!isPersistentError && (
                <button
                  onClick={this.handleReset}
                  className="error-button error-button-primary"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={this.handleReload}
                className="error-button error-button-secondary"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="error-button error-button-tertiary"
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {error?.stack}
                </pre>
                <pre className="error-component-stack">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

RootErrorBoundary.displayName = 'RootErrorBoundary';

export default RootErrorBoundary;
