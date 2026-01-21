/**
 * User-Friendly Error Messages
 * Maps technical errors to user-friendly messages and suggestions
 */

import {
  WALLET_ERROR_TYPES,
  TRANSACTION_ERROR_TYPES,
  NETWORK_ERROR_TYPES,
  DATA_ERROR_TYPES
} from './errorTypes';

/**
 * User-friendly error messages by type
 */
export const ERROR_MESSAGES = {
  // Wallet Errors
  [WALLET_ERROR_TYPES.NOT_INSTALLED]: {
    title: 'Wallet Not Found',
    message: 'No Stacks wallet extension detected in your browser.',
    suggestion: 'Please install Hiro Wallet or Xverse from your browser extension store.',
    action: 'Install Wallet'
  },
  [WALLET_ERROR_TYPES.NOT_CONNECTED]: {
    title: 'Wallet Not Connected',
    message: 'Your wallet is not connected to the application.',
    suggestion: 'Click the "Connect Wallet" button to connect your Stacks wallet.',
    action: 'Connect Wallet'
  },
  [WALLET_ERROR_TYPES.USER_REJECTED]: {
    title: 'Connection Cancelled',
    message: 'You cancelled the wallet connection request.',
    suggestion: 'Try connecting again when you are ready.',
    action: 'Try Again'
  },
  [WALLET_ERROR_TYPES.CONNECTION_FAILED]: {
    title: 'Connection Failed',
    message: 'Failed to connect to your wallet.',
    suggestion: 'Please ensure your wallet is unlocked and try again.',
    action: 'Retry Connection'
  },
  [WALLET_ERROR_TYPES.NETWORK_MISMATCH]: {
    title: 'Wrong Network',
    message: 'Your wallet is connected to the wrong network.',
    suggestion: 'Please switch your wallet to Stacks Mainnet.',
    action: 'Switch Network'
  },
  [WALLET_ERROR_TYPES.INSUFFICIENT_BALANCE]: {
    title: 'Insufficient Balance',
    message: 'You do not have enough STX to complete this transaction.',
    suggestion: 'Add more STX to your wallet before trying again.',
    action: 'View Wallet'
  },
  [WALLET_ERROR_TYPES.LOCKED]: {
    title: 'Wallet Locked',
    message: 'Your wallet is currently locked.',
    suggestion: 'Please unlock your wallet extension and try again.',
    action: 'Retry'
  },

  // Transaction Errors
  [TRANSACTION_ERROR_TYPES.INSUFFICIENT_FUNDS]: {
    title: 'Insufficient Funds',
    message: 'You do not have enough funds to complete this transaction.',
    suggestion: 'Add more STX to your wallet or reduce the transaction amount.',
    action: 'Check Balance'
  },
  [TRANSACTION_ERROR_TYPES.TIMEOUT]: {
    title: 'Transaction Timeout',
    message: 'The transaction took too long to process.',
    suggestion: 'Check the transaction status on a block explorer or try again.',
    action: 'View Transaction'
  },
  [TRANSACTION_ERROR_TYPES.FAILED]: {
    title: 'Transaction Failed',
    message: 'The transaction failed on the blockchain.',
    suggestion: 'Check the transaction requirements and try again.',
    action: 'Retry'
  },
  [TRANSACTION_ERROR_TYPES.REJECTED]: {
    title: 'Transaction Rejected',
    message: 'You rejected the transaction in your wallet.',
    suggestion: 'Approve the transaction when you are ready to proceed.',
    action: 'Try Again'
  },
  [TRANSACTION_ERROR_TYPES.NONCE_ERROR]: {
    title: 'Transaction Sequence Error',
    message: 'There was an issue with the transaction sequence.',
    suggestion: 'This usually resolves itself. Please try again.',
    action: 'Retry'
  },
  [TRANSACTION_ERROR_TYPES.FEE_ERROR]: {
    title: 'Fee Error',
    message: 'There was an issue with the transaction fee.',
    suggestion: 'Try adjusting the fee amount and submitting again.',
    action: 'Adjust Fee'
  },

  // Network Errors
  [NETWORK_ERROR_TYPES.CONNECTION_FAILED]: {
    title: 'Connection Failed',
    message: 'Unable to connect to the network.',
    suggestion: 'Please check your internet connection and try again.',
    action: 'Retry'
  },
  [NETWORK_ERROR_TYPES.TIMEOUT]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    suggestion: 'Check your connection and try again.',
    action: 'Retry'
  },
  [NETWORK_ERROR_TYPES.RATE_LIMITED]: {
    title: 'Too Many Requests',
    message: 'You have made too many requests.',
    suggestion: 'Please wait a moment before trying again.',
    action: 'Wait'
  },
  [NETWORK_ERROR_TYPES.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'The server encountered an error.',
    suggestion: 'Please try again later.',
    action: 'Retry Later'
  },
  [NETWORK_ERROR_TYPES.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource was not found.',
    suggestion: 'Please check the request and try again.',
    action: 'Go Back'
  },
  [NETWORK_ERROR_TYPES.UNAUTHORIZED]: {
    title: 'Unauthorized',
    message: 'You are not authorized to access this resource.',
    suggestion: 'Please sign in or check your permissions.',
    action: 'Sign In'
  },
  [NETWORK_ERROR_TYPES.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    suggestion: 'Contact support if you believe this is an error.',
    action: 'Contact Support'
  },

  // Data Errors
  [DATA_ERROR_TYPES.FETCH_FAILED]: {
    title: 'Failed to Load Data',
    message: 'Unable to fetch the requested data.',
    suggestion: 'Please try refreshing the page.',
    action: 'Refresh'
  },
  [DATA_ERROR_TYPES.PARSE_ERROR]: {
    title: 'Data Format Error',
    message: 'Unable to parse the response data.',
    suggestion: 'The data format may be invalid. Please try again.',
    action: 'Retry'
  },
  [DATA_ERROR_TYPES.NOT_FOUND]: {
    title: 'Data Not Found',
    message: 'The requested data could not be found.',
    suggestion: 'The data may have been moved or deleted.',
    action: 'Go Back'
  },

  // Default/Unknown
  DEFAULT: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again or contact support if the problem persists.',
    action: 'Try Again'
  }
};

/**
 * Get user-friendly error message by type
 */
export function getErrorMessage(errorType) {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.DEFAULT;
}

/**
 * Get error message from error object
 */
export function formatErrorMessage(error) {
  const errorType = error?.type;
  const errorMessage = getErrorMessage(errorType);

  return {
    ...errorMessage,
    technicalDetails: error?.message,
    timestamp: error?.timestamp,
    errorType
  };
}

/**
 * Get actionable steps for error
 */
export function getErrorActions(errorType) {
  const message = getErrorMessage(errorType);

  const baseActions = [
    {
      label: message.action || 'Try Again',
      variant: 'primary',
      type: 'retry'
    }
  ];

  // Add context-specific actions
  if (errorType?.startsWith('WALLET_')) {
    baseActions.push({
      label: 'View Wallet Guide',
      variant: 'secondary',
      type: 'guide',
      url: '/help/wallet'
    });
  }

  if (errorType?.startsWith('TX_')) {
    baseActions.push({
      label: 'View on Explorer',
      variant: 'secondary',
      type: 'explorer'
    });
  }

  baseActions.push({
    label: 'Dismiss',
    variant: 'tertiary',
    type: 'dismiss'
  });

  return baseActions;
}

/**
 * Check if error should show retry option
 */
export function shouldShowRetry(errorType) {
  const noRetryTypes = [
    WALLET_ERROR_TYPES.NOT_INSTALLED,
    WALLET_ERROR_TYPES.USER_REJECTED,
    TRANSACTION_ERROR_TYPES.REJECTED,
    NETWORK_ERROR_TYPES.UNAUTHORIZED,
    NETWORK_ERROR_TYPES.FORBIDDEN
  ];

  return !noRetryTypes.includes(errorType);
}

/**
 * Get error icon by type
 */
export function getErrorIcon(errorType) {
  if (errorType?.startsWith('WALLET_')) return '👛';
  if (errorType?.startsWith('TX_')) return '⚡';
  if (errorType?.startsWith('NETWORK_')) return '📡';
  if (errorType?.startsWith('DATA_')) return '📊';
  return '⚠️';
}

/**
 * Get help URL for error type
 */
export function getHelpUrl(errorType) {
  const helpUrls = {
    [WALLET_ERROR_TYPES.NOT_INSTALLED]: '/help/install-wallet',
    [WALLET_ERROR_TYPES.CONNECTION_FAILED]: '/help/connect-wallet',
    [TRANSACTION_ERROR_TYPES.INSUFFICIENT_FUNDS]: '/help/add-funds',
    [NETWORK_ERROR_TYPES.RATE_LIMITED]: '/help/rate-limits'
  };

  return helpUrls[errorType] || '/help';
}

export default {
  ERROR_MESSAGES,
  getErrorMessage,
  formatErrorMessage,
  getErrorActions,
  shouldShowRetry,
  getErrorIcon,
  getHelpUrl
};
