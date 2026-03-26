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
