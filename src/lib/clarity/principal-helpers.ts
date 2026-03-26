// Clarity v4 principal validation and normalization helpers

/** Regex for valid Stacks mainnet standard principal */
const MAINNET_PRINCIPAL_REGEX = /^SP[0-9A-Z]{38,39}$/;

/** Regex for valid Stacks testnet standard principal */
const TESTNET_PRINCIPAL_REGEX = /^ST[0-9A-Z]{38,39}$/;

/** Regex for contract principal (address.contract-name) */
const CONTRACT_PRINCIPAL_REGEX = /^(S[TP][0-9A-Z]{38,39})\.([a-z][a-z0-9\-]{0,39})$/;

/** Check if a string is a valid standard principal */
export function isStandardPrincipal(address: string): boolean {
  return MAINNET_PRINCIPAL_REGEX.test(address) || TESTNET_PRINCIPAL_REGEX.test(address);
}
