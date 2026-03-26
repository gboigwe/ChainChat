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
export class WalletError extends StacksError {
  constructor(message: string, public readonly provider?: string) {
    super(message, 'WALLET_ERROR');
    this.name = 'WalletError';
  }
}
export class TransactionError extends StacksError {
  constructor(message: string, public readonly txId?: string, public readonly reason?: string) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
  }
}
export class PostConditionError extends StacksError {
  constructor(message: string, public readonly txId: string) {
    super(message, 'POST_CONDITION_ERROR');
    this.name = 'PostConditionError';
  }
}
export type StacksErrorType = 'CONTRACT_ERROR' | 'NETWORK_ERROR' | 'WALLET_ERROR' | 'TRANSACTION_ERROR' | 'POST_CONDITION_ERROR';
export function isStacksError(error: unknown): error is StacksError {
  return error instanceof StacksError;
}
export function isContractError(error: unknown): error is ContractError {
  return error instanceof ContractError;
}
