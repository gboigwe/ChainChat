// Storage operation validators
import { NFT_URI_MAX_LENGTH, NFT_MAX_SUPPLY, FT_MAX_SUPPLY } from './constants';
/** Validate NFT URI length */
export function isValidNFTUri(uri: string): boolean {
  return uri.length > 0 && uri.length <= NFT_URI_MAX_LENGTH;
}
/** Validate token ID is within supply bounds */
export function isValidTokenId(tokenId: bigint): boolean {
  return tokenId > 0n && tokenId <= NFT_MAX_SUPPLY;
}
/** Validate FT transfer amount */
export function isValidTransferAmount(amount: bigint): boolean {
  return amount > 0n && amount <= FT_MAX_SUPPLY;
}
/** Validate map key is non-empty */
export function isValidMapKey(key: string): boolean {
  return key.length > 0;
}
/** Validate map value is a non-null object */
export function isValidMapValue(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}
/** Validate page number is non-negative */
export function isValidPage(page: number): boolean {
  return Number.isInteger(page) && page >= 0;
}
/** Validate limit is within allowed range */
export function isValidLimit(limit: number, max = 100): boolean {
  return Number.isInteger(limit) && limit > 0 && limit <= max;
}
/** Validate badge type string */
export function isValidBadgeType(type: string): boolean {
  return ['early-adopter', 'power-user', 'moderator', 'vip'].includes(type);
}
/** Validate block height range */
export function isValidBlockRange(start: bigint, end: bigint): boolean {
  return start >= 0n && end >= start;
}
/** Validate bigint is non-negative */
export function isNonNegativeBigint(value: bigint): boolean {
  return value >= 0n;
}
/** Validate principal is non-empty string */
export function isNonEmptyPrincipal(principal: string): boolean {
  return typeof principal === 'string' && principal.length > 0;
}
/** Validate event type is known */
export function isKnownEventType(type: string): boolean {
  return ['message-created', 'channel-created', 'member-joined', 'member-kicked', 'reaction-added'].includes(type);
}
