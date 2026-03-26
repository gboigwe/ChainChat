/**
 * Hiro API client for Stacks blockchain data
 * Provides typed wrappers around the Hiro API endpoints
 */

import { getApiUrl } from './stacks-network';
import { type StacksNetworkName } from '../config/network-config';
import {
  type StacksAddress,
  type TxId,
  type ContractId,
  type StacksBlockHeight,
  type MicroStx,
  type AccountBalances,
  type TransactionStatus,
  toTxId,
  toMicroStx,
} from '../types/stacks';

// ─── API Client ───────────────────────────────────────────────────────────────

export class HiroApiClient {
  private baseUrl: string;
  private network: StacksNetworkName;

  constructor(network?: StacksNetworkName) {
    this.network = network ?? 'mainnet';
    this.baseUrl = getApiUrl(this.network);
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Hiro API error ${response.status} for ${path}: ${errBody}`);
    }

    return response.json() as Promise<T>;
  }

  // ─── Account Endpoints ────────────────────────────────────────────────────

  /**
   * Get account balances (STX + fungible tokens)
   */
  async getAccountBalances(address: StacksAddress | string): Promise<AccountBalances> {
    const data = await this.fetch<any>(`/extended/v1/address/${address}/balances`);
    return {
      stx: {
        balance: toMicroStx(data.stx.balance),
        totalSent: toMicroStx(data.stx.total_sent),
        totalReceived: toMicroStx(data.stx.total_received),
        locked: toMicroStx(data.stx.locked),
      },
      fungibleTokens: Object.fromEntries(
        Object.entries(data.fungible_tokens || {}).map(([k, v]: [string, any]) => [
          k,
          { balance: BigInt(v.balance) },
        ])
      ),
      nonFungibleTokens: Object.fromEntries(
        Object.entries(data.non_fungible_tokens || {}).map(([k, v]: [string, any]) => [
          k,
          { count: v.count },
        ])
      ),
    };
  }

  /**
   * Get account nonce
   */
  async getAccountNonce(address: StacksAddress | string): Promise<bigint> {
    const data = await this.fetch<{ possible_next_nonce: number }>(
      `/v2/accounts/${address}?proof=0`
    );
    return BigInt(data.possible_next_nonce);
  }

  /**
   * Get account transaction history
   */
  async getAccountTransactions(
    address: StacksAddress | string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ total: number; results: any[] }> {
    const params = new URLSearchParams({
      limit: String(options?.limit ?? 20),
      offset: String(options?.offset ?? 0),
    });
    return this.fetch(`/extended/v1/address/${address}/transactions?${params}`);
  }

  /**
   * Get pending mempool transactions for an address
   */
  async getAddressMempoolTransactions(
    address: StacksAddress | string
  ): Promise<{ total: number; results: any[] }> {
    return this.fetch(`/extended/v1/address/${address}/mempool`);
  }

  // ─── Transaction Endpoints ────────────────────────────────────────────────

  /**
   * Get transaction details by txId
   */
  async getTransaction(txId: TxId | string): Promise<any> {
    return this.fetch(`/extended/v1/tx/${txId}`);
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: TxId | string): Promise<TransactionStatus> {
    const tx = await this.getTransaction(txId);
    return tx.tx_status as TransactionStatus;
  }

  // ─── Contract Endpoints ────────────────────────────────────────────────────

  /**
   * Call a read-only contract function
   */
  async callReadOnly(
    contractId: ContractId | string,
    functionName: string,
    functionArgs: string[],
    senderAddress: string
  ): Promise<any> {
    const [contractAddress, contractName] = contractId.split('.');
    return this.fetch(
      `/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
      {
        method: 'POST',
        body: JSON.stringify({ sender: senderAddress, arguments: functionArgs }),
      }
    );
  }

  /**
   * Get contract ABI/interface
   */
  async getContractInterface(contractId: ContractId | string): Promise<any> {
    const [contractAddress, contractName] = contractId.split('.');
    return this.fetch(`/v2/contracts/interface/${contractAddress}/${contractName}`);
  }

  /**
   * Get contract source code
   */
  async getContractSource(contractId: ContractId | string): Promise<{ source: string }> {
    const [contractAddress, contractName] = contractId.split('.');
    return this.fetch(`/v2/contracts/source/${contractAddress}/${contractName}`);
  }

  /**
   * Get contract events
   */
  async getContractEvents(
    contractId: ContractId | string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ results: any[] }> {
    const [contractAddress, contractName] = contractId.split('.');
    const params = new URLSearchParams({
      limit: String(options?.limit ?? 20),
      offset: String(options?.offset ?? 0),
    });
    return this.fetch(
      `/extended/v1/contract/${contractAddress}.${contractName}/events?${params}`
    );
  }

  // ─── Block Endpoints ──────────────────────────────────────────────────────

  /**
   * Get the latest block information
   */
  async getLatestBlock(): Promise<{ height: number; burn_block_height: number; block_time: number }> {
    return this.fetch('/extended/v2/blocks?limit=1').then((r: any) => r.results[0]);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _client: HiroApiClient | null = null;

/**
 * Get or create the singleton HiroApiClient
 */
export function getHiroClient(network?: StacksNetworkName): HiroApiClient {
  if (!_client) {
    _client = new HiroApiClient(network);
  }
  return _client;
}
