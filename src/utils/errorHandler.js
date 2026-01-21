/**
 * Global Error Handler
 */

export class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export const handleError = (error) => {
  console.error('[Error]', error);

  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check connection.';
  }

  if (error.code === 'WALLET_ERROR') {
    return 'Wallet error. Please reconnect.';
  }

  return error.message || 'An unexpected error occurred';
};

export const logError = (error, context) => {
  console.error(`[${context}]`, error);
};
