// Fungible token balance maps and transfer patterns
/** Token balance type */
export type TokenBalance = bigint;
/** FT balance map: principal → balance */
export const ftBalanceMap = new Map<string, TokenBalance>();
/** FT allowance map: `owner:spender` → amount */
export const ftAllowanceMap = new Map<string, TokenBalance>();
