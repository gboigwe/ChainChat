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
/** NFT metadata map */
export const nftMetadataMap = new Map<bigint, NFTMetadata>();
/** Mint a new NFT badge */
export function mintNFT(
  tokenId: NFTTokenId,
  owner: string,
  uri: string,
  blockHeight: bigint,
): NFTMetadata {
  if (nftOwnerMap.has(tokenId)) throw new Error(`Token ${tokenId} already minted`);
  const meta: NFTMetadata = { tokenId, owner, uri, mintedAt: blockHeight };
  nftOwnerMap.set(tokenId, owner);
  nftMetadataMap.set(tokenId, meta);
  return meta;
}
/** Get NFT owner */
export function getNFTOwner(tokenId: NFTTokenId): string | null {
  return nftOwnerMap.get(tokenId) ?? null;
}
/** Get NFT metadata */
export function getNFTMetadata(tokenId: NFTTokenId): NFTMetadata | null {
  return nftMetadataMap.get(tokenId) ?? null;
}
/** Transfer NFT to new owner */
export function transferNFT(
  tokenId: NFTTokenId,
  from: string,
  to: string,
): void {
  const owner = getNFTOwner(tokenId);
  if (owner !== from) throw new Error('Sender is not NFT owner');
  nftOwnerMap.set(tokenId, to);
}
/** Check if principal owns a token */
export function ownsNFT(tokenId: NFTTokenId, principal: string): boolean {
  return getNFTOwner(tokenId) === principal;
}
/** Get all tokens owned by principal */
export function getTokensByOwner(owner: string): NFTTokenId[] {
  const tokens: NFTTokenId[] = [];
  for (const [id, o] of nftOwnerMap) if (o === owner) tokens.push(id);
  return tokens;
}
/** Burn (delete) an NFT */
export function burnNFT(tokenId: NFTTokenId, owner: string): void {
  if (!ownsNFT(tokenId, owner)) throw new Error('Only owner can burn NFT');
  nftOwnerMap.delete(tokenId);
  nftMetadataMap.delete(tokenId);
}
/** NFT badge types for ChainChat */
export type BadgeType = 'early-adopter' | 'power-user' | 'moderator' | 'vip';
/** Badge metadata extended */
export interface BadgeNFT extends NFTMetadata {
  badgeType: BadgeType;
  channelId?: bigint;
}
/** Badge NFT map */
export const badgeMap = new Map<bigint, BadgeNFT>();
/** Mint a badge NFT for a user */
export function mintBadge(
  tokenId: NFTTokenId,
  owner: string,
  badgeType: BadgeType,
  blockHeight: bigint,
  channelId?: bigint,
): BadgeNFT {
  const base = mintNFT(tokenId, owner, `badge:${badgeType}`, blockHeight);
  const badge: BadgeNFT = { ...base, badgeType, channelId };
  badgeMap.set(tokenId, badge);
  return badge;
}
/** Get badge by token ID */
export function getBadge(tokenId: NFTTokenId): BadgeNFT | null {
  return badgeMap.get(tokenId) ?? null;
}
/** Total NFT supply */
export function nftTotalSupply(): number {
  return nftOwnerMap.size;
}
/** Check if token exists */
export function nftExists(tokenId: NFTTokenId): boolean {
  return nftOwnerMap.has(tokenId);
}
/** Get all badge types owned by principal */
export function getBadgesByOwner(owner: string): BadgeNFT[] {
  return getTokensByOwner(owner)
    .map(id => getBadge(id))
    .filter((b): b is BadgeNFT => b !== null);
}
/** Check if principal has a specific badge type */
export function hasBadge(owner: string, badgeType: BadgeType): boolean {
  return getBadgesByOwner(owner).some(b => b.badgeType === badgeType);
}
/** NFT transfer event record */
export interface NFTTransferEvent {
  tokenId: NFTTokenId;
  from: string;
  to: string;
  blockHeight: bigint;
}
/** Transfer event log */
export const transferEventLog: NFTTransferEvent[] = [];
/** Transfer with event logging */
export function transferNFTWithLog(
  tokenId: NFTTokenId,
  from: string,
  to: string,
  blockHeight: bigint,
): void {
  transferNFT(tokenId, from, to);
  transferEventLog.push({ tokenId, from, to, blockHeight });
}
/** Get count of NFTs with specific badge type */
export function countBadgesByType(badgeType: BadgeType): number {
  let count = 0;
  for (const badge of badgeMap.values()) if (badge.badgeType === badgeType) count++;
  return count;
}
/** Get all NFT metadata as array */
export function getAllNFTMetadata(): NFTMetadata[] {
  return Array.from(nftMetadataMap.values());
}
