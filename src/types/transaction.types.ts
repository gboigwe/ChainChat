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
