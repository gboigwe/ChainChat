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
