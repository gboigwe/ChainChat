import { Component } from 'react';

class TransactionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      transactionId: null,
      canRetry: true
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TransactionErrorBoundary caught error:', error);

    const errorType = this.categorizeTransactionError(error);
    const transactionId = this.extractTransactionId(error);

    this.setState({ transactionId });

    if (window.errorLogger) {
      window.errorLogger.logError({
        error,
        errorInfo,
        errorType,
        transactionId,
        context: 'TransactionErrorBoundary',
        timestamp: new Date().toISOString()
      });
    }
  }

  categorizeTransactionError = (error) => {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('insufficient') || message.includes('balance')) {
      return 'INSUFFICIENT_FUNDS';
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TRANSACTION_TIMEOUT';
    }
    if (message.includes('reject') || message.includes('cancel')) {
      return 'USER_REJECTED';
    }
    if (message.includes('nonce')) {
      return 'NONCE_ERROR';
    }
    if (message.includes('fee') || message.includes('gas')) {
      return 'FEE_ERROR';
    }
    if (message.includes('failed') || message.includes('reverted')) {
      return 'TRANSACTION_FAILED';
    }
    if (message.includes('network')) {
      return 'NETWORK_ERROR';
    }
    return 'UNKNOWN_TRANSACTION_ERROR';
  };

  extractTransactionId = (error) => {
    const message = error?.message || '';
    const txIdMatch = message.match(/0x[a-fA-F0-9]{64}/);
    return txIdMatch ? txIdMatch[0] : null;
  };

  getErrorMessage = (errorType) => {
    const messages = {
      INSUFFICIENT_FUNDS: 'Insufficient funds to complete this transaction.',
      TRANSACTION_TIMEOUT: 'Transaction timed out waiting for confirmation.',
      USER_REJECTED: 'You cancelled the transaction.',
      NONCE_ERROR: 'Transaction nonce error. Please try again.',
      FEE_ERROR: 'Transaction fee error. Please adjust the fee and retry.',
      TRANSACTION_FAILED: 'Transaction failed on the blockchain.',
      NETWORK_ERROR: 'Network error while processing transaction.',
      UNKNOWN_TRANSACTION_ERROR: 'An error occurred during the transaction.'
    };

    return messages[errorType] || messages.UNKNOWN_TRANSACTION_ERROR;
  };

  getErrorSuggestion = (errorType) => {
    const suggestions = {
      INSUFFICIENT_FUNDS: 'Add more STX to your wallet before trying again.',
      TRANSACTION_TIMEOUT: 'Check the transaction status on a block explorer or try again.',
      USER_REJECTED: 'Approve the transaction in your wallet when ready.',
      NONCE_ERROR: 'This usually resolves itself. Try the transaction again.',
      FEE_ERROR: 'Increase the transaction fee for faster processing.',
      TRANSACTION_FAILED: 'Check contract requirements and your wallet balance.',
      NETWORK_ERROR: 'Check your internet connection and try again.',
      UNKNOWN_TRANSACTION_ERROR: 'Please try again or contact support if the problem persists.'
    };

    return suggestions[errorType] || suggestions.UNKNOWN_TRANSACTION_ERROR;
  };

  shouldShowRetry = (errorType) => {
    const nonRetryableErrors = ['USER_REJECTED', 'INSUFFICIENT_FUNDS'];
    return !nonRetryableErrors.includes(errorType);
  };

  handleRetry = async () => {
    this.setState({ hasError: false, error: null, transactionId: null });

    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
      } catch (error) {
        console.error('Transaction retry failed:', error);
      }
    }
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, transactionId: null });
  };

  handleViewTransaction = () => {
    const { transactionId } = this.state;
    if (transactionId) {
      const explorerUrl = `https://explorer.stacks.co/txid/${transactionId}`;
      window.open(explorerUrl, '_blank');
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, transactionId } = this.state;
      const errorType = this.categorizeTransactionError(error);
      const errorMessage = this.getErrorMessage(errorType);
      const errorSuggestion = this.getErrorSuggestion(errorType);
      const showRetry = this.shouldShowRetry(errorType);

      return (
        <div className="error-boundary-transaction">
          <div className="error-boundary-content">
            <div className="error-icon">⚡</div>
            <h3 className="error-title">Transaction Error</h3>
            <p className="error-message">{errorMessage}</p>
            <p className="error-suggestion">{errorSuggestion}</p>

            {transactionId && (
              <div className="transaction-id">
                <strong>Transaction ID:</strong>
                <code>{transactionId.substring(0, 10)}...{transactionId.substring(transactionId.length - 8)}</code>
              </div>
            )}

            <div className="error-actions">
              {showRetry && (
                <button
                  onClick={this.handleRetry}
                  className="error-button error-button-primary"
                >
                  Retry Transaction
                </button>
              )}
              {transactionId && (
                <button
                  onClick={this.handleViewTransaction}
                  className="error-button error-button-secondary"
                >
                  View on Explorer
                </button>
              )}
              <button
                onClick={this.handleDismiss}
                className="error-button error-button-tertiary"
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

TransactionErrorBoundary.displayName = 'TransactionErrorBoundary';

export default TransactionErrorBoundary;
