/**
 * Graceful Degradation Utilities
 */

export const withFallback = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    console.warn('Operation failed, using fallback:', error);
    return fallback;
  }
};

export const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn('localStorage not available');
    }
  }
};
