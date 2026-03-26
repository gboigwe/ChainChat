// FT (fungible token) transfer transaction builder
/** FT transfer transaction options */
export interface FTTransferTxOptions {
  contractAddress: string;
  contractName: string;
  tokenName: string;
  recipient: string;
  amount: bigint;
  memo?: string;
  fee: bigint;
  nonce: bigint;
  network: string;
  anchorMode: 'on-chain-only' | 'off-chain-only' | 'any';
}
