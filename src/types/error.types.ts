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
export const ERROR_TYPE_CONST_1 = 1;
export const ERROR_TYPE_CONST_2 = 2;
export const ERROR_TYPE_CONST_3 = 3;
export const ERROR_TYPE_CONST_4 = 4;
export const ERROR_TYPE_CONST_5 = 5;
export const ERROR_TYPE_CONST_6 = 6;
export const ERROR_TYPE_CONST_7 = 7;
export const ERROR_TYPE_CONST_8 = 8;
export const ERROR_TYPE_CONST_9 = 9;
export const ERROR_TYPE_CONST_10 = 10;
export const ERROR_TYPE_CONST_11 = 11;
export const ERROR_TYPE_CONST_12 = 12;
export const ERROR_TYPE_CONST_13 = 13;
export const ERROR_TYPE_CONST_14 = 14;
export const ERROR_TYPE_CONST_15 = 15;
export const ERROR_TYPE_CONST_16 = 16;
export const ERROR_TYPE_CONST_17 = 17;
export const ERROR_TYPE_CONST_18 = 18;
export const ERROR_TYPE_CONST_19 = 19;
export const ERROR_TYPE_CONST_20 = 20;
export const ERROR_TYPE_CONST_21 = 21;
export const ERROR_TYPE_CONST_22 = 22;
export const ERROR_TYPE_CONST_23 = 23;
export const ERROR_TYPE_CONST_24 = 24;
