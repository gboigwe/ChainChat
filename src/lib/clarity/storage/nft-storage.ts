// NFT map patterns for chat attachments and badges
/** NFT token ID type */
export type NFTTokenId = bigint;
/** NFT owner map key */
export interface NFTOwnerKey {
  tokenId: NFTTokenId;
}
/** NFT metadata stored in map */
export interface NFTMetadata {
  tokenId: NFTTokenId;
  owner: string;
  uri: string;
  mintedAt: bigint;
}
/** NFT ownership map */
export const nftOwnerMap = new Map<bigint, string>();
