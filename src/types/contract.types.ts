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
