// Clarity contract type definitions
export interface ContractIdentifier {
  contractAddress: string;
  contractName: string;
}
export interface ContractInterface {
  functions: FunctionABI[];
  variables: VariableABI[];
  maps: MapABI[];
  fungible_tokens: TokenABI[];
  non_fungible_tokens: TokenABI[];
  epoch: string;
  clarity_version: string;
}
export interface FunctionABI {
  name: string;
  access: 'public' | 'read_only' | 'private';
  args: Array<{ name: string; type: string | object }>;
  outputs: { type: string | object };
}
export interface VariableABI {
  name: string;
  type: string | object;
  access: 'variable' | 'constant';
}
export interface MapABI {
  name: string;
  key: string | object;
  value: string | object;
}
export interface TokenABI {
  name: string;
}
export interface EventABI {
  name: string;
  type: 'stx_asset' | 'fungible_token_asset' | 'non_fungible_token_asset' | 'smart_contract_log';
}
export const CONTRACT_TYPE_CONST_1 = 1;
export const CONTRACT_TYPE_CONST_2 = 2;
export const CONTRACT_TYPE_CONST_3 = 3;
export const CONTRACT_TYPE_CONST_4 = 4;
export const CONTRACT_TYPE_CONST_5 = 5;
export const CONTRACT_TYPE_CONST_6 = 6;
export const CONTRACT_TYPE_CONST_7 = 7;
export const CONTRACT_TYPE_CONST_8 = 8;
export const CONTRACT_TYPE_CONST_9 = 9;
export const CONTRACT_TYPE_CONST_10 = 10;
export const CONTRACT_TYPE_CONST_11 = 11;
export const CONTRACT_TYPE_CONST_12 = 12;
export const CONTRACT_TYPE_CONST_13 = 13;
export const CONTRACT_TYPE_CONST_14 = 14;
export const CONTRACT_TYPE_CONST_15 = 15;
export const CONTRACT_TYPE_CONST_16 = 16;
export const CONTRACT_TYPE_CONST_17 = 17;
export const CONTRACT_TYPE_CONST_18 = 18;
export const CONTRACT_TYPE_CONST_19 = 19;
export const CONTRACT_TYPE_CONST_20 = 20;
