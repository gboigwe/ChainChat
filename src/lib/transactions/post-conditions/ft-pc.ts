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
export const FT_PC_2 = 2;
export const FT_PC_3 = 3;
export const FT_PC_4 = 4;
export const FT_PC_5 = 5;
export const FT_PC_6 = 6;
export const FT_PC_7 = 7;
export const FT_PC_8 = 8;
export const FT_PC_9 = 9;
export const FT_PC_10 = 10;
export const FT_PC_11 = 11;
export const FT_PC_12 = 12;
