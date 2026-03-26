// Typed error classes for Stacks operations
export class StacksError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StacksError';
  }
}
export class ContractError extends StacksError {
  constructor(message: string, public readonly contractErrorCode: bigint, public readonly contractId: string) {
    super(message, 'CONTRACT_ERROR');
    this.name = 'ContractError';
  }
}
export class NetworkError extends StacksError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}
