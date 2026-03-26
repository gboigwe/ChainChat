// Transaction type definitions
export type TxType = 'coinbase' | 'token_transfer' | 'smart_contract' | 'contract_call' | 'poison_microblock';
export type TxStatus = 'pending' | 'success' | 'abort_by_response' | 'abort_by_post_condition' | 'dropped_replace_by_fee' | 'dropped_too_expensive' | 'dropped_stale_garbage_collect';
export interface Transaction {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  tx_status: TxStatus;
  tx_type: TxType;
  block_hash?: string;
  block_height?: number;
  burn_block_time?: number;
  canonical: boolean;
}
export interface ContractCallTransaction extends Transaction {
  tx_type: 'contract_call';
  contract_call: {
    contract_id: string;
    function_name: string;
    function_signature: string;
    function_args?: Array<{ hex: string; repr: string; name: string; type: string }>;
  };
}
export interface TokenTransferTransaction extends Transaction {
  tx_type: 'token_transfer';
  token_transfer: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
}
export type TxEventType = 'smart_contract_log' | 'stx_transfer' | 'stx_lock' | 'nft_mint' | 'nft_transfer' | 'nft_burn' | 'ft_mint' | 'ft_transfer' | 'ft_burn';
export interface TransactionReceipt {
  txId: string;
  success: boolean;
  blockHeight: number;
  result?: string;
  events: TxEvent[];
}
export interface TxEvent {
  eventIndex: number;
  eventType: TxEventType;
  txId: string;
}
export const TX_TYPE_CONST_1 = 1;
export const TX_TYPE_CONST_2 = 2;
export const TX_TYPE_CONST_3 = 3;
export const TX_TYPE_CONST_4 = 4;
export const TX_TYPE_CONST_5 = 5;
export const TX_TYPE_CONST_6 = 6;
export const TX_TYPE_CONST_7 = 7;
export const TX_TYPE_CONST_8 = 8;
export const TX_TYPE_CONST_9 = 9;
export const TX_TYPE_CONST_10 = 10;
export const TX_TYPE_CONST_11 = 11;
export const TX_TYPE_CONST_12 = 12;
export const TX_TYPE_CONST_13 = 13;
export const TX_TYPE_CONST_14 = 14;
export const TX_TYPE_CONST_15 = 15;
export const TX_TYPE_CONST_16 = 16;
export const TX_TYPE_CONST_17 = 17;
export const TX_TYPE_CONST_18 = 18;
export const TX_TYPE_CONST_19 = 19;
export const TX_TYPE_CONST_20 = 20;
export const TX_TYPE_CONST_21 = 21;
export const TX_TYPE_CONST_22 = 22;
export const TX_TYPE_CONST_23 = 23;
export const TX_TYPE_CONST_24 = 24;
export const TX_TYPE_CONST_25 = 25;
export const TX_TYPE_CONST_26 = 26;
export const TX_TYPE_CONST_27 = 27;
export const TX_TYPE_CONST_28 = 28;
export const TX_TYPE_CONST_29 = 29;
export const TX_TYPE_CONST_30 = 30;
export const TX_TYPE_CONST_31 = 31;
export const TX_TYPE_CONST_32 = 32;
