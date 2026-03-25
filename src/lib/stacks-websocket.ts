/**
 * Stacks WebSocket client for real-time events
 * Subscribes to address activity and transaction updates
 */

import { getWsUrl } from './stacks-network';
import { type StacksNetworkName } from '../config/network-config';
import { type TxId, type StacksAddress } from '../types/stacks';

export type WsEventType =
  | 'tx_update'
  | 'address_tx_update'
  | 'address_balance_update'
  | 'block'
  | 'microblock';

export interface WsSubscription {
  event: WsEventType;
  payload?: Record<string, string>;
}

export type WsEventCallback = (event: WsEventType, data: any) => void;

/**
 * A lightweight WebSocket wrapper for the Hiro Stacks API
 */
export class StacksWebSocket {
  private ws: WebSocket | null = null;
  private network: StacksNetworkName;
  private callbacks: Map<WsEventType, WsEventCallback[]> = new Map();
  private subscriptions: WsSubscription[] = [];
  private reconnectAttempts = 0;
  private readonly maxReconnects = 5;
  private readonly reconnectDelayMs = 2000;

  constructor(network?: StacksNetworkName) {
    this.network = network ?? 'mainnet';
  }

  /**
   * Connect and optionally subscribe immediately
   */
  connect(subscriptions?: WsSubscription[]): void {
    if (subscriptions) {
      this.subscriptions = [...this.subscriptions, ...subscriptions];
    }

    const url = getWsUrl(this.network);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.subscriptions.forEach((sub) => this.sendSubscription(sub));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.method as WsEventType;
        const callbacks = this.callbacks.get(eventType) ?? [];
        callbacks.forEach((cb) => cb(eventType, data.params));
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelayMs * this.reconnectAttempts);
      }
    };
  }

  /**
   * Register a callback for a specific event type
   */
  on(event: WsEventType, callback: WsEventCallback): () => void {
    const existing = this.callbacks.get(event) ?? [];
    this.callbacks.set(event, [...existing, callback]);

    // Return unsubscribe function
    return () => {
      const cbs = this.callbacks.get(event) ?? [];
      this.callbacks.set(event, cbs.filter((cb) => cb !== callback));
    };
  }

  /**
   * Subscribe to transaction updates for a specific tx
   */
  subscribeTx(txId: TxId | string, callback: WsEventCallback): () => void {
    const sub: WsSubscription = {
      event: 'tx_update',
      payload: { tx_id: txId.toString() },
    };
    this.subscriptions.push(sub);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(sub);
    }
    return this.on('tx_update', callback);
  }

  /**
   * Subscribe to address activity
   */
  subscribeAddress(address: StacksAddress | string, callback: WsEventCallback): () => void {
    const sub: WsSubscription = {
      event: 'address_tx_update',
      payload: { address: address.toString() },
    };
    this.subscriptions.push(sub);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(sub);
    }
    return this.on('address_tx_update', callback);
  }

  /**
   * Subscribe to new blocks
   */
  subscribeBlocks(callback: WsEventCallback): () => void {
    const sub: WsSubscription = { event: 'block' };
    this.subscriptions.push(sub);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(sub);
    }
    return this.on('block', callback);
  }

  private sendSubscription(sub: WsSubscription): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'subscribe',
        params: { event: sub.event, ...sub.payload },
      })
    );
  }

  /**
   * Close the WebSocket connection
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnects; // Prevent reconnect
    this.ws?.close();
    this.ws = null;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _client: StacksWebSocket | null = null;

export function getStacksWsClient(network?: StacksNetworkName): StacksWebSocket {
  if (!_client) {
    _client = new StacksWebSocket(network);
  }
  return _client;
}
