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
