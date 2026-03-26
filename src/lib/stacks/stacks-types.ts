// Shared TypeScript types for Stacks.js SDK integration
/** Contract call options */
export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  network: string;
}
/** Read-only call result */
export interface ReadOnlyResult {
  okay: boolean;
  result?: string;
  cause?: string;
}
/** Broadcast transaction result */
export interface BroadcastResult {
  txid?: string;
  error?: string;
  reason?: string;
}
/** Transaction event types */
export type TxEventType = 'smart_contract_log' | 'stx_transfer' | 'stx_lock' | 'nft_mint' | 'nft_transfer' | 'nft_burn' | 'ft_mint' | 'ft_transfer' | 'ft_burn';
/** STX transfer event */
export interface STXTransferEvent {
  type: 'stx_transfer';
  amount: string;
  sender: string;
  recipient: string;
}
/** Smart contract log event */
export interface ContractLogEvent {
  type: 'smart_contract_log';
  contract_id: string;
  topic: string;
  value: string;
}
/** NFT transfer event */
export interface NFTTransferEvent {
  type: 'nft_transfer';
  asset_identifier: string;
  sender: string;
  recipient: string;
  value: string;
}
/** FT transfer event */
export interface FTTransferEvent {
  type: 'ft_transfer';
  asset_identifier: string;
  amount: string;
  sender: string;
  recipient: string;
}
/** Gas estimation result */
export interface FeeEstimate {
  fee: bigint;
  feeRate: number;
  estimatedSize: number;
}
/** Nonce information */
export interface NonceInfo {
  possibleNextNonce: number;
  detectedMissingNonces: number[];
  lastExecutedTxNonce?: number;
}
/** Account info response */
export interface AccountInfo {
  balance: string;
  locked: string;
  unlock_height: number;
  nonce: number;
  balance_proof: string;
  nonce_proof: string;
}
