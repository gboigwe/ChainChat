// Storage operation validators
import { NFT_URI_MAX_LENGTH, NFT_MAX_SUPPLY, FT_MAX_SUPPLY } from './constants';
/** Validate NFT URI length */
export function isValidNFTUri(uri: string): boolean {
  return uri.length > 0 && uri.length <= NFT_URI_MAX_LENGTH;
}
