/**
 * Stacks SDK Type Definitions - Extended with Branded Types
 */

// ─── Legacy Types (kept for backward compatibility) ─────────────────────────

export interface StacksTransaction {
  txid: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
}

export interface StacksNetwork {
  version: number;
  chainId: number;
  url: string;
}

// ─── Branded Type Infrastructure ─────────────────────────────────────────────

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

// ─── Address Types ────────────────────────────────────────────────────────────

/** A Stacks principal address (C32 encoded) */
export type StacksAddress = Brand<string, 'StacksAddress'>;

/** A full contract ID in the form <address>.<contract-name> */
export type ContractId = Brand<string, 'ContractId'>;

/** A contract name without address prefix */
export type ContractName = Brand<string, 'ContractName'>;

// ─── Transaction Primitives ───────────────────────────────────────────────────

/** A Stacks transaction ID (hex string) */
export type TxId = Brand<string, 'TxId'>;

/** A transaction nonce value */
export type Nonce = Brand<bigint, 'Nonce'>;

/** Fee amount in micro-STX */
export type MicroStx = Brand<bigint, 'MicroStx'>;

/** STX amount (human readable, 6 decimal places) */
export type StxAmount = Brand<number, 'StxAmount'>;

// ─── Block Types ──────────────────────────────────────────────────────────────

/** A Stacks block height */
export type StacksBlockHeight = Brand<number, 'StacksBlockHeight'>;

/** A Bitcoin block height (burn block height) */
export type BurnBlockHeight = Brand<number, 'BurnBlockHeight'>;

/** Unix timestamp in seconds (matches stacks-block-time in Clarity v4) */
export type UnixTimestamp = Brand<number, 'UnixTimestamp'>;

// ─── Token Types ──────────────────────────────────────────────────────────────

/** Fungible token amount (raw, no decimals applied) */
export type TokenAmount = Brand<bigint, 'TokenAmount'>;

/** Fungible token contract identifier */
export type FtContractId = Brand<ContractId, 'FtContractId'>;

// ─── Constructor Functions ────────────────────────────────────────────────────

export function stacksAddress(addr: string): StacksAddress {
  if (!addr.startsWith('SP') && !addr.startsWith('ST') && !addr.startsWith('S')) {
    throw new Error(`Invalid Stacks address: ${addr}`);
  }
  return addr as StacksAddress;
}

export function toContractId(id: string): ContractId {
  if (!id.includes('.')) throw new Error(`Invalid contract ID (missing dot): ${id}`);
  return id as ContractId;
}

export function toTxId(id: string): TxId {
  const clean = id.startsWith('0x') ? id.slice(2) : id;
  if (!/^[0-9a-f]{64}$/i.test(clean)) throw new Error(`Invalid tx ID: ${id}`);
  return id as TxId;
}

export function toMicroStx(amount: bigint | number | string): MicroStx {
  return BigInt(amount) as MicroStx;
}

export function stxToMicroStx(stx: number): MicroStx {
  return toMicroStx(BigInt(Math.round(stx * 1_000_000)));
}

export function microStxToStx(uSTX: MicroStx): number {
  return Number(uSTX) / 1_000_000;
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type TransactionStatus =
  | 'pending'
  | 'success'
  | 'abort_by_response'
  | 'abort_by_post_condition'
  | 'dropped_replace_by_fee'
  | 'dropped_expired'
  | 'dropped_stale_garbage_collect';

export type TransactionType =
  | 'token_transfer'
  | 'contract_call'
  | 'smart_contract'
  | 'coinbase'
  | 'poison_microblock';

export interface TransactionSummary {
  txId: TxId;
  txStatus: TransactionStatus;
  txType: TransactionType;
  blockHeight: StacksBlockHeight | null;
  burnBlockHeight: BurnBlockHeight | null;
  blockTime: UnixTimestamp | null;
  senderAddress: StacksAddress;
  fee: MicroStx;
  nonce: Nonce;
}

export interface ContractCallSummary extends TransactionSummary {
  contractId: ContractId;
  functionName: string;
}

export interface StxBalances {
  balance: MicroStx;
  totalSent: MicroStx;
  totalReceived: MicroStx;
  locked: MicroStx;
}

export interface AccountBalances {
  stx: StxBalances;
  fungibleTokens: Record<string, { balance: TokenAmount }>;
  nonFungibleTokens: Record<string, { count: number }>;
}

export interface PendingTransaction {
  txId: TxId;
  nonce: Nonce;
  fee: MicroStx;
  senderAddress: StacksAddress;
  receiptTime: UnixTimestamp;
  txType: TransactionType;
}

export interface ContractEvent {
  txId: TxId;
  eventIndex: number;
  type: 'stx_asset' | 'fungible_token_asset' | 'non_fungible_token_asset' | 'smart_contract_log';
  data: Record<string, unknown>;
}
