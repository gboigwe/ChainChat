/**
 * Post-condition builder utilities for Stacks transactions
 * Provides type-safe helpers to construct STX and FT post-conditions
 */

import {
  makeStandardSTXPostCondition,
  makeContractSTXPostCondition,
  makeStandardFungiblePostCondition,
  makeContractFungiblePostCondition,
  createAssetInfo,
  FungibleConditionCode,
  type PostCondition,
} from '@stacks/transactions';
import { type StacksAddress, type ContractId, type MicroStx, type TokenAmount } from '../types/stacks';

// ─── STX Post-Conditions ──────────────────────────────────────────────────────

/**
 * Assert that a standard address sends at most `amount` STX
 */
export function stxSendMax(sender: StacksAddress | string, amount: MicroStx | bigint): PostCondition {
  return makeStandardSTXPostCondition(
    sender.toString(),
    FungibleConditionCode.LessEqual,
    amount
  );
}

/**
 * Assert that a standard address sends exactly `amount` STX
 */
export function stxSendExact(sender: StacksAddress | string, amount: MicroStx | bigint): PostCondition {
  return makeStandardSTXPostCondition(sender.toString(), FungibleConditionCode.Equal, amount);
}

/**
 * Assert that a contract sends at most `amount` STX
 */
export function contractStxSendMax(
  contractId: ContractId | string,
  amount: MicroStx | bigint
): PostCondition {
  const [address, name] = contractId.toString().split('.');
  return makeContractSTXPostCondition(address, name, FungibleConditionCode.LessEqual, amount);
}

/**
 * Assert that a contract sends exactly `amount` STX
 */
export function contractStxSendExact(
  contractId: ContractId | string,
  amount: MicroStx | bigint
): PostCondition {
  const [address, name] = contractId.toString().split('.');
  return makeContractSTXPostCondition(address, name, FungibleConditionCode.Equal, amount);
}

// ─── Fungible Token Post-Conditions ───────────────────────────────────────────

export interface FtPostConditionOptions {
  sender: StacksAddress | string;
  tokenContractId: ContractId | string;
  tokenName: string;
  amount: TokenAmount | bigint;
  condition?: 'exact' | 'max' | 'min';
}

/**
 * Create a fungible token post-condition for a standard address
 */
export function ftPostCondition(options: FtPostConditionOptions): PostCondition {
  const [tokenAddress, tokenContractName] = options.tokenContractId.toString().split('.');
  const assetInfo = createAssetInfo(tokenAddress, tokenContractName, options.tokenName);

  const code = options.condition === 'min'
    ? FungibleConditionCode.GreaterEqual
    : options.condition === 'max'
    ? FungibleConditionCode.LessEqual
    : FungibleConditionCode.Equal;

  return makeStandardFungiblePostCondition(
    options.sender.toString(),
    code,
    options.amount,
    assetInfo
  );
}

/**
 * Create a fungible token post-condition for a contract sender
 */
export function contractFtPostCondition(
  contractId: ContractId | string,
  tokenContractId: ContractId | string,
  tokenName: string,
  amount: TokenAmount | bigint,
  condition: 'exact' | 'max' | 'min' = 'exact'
): PostCondition {
  const [contractAddress, contractName] = contractId.toString().split('.');
  const [tokenAddress, tokenContractName] = tokenContractId.toString().split('.');
  const assetInfo = createAssetInfo(tokenAddress, tokenContractName, tokenName);

  const code = condition === 'min'
    ? FungibleConditionCode.GreaterEqual
    : condition === 'max'
    ? FungibleConditionCode.LessEqual
    : FungibleConditionCode.Equal;

  return makeContractFungiblePostCondition(
    contractAddress,
    contractName,
    code,
    amount,
    assetInfo
  );
}

// ─── Composite Builders ───────────────────────────────────────────────────────

/**
 * Build post-conditions for a simple STX transfer
 */
export function buildStxTransferPostConditions(
  sender: StacksAddress | string,
  amount: MicroStx | bigint
): PostCondition[] {
  return [stxSendExact(sender, amount)];
}

/**
 * Build post-conditions for a vault deposit
 */
export function buildVaultDepositPostConditions(
  sender: StacksAddress | string,
  amount: MicroStx | bigint
): PostCondition[] {
  return [stxSendMax(sender, amount)];
}

/**
 * Empty post-condition list (use with PostConditionMode.Allow)
 */
export const NO_POST_CONDITIONS: PostCondition[] = [];
