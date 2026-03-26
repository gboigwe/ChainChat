/**
 * Stacks contract event decoder
 * Decodes Clarity print events from transaction receipts
 */

import { hexToCV, cvToJSON, cvToValue, type ClarityValue } from '@stacks/transactions';
import { type TxId, type ContractId, type UnixTimestamp } from '../types/stacks';

// ─── Event Types ──────────────────────────────────────────────────────────────

export interface RawContractEvent {
  event_index: number;
  tx_id: string;
  type: string;
  contract_log?: {
    contract_id: string;
    topic: string;
    value: { hex: string; repr: string };
  };
  asset?: {
    asset_event_type: string;
    asset_id: string;
    sender?: string;
    recipient?: string;
    amount?: string;
  };
}

export interface DecodedContractEvent {
  txId: TxId;
  eventIndex: number;
  contractId: ContractId;
  topic: string;
  value: Record<string, unknown>;
  rawHex: string;
}

export interface ContractEventFilter {
  contractId?: string;
  eventName?: string;
  minBlockHeight?: number;
  maxBlockHeight?: number;
}

// ─── Decoder ─────────────────────────────────────────────────────────────────

/**
 * Decode a raw contract log event into a typed record
 */
export function decodeContractEvent(raw: RawContractEvent): DecodedContractEvent | null {
  if (raw.type !== 'contract_log' || !raw.contract_log) return null;

  const { contract_id, topic, value } = raw.contract_log;

  try {
    const cv = hexToCV(value.hex);
    const decoded = cvToJSON(cv) as Record<string, unknown>;

    return {
      txId: raw.tx_id as TxId,
      eventIndex: raw.event_index,
      contractId: contract_id as ContractId,
      topic,
      value: decoded,
      rawHex: value.hex,
    };
  } catch {
    return null;
  }
}

/**
 * Decode all contract log events from a list of raw events
 */
export function decodeContractEvents(rawEvents: RawContractEvent[]): DecodedContractEvent[] {
  return rawEvents
    .map(decodeContractEvent)
    .filter((e): e is DecodedContractEvent => e !== null);
}

/**
 * Filter decoded events by contract and/or event name
 */
export function filterEvents(
  events: DecodedContractEvent[],
  filter: ContractEventFilter
): DecodedContractEvent[] {
  return events.filter((e) => {
    if (filter.contractId && !e.contractId.includes(filter.contractId)) return false;
    if (filter.eventName) {
      const eventField = e.value?.event || e.value?.type || e.value?.event_name;
      if (typeof eventField !== 'string' || !eventField.includes(filter.eventName)) return false;
    }
    return true;
  });
}

/**
 * Extract a typed field from a decoded event
 */
export function getEventField<T>(
  event: DecodedContractEvent,
  field: string,
  defaultValue?: T
): T | undefined {
  const val = event.value[field];
  if (val === undefined || val === null) return defaultValue;
  return val as T;
}

/**
 * Get the timestamp from a Clarity v4 event (stacks-block-time)
 */
export function getEventTimestamp(event: DecodedContractEvent): UnixTimestamp | null {
  const ts = event.value.timestamp;
  if (typeof ts === 'number') return ts as UnixTimestamp;
  if (typeof ts === 'string') return parseInt(ts, 10) as UnixTimestamp;
  const valueTs = (event.value as any)?.value?.timestamp;
  if (typeof valueTs === 'number') return valueTs as UnixTimestamp;
  return null;
}

/**
 * Check if a decoded event matches a specific event name
 */
export function isEventType(event: DecodedContractEvent, eventName: string): boolean {
  const eventField = event.value?.event ?? event.value?.type;
  return typeof eventField === 'string' && eventField === eventName;
}

/**
 * Parse hex-encoded Clarity value to JSON
 */
export function parseHexClarityValue(hex: string): Record<string, unknown> | null {
  try {
    const cv = hexToCV(hex);
    return cvToJSON(cv) as Record<string, unknown>;
  } catch {
    return null;
  }
}
