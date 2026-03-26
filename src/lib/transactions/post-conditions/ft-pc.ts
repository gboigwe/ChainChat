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
