// Fungible token post-condition builders
import { FungibleConditionCode } from './stx-pc';
/** FT post-condition structure */
export interface StandardFTPostCondition {
  type: 'ft';
  principal: { type: 'standard'; address: string };
  conditionCode: FungibleConditionCode;
  amount: bigint;
  assetInfo: { contractAddress: string; contractName: string; assetName: string };
}
/** Contract FT post-condition */
export interface ContractFTPostCondition {
  type: 'ft';
  principal: { type: 'contract'; address: string; contractName: string };
  conditionCode: FungibleConditionCode;
  amount: bigint;
  assetInfo: { contractAddress: string; contractName: string; assetName: string };
}
/** Make standard FT post-condition */
export function makeStandardFungiblePostCondition(
  address: string,
  conditionCode: FungibleConditionCode,
  amount: bigint,
  contractAddress: string,
  contractName: string,
  assetName: string,
): StandardFTPostCondition {
  return {
    type: 'ft',
    principal: { type: 'standard', address },
    conditionCode,
    amount,
    assetInfo: { contractAddress, contractName, assetName },
  };
}
/** Make contract FT post-condition */
export function makeContractFungiblePostCondition(
  address: string,
  contractName: string,
  conditionCode: FungibleConditionCode,
  amount: bigint,
  assetContractAddress: string,
  assetContractName: string,
  assetName: string,
): ContractFTPostCondition {
  return {
    type: 'ft',
    principal: { type: 'contract', address, contractName },
    conditionCode,
    amount,
    assetInfo: { contractAddress: assetContractAddress, contractName: assetContractName, assetName },
  };
}
export const FT_PC_1 = 1;
