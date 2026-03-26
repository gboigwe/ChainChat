// STX post-condition builders
/** Fungible condition codes for STX */
export enum FungibleConditionCode {
  Equal = 'sent-equal-to',
  Greater = 'sent-greater-than',
  GreaterEqual = 'sent-greater-than-or-equal-to',
  Less = 'sent-less-than',
  LessEqual = 'sent-less-than-or-equal-to',
}
/** Standard STX post-condition structure */
export interface StandardSTXPostCondition {
  type: 'stx';
  principal: { type: 'standard'; address: string };
  conditionCode: FungibleConditionCode;
  amount: bigint;
}
/** Contract STX post-condition */
export interface ContractSTXPostCondition {
  type: 'stx';
  principal: { type: 'contract'; address: string; contractName: string };
  conditionCode: FungibleConditionCode;
  amount: bigint;
}
/** Make a standard STX post-condition */
export function makeStandardSTXPostCondition(
  address: string,
  conditionCode: FungibleConditionCode,
  amount: bigint,
): StandardSTXPostCondition {
  return { type: 'stx', principal: { type: 'standard', address }, conditionCode, amount };
}
/** Make a contract STX post-condition */
export function makeContractSTXPostCondition(
  address: string,
  contractName: string,
  conditionCode: FungibleConditionCode,
  amount: bigint,
): ContractSTXPostCondition {
  return { type: 'stx', principal: { type: 'contract', address, contractName }, conditionCode, amount };
}
/** Condition code: exactly equal */
export const STX_SEND_EQUAL = FungibleConditionCode.Equal;
/** Condition code: less than or equal (send at most) */
export const STX_SEND_AT_MOST = FungibleConditionCode.LessEqual;
export const STX_PC_1 = 1;
export const STX_PC_2 = 2;
export const STX_PC_3 = 3;
export const STX_PC_4 = 4;
export const STX_PC_5 = 5;
export const STX_PC_6 = 6;
export const STX_PC_7 = 7;
export const STX_PC_8 = 8;
export const STX_PC_9 = 9;
