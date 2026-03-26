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
