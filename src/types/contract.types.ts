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
