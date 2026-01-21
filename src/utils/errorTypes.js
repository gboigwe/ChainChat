/**
 * Error Type Definitions
 * Standardized error types and custom error classes
 */

// Error Categories
export const ERROR_CATEGORIES = {
  WALLET: 'WALLET',
  TRANSACTION: 'TRANSACTION',
  NETWORK: 'NETWORK',
  DATA: 'DATA',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN'
};

// Wallet Error Types
export const WALLET_ERROR_TYPES = {
  NOT_INSTALLED: 'WALLET_NOT_INSTALLED',
  NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  USER_REJECTED: 'WALLET_USER_REJECTED',
  CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  NETWORK_MISMATCH: 'WALLET_NETWORK_MISMATCH',
  INSUFFICIENT_BALANCE: 'WALLET_INSUFFICIENT_BALANCE',
  LOCKED: 'WALLET_LOCKED',
  UNKNOWN: 'WALLET_UNKNOWN'
};

// Transaction Error Types
export const TRANSACTION_ERROR_TYPES = {
  INSUFFICIENT_FUNDS: 'TX_INSUFFICIENT_FUNDS',
  TIMEOUT: 'TX_TIMEOUT',
  FAILED: 'TX_FAILED',
  REJECTED: 'TX_REJECTED',
  NONCE_ERROR: 'TX_NONCE_ERROR',
  FEE_ERROR: 'TX_FEE_ERROR',
  REVERTED: 'TX_REVERTED',
  UNKNOWN: 'TX_UNKNOWN'
};

// Network Error Types
export const NETWORK_ERROR_TYPES = {
  CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
  TIMEOUT: 'NETWORK_TIMEOUT',
  RATE_LIMITED: 'NETWORK_RATE_LIMITED',
  SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  NOT_FOUND: 'NETWORK_NOT_FOUND',
  UNAUTHORIZED: 'NETWORK_UNAUTHORIZED',
  FORBIDDEN: 'NETWORK_FORBIDDEN',
  UNKNOWN: 'NETWORK_UNKNOWN'
};

// Data Error Types
export const DATA_ERROR_TYPES = {
  FETCH_FAILED: 'DATA_FETCH_FAILED',
  PARSE_ERROR: 'DATA_PARSE_ERROR',
  VALIDATION_ERROR: 'DATA_VALIDATION_ERROR',
  NOT_FOUND: 'DATA_NOT_FOUND',
  STALE: 'DATA_STALE',
  UNKNOWN: 'DATA_UNKNOWN'
};

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(message, type, category = ERROR_CATEGORIES.UNKNOWN, metadata = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.category = category;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      category: this.category,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Wallet-specific Error
 */
export class WalletError extends AppError {
  constructor(message, type = WALLET_ERROR_TYPES.UNKNOWN, metadata = {}) {
    super(message, type, ERROR_CATEGORIES.WALLET, metadata);
    this.name = 'WalletError';
  }
}

/**
 * Transaction-specific Error
 */
export class TransactionError extends AppError {
  constructor(message, type = TRANSACTION_ERROR_TYPES.UNKNOWN, metadata = {}) {
    super(message, type, ERROR_CATEGORIES.TRANSACTION, metadata);
    this.name = 'TransactionError';
  }
}

/**
 * Network-specific Error
 */
export class NetworkError extends AppError {
  constructor(message, type = NETWORK_ERROR_TYPES.UNKNOWN, metadata = {}) {
    super(message, type, ERROR_CATEGORIES.NETWORK, metadata);
    this.name = 'NetworkError';
  }
}

/**
 * Data-specific Error
 */
export class DataError extends AppError {
  constructor(message, type = DATA_ERROR_TYPES.UNKNOWN, metadata = {}) {
    super(message, type, ERROR_CATEGORIES.DATA, metadata);
    this.name = 'DataError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', ERROR_CATEGORIES.VALIDATION, { field, value });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Error factory - creates appropriate error based on type
 */
export function createError(message, type, metadata = {}) {
  // Determine error category from type
  if (Object.values(WALLET_ERROR_TYPES).includes(type)) {
    return new WalletError(message, type, metadata);
  }

  if (Object.values(TRANSACTION_ERROR_TYPES).includes(type)) {
    return new TransactionError(message, type, metadata);
  }

  if (Object.values(NETWORK_ERROR_TYPES).includes(type)) {
    return new NetworkError(message, type, metadata);
  }

  if (Object.values(DATA_ERROR_TYPES).includes(type)) {
    return new DataError(message, type, metadata);
  }

  return new AppError(message, type, ERROR_CATEGORIES.UNKNOWN, metadata);
}

/**
 * Check if error is of specific type
 */
export function isErrorType(error, type) {
  return error?.type === type;
}

/**
 * Check if error is in specific category
 */
export function isErrorCategory(error, category) {
  return error?.category === category;
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error) {
  const criticalTypes = [
    TRANSACTION_ERROR_TYPES.FAILED,
    WALLET_ERROR_TYPES.INSUFFICIENT_BALANCE,
    NETWORK_ERROR_TYPES.UNAUTHORIZED
  ];

  const warningTypes = [
    TRANSACTION_ERROR_TYPES.TIMEOUT,
    WALLET_ERROR_TYPES.USER_REJECTED,
    NETWORK_ERROR_TYPES.RATE_LIMITED
  ];

  if (criticalTypes.includes(error?.type)) {
    return 'CRITICAL';
  }

  if (warningTypes.includes(error?.type)) {
    return 'WARNING';
  }

  return 'ERROR';
}

export default {
  ERROR_CATEGORIES,
  WALLET_ERROR_TYPES,
  TRANSACTION_ERROR_TYPES,
  NETWORK_ERROR_TYPES,
  DATA_ERROR_TYPES,
  AppError,
  WalletError,
  TransactionError,
  NetworkError,
  DataError,
  ValidationError,
  createError,
  isErrorType,
  isErrorCategory,
  getErrorSeverity
};
