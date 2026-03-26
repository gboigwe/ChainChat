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
