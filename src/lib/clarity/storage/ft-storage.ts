// Fungible token balance maps and transfer patterns
/** Token balance type */
export type TokenBalance = bigint;
/** FT balance map: principal → balance */
export const ftBalanceMap = new Map<string, TokenBalance>();
/** FT allowance map: `owner:spender` → amount */
export const ftAllowanceMap = new Map<string, TokenBalance>();
/** Get balance for principal */
export function getBalance(principal: string): TokenBalance {
  return ftBalanceMap.get(principal) ?? 0n;
}
/** Set balance for principal */
export function setBalance(principal: string, amount: TokenBalance): void {
  ftBalanceMap.set(principal, amount);
}
/** Validate transfer: check sender has sufficient balance */
export function validateTransfer(
  sender: string,
  amount: TokenBalance,
): boolean {
  return getBalance(sender) >= amount;
}
/** Execute FT transfer between principals */
export function executeTransfer(
  sender: string,
  recipient: string,
  amount: TokenBalance,
): void {
  if (!validateTransfer(sender, amount)) throw new Error('Insufficient balance');
  setBalance(sender, getBalance(sender) - amount);
  setBalance(recipient, getBalance(recipient) + amount);
}
/** Mint new tokens to principal */
export function mintTokens(recipient: string, amount: TokenBalance): void {
  setBalance(recipient, getBalance(recipient) + amount);
}
/** Burn tokens from principal */
export function burnTokens(owner: string, amount: TokenBalance): void {
  if (!validateTransfer(owner, amount)) throw new Error('Insufficient balance to burn');
  setBalance(owner, getBalance(owner) - amount);
}
/** Build allowance key */
function allowanceKey(owner: string, spender: string): string {
  return `${owner}:${spender}`;
}
/** Get allowance for spender from owner */
export function getAllowance(owner: string, spender: string): TokenBalance {
  return ftAllowanceMap.get(allowanceKey(owner, spender)) ?? 0n;
}
/** Set allowance for spender from owner */
export function setAllowance(owner: string, spender: string, amount: TokenBalance): void {
  ftAllowanceMap.set(allowanceKey(owner, spender), amount);
}
/** Transfer from allowance */
export function transferFrom(
  owner: string,
  spender: string,
  recipient: string,
  amount: TokenBalance,
): void {
  const allowed = getAllowance(owner, spender);
  if (allowed < amount) throw new Error('Insufficient allowance');
  setAllowance(owner, spender, allowed - amount);
  executeTransfer(owner, recipient, amount);
}
/** Revoke all allowances from owner */
export function revokeAllAllowances(owner: string): void {
  for (const key of ftAllowanceMap.keys()) {
    if (key.startsWith(`${owner}:`)) ftAllowanceMap.delete(key);
  }
}
/** Total supply computed from all balances */
export function totalSupply(): TokenBalance {
  let total = 0n;
  for (const balance of ftBalanceMap.values()) total += balance;
  return total;
}
/** Get top N holders by balance */
export function getTopHolders(n: number): Array<{ principal: string; balance: bigint }> {
  return Array.from(ftBalanceMap.entries())
    .map(([principal, balance]) => ({ principal, balance }))
    .sort((a, b) => Number(b.balance - a.balance))
    .slice(0, n);
}
/** Check if principal has sufficient balance */
export function hasSufficientBalance(principal: string, amount: bigint): boolean {
  return getBalance(principal) >= amount;
}
/** Format token balance for display */
export function formatBalance(balance: bigint, decimals = 6): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`;
}
/** Parse formatted balance back to bigint */
export function parseBalance(formatted: string, decimals = 6): bigint {
  const [whole, frac = ''] = formatted.split('.');
  const paddedFrac = frac.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFrac);
}
/** STX microSTX conversion */
export function stxToMicroStx(stx: bigint): bigint { return stx * 1_000_000n; }
export function microStxToStx(microStx: bigint): bigint { return microStx / 1_000_000n; }
/** FT transfer event record */
export interface FTTransferEvent {
  from: string;
  to: string;
  amount: bigint;
  blockHeight: bigint;
}
/** FT transfer event log */
export const ftTransferLog: FTTransferEvent[] = [];
/** Transfer with event logging */
export function executeTransferWithLog(
  sender: string,
  recipient: string,
  amount: bigint,
  blockHeight: bigint,
): void {
  executeTransfer(sender, recipient, amount);
  ftTransferLog.push({ from: sender, to: recipient, amount, blockHeight });
}
/** Lock tokens for a specified duration (escrow pattern) */
export interface TokenLock {
  owner: string;
  amount: bigint;
  releaseBlock: bigint;
}
/** Active token locks map */
export const tokenLockMap = new Map<string, TokenLock>();
