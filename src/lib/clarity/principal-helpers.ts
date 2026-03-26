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

/** Check if a string is a valid contract principal */
export function isContractPrincipal(address: string): boolean {
  return CONTRACT_PRINCIPAL_REGEX.test(address);
}

/** Check if a string is any valid principal (standard or contract) */
export function isValidPrincipal(address: string): boolean {
  return isStandardPrincipal(address) || isContractPrincipal(address);
}

/** Extract deployer address from a contract principal */
export function getDeployerAddress(contractPrincipal: string): string | null {
  const match = CONTRACT_PRINCIPAL_REGEX.exec(contractPrincipal);
  return match ? match[1] : null;
}

/** Extract contract name from a contract principal */
export function getContractName(contractPrincipal: string): string | null {
  const match = CONTRACT_PRINCIPAL_REGEX.exec(contractPrincipal);
  return match ? match[2] : null;
}

/** Build a contract principal from deployer address and name */
export function buildContractPrincipal(deployer: string, name: string): string {
  if (!isStandardPrincipal(deployer)) throw new Error('Invalid deployer address');
  if (!/^[a-z][a-z0-9\-]{0,39}$/.test(name)) throw new Error('Invalid contract name');
  return `${deployer}.${name}`;
}

/** Detect if address is on mainnet */
export function isMainnetPrincipal(address: string): boolean {
  return address.startsWith('SP');
}
