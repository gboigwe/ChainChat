import { Component } from 'react';

class WalletErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WalletErrorBoundary caught error:', error);

    // Categorize wallet errors
    const errorType = this.categorizeWalletError(error);

    if (window.errorLogger) {
      window.errorLogger.logError({
        error,
        errorInfo,
        errorType,
        context: 'WalletErrorBoundary',
        timestamp: new Date().toISOString()
      });
    }
  }

  categorizeWalletError = (error) => {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('user reject') || message.includes('cancel')) {
      return 'USER_REJECTED';
    }
    if (message.includes('not installed') || message.includes('not found')) {
      return 'WALLET_NOT_INSTALLED';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('insufficient') || message.includes('balance')) {
      return 'INSUFFICIENT_BALANCE';
    }
    return 'UNKNOWN_WALLET_ERROR';
  };

  getErrorMessage = (errorType) => {
    const messages = {
      USER_REJECTED: 'You cancelled the wallet connection request.',
      WALLET_NOT_INSTALLED: 'Wallet extension not found. Please install a Stacks wallet.',
      NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
      INSUFFICIENT_BALANCE: 'Insufficient balance to complete this transaction.',
      UNKNOWN_WALLET_ERROR: 'An error occurred with your wallet connection.'
    };

    return messages[errorType] || messages.UNKNOWN_WALLET_ERROR;
  };

  getErrorAction = (errorType) => {
    const actions = {
      USER_REJECTED: 'Try connecting again when you\'re ready.',
      WALLET_NOT_INSTALLED: 'Install Hiro Wallet or Xverse from your browser extension store.',
      NETWORK_ERROR: 'Check your connection and try again.',
      INSUFFICIENT_BALANCE: 'Add more STX to your wallet or reduce the amount.',
      UNKNOWN_WALLET_ERROR: 'Try reconnecting your wallet or contact support.'
    };

    return actions[errorType] || actions.UNKNOWN_WALLET_ERROR;
  };

  handleRetry = async () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));

    // Call optional onRetry callback
    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const errorType = this.categorizeWalletError(error);
      const errorMessage = this.getErrorMessage(errorType);
      const errorAction = this.getErrorAction(errorType);
      const maxRetries = 3;

      return (
        <div className="error-boundary-wallet">
          <div className="error-boundary-content">
            <div className="error-icon">👛</div>
            <h3 className="error-title">Wallet Connection Error</h3>
            <p className="error-message">{errorMessage}</p>
            <p className="error-action">{errorAction}</p>

            {retryCount > 0 && retryCount < maxRetries && (
              <p className="error-retry-info">
                Retry attempt {retryCount} of {maxRetries}
              </p>
            )}

            {retryCount >= maxRetries && (
              <div className="error-warning">
                <p>Multiple retry attempts failed. Please check your wallet setup.</p>
              </div>
            )}

            <div className="error-actions">
              {retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="error-button error-button-primary"
                >
                  Retry Connection
                </button>
              )}
              <button
                onClick={this.handleReset}
                className="error-button error-button-secondary"
              >
                Dismiss
              </button>
            </div>

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

WalletErrorBoundary.displayName = 'WalletErrorBoundary';

export default WalletErrorBoundary;
