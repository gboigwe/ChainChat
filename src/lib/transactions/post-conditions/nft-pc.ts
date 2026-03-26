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
/** Contract NFT post-condition */
export interface ContractNFTPostCondition {
  type: 'nft';
  principal: { type: 'contract'; address: string; contractName: string };
  conditionCode: NonFungibleConditionCode;
  assetInfo: { contractAddress: string; contractName: string; assetName: string };
  tokenId: unknown;
}
/** Make contract NFT post-condition */
export function makeContractNonFungiblePostCondition(
  address: string,
  contractName: string,
  conditionCode: NonFungibleConditionCode,
  contractAddress: string,
  assetContractName: string,
  assetName: string,
  tokenId: unknown,
): ContractNFTPostCondition {
  return {
    type: 'nft',
    principal: { type: 'contract', address, contractName },
    conditionCode,
    assetInfo: { contractAddress, contractName: assetContractName, assetName },
    tokenId,
  };
}
export const NFT_PC_1 = 1;
