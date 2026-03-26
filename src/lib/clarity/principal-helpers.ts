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

/** Detect if address is on testnet */
export function isTestnetPrincipal(address: string): boolean {
  return address.startsWith('ST');
}

/** Normalize principal: trim whitespace and validate */
export function normalizePrincipal(raw: string): string {
  const trimmed = raw.trim();
  if (!isValidPrincipal(trimmed)) throw new Error(`Invalid principal: ${raw}`);
  return trimmed;
}

/** Truncate principal for display (SP1234...ABCD) */
export function truncatePrincipal(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Compare two principals for equality (case-insensitive safe) */
export function principalsEqual(a: string, b: string): boolean {
  return a === b;
}

/** Known ChainChat contract addresses */
export const CHAINCHAT_CONTRACTS = {
  messaging: 'SP000000000000000000002Q6VF78.chainchat-messaging',
  channels:  'SP000000000000000000002Q6VF78.chainchat-channels',
} as const;

/** Resolve named contract to full principal */
export function resolveContract(name: keyof typeof CHAINCHAT_CONTRACTS): string {
  return CHAINCHAT_CONTRACTS[name];
}

/** Assert principal is valid or throw detailed error */
export function assertValidPrincipal(address: string): void {
  if (!isValidPrincipal(address)) {
    throw new Error(`assertValidPrincipal failed: "${address}" is not a valid Stacks principal`);
  }
}

/** Convert principal to network-specific format */
export function toTestnetPrincipal(mainnetAddr: string): string {
  if (!isMainnetPrincipal(mainnetAddr)) throw new Error('Not a mainnet address');
  return 'ST' + mainnetAddr.slice(2);
}

/** Convert testnet principal to mainnet format */
export function toMainnetPrincipal(testnetAddr: string): string {
  if (!isTestnetPrincipal(testnetAddr)) throw new Error('Not a testnet address');
  return 'SP' + testnetAddr.slice(2);
}

/** Parse principal from unknown input with validation */
export function parsePrincipal(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('Principal must be a string');
  return normalizePrincipal(raw);
}

/** Check if two contract principals are from the same deployer */
export function sameDeployer(a: string, b: string): boolean {
  return getDeployerAddress(a) === getDeployerAddress(b);
}

/** Batch validate a list of principals */
export function validatePrincipals(addresses: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const addr of addresses) {
    if (isValidPrincipal(addr)) valid.push(addr);
    else invalid.push(addr);
  }
  return { valid, invalid };
}

/** Get network prefix (SP/ST) from principal */
export function getNetworkPrefix(address: string): 'SP' | 'ST' | null {
  if (address.startsWith('SP')) return 'SP';
  if (address.startsWith('ST')) return 'ST';
  return null;
}

/** List of blocked/blacklisted principals */
export const BLOCKED_PRINCIPALS: ReadonlySet<string> = new Set<string>();

/** Check if a principal is blocked */
export function isBlockedPrincipal(address: string): boolean {
  return BLOCKED_PRINCIPALS.has(address);
}

/** Get the length of a principal string */
export function principalLength(address: string): number {
  return address.length;
}
