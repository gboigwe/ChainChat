/**
 * Retry Logic for Failed Operations
 */

export const retryOperation = async (
  operation,
  maxRetries = 3,
  delay = 1000
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

export const retryTransaction = async (txFunction) => {
  return retryOperation(txFunction, 3, 2000);
};
