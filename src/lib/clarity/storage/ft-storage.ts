// Fungible token balance maps and transfer patterns
/** Token balance type */
export type TokenBalance = bigint;
/** FT balance map: principal → balance */
export const ftBalanceMap = new Map<string, TokenBalance>();
