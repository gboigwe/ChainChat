// NFT post-condition builders
/** NFT condition codes */
export enum NonFungibleConditionCode {
  DoesNotSend = 'not-sent',
  Sends = 'sent',
}
/** Standard NFT post-condition */
export interface StandardNFTPostCondition {
  type: 'nft';
  principal: { type: 'standard'; address: string };
  conditionCode: NonFungibleConditionCode;
  assetInfo: { contractAddress: string; contractName: string; assetName: string };
  tokenId: unknown;
}
/** Make standard NFT post-condition */
export function makeStandardNonFungiblePostCondition(
  address: string,
  conditionCode: NonFungibleConditionCode,
  contractAddress: string,
  contractName: string,
  assetName: string,
  tokenId: unknown,
): StandardNFTPostCondition {
  return {
    type: 'nft',
    principal: { type: 'standard', address },
    conditionCode,
    assetInfo: { contractAddress, contractName, assetName },
    tokenId,
  };
}
