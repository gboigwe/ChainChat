/**
 * Input Validation Utilities
 */

export const validateStacksAddress = (address) => {
  return /^S[MP][0-9A-Z]{38,40}$/.test(address);
};

export const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
};

export const validateContractName = (name) => {
  return /^[a-z][a-z0-9-]*$/.test(name);
};

export const sanitizeInput = (input) => {
  return String(input).trim();
};
