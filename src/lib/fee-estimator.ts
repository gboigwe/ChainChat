/**
 * Fee estimator for Stacks transactions
 * Queries node for fee estimates and applies heuristics
 */

import { getApiUrl } from './stacks-network';
import { type StacksNetworkName } from '../config/network-config';
import { type MicroStx, toMicroStx } from '../types/stacks';

export type FeeMultiplier = 'slow' | 'normal' | 'fast' | 'urgent';

const FEE_MULTIPLIERS: Record<FeeMultiplier, number> = {
  slow: 0.5,
  normal: 1.0,
  fast: 1.5,
  urgent: 2.5,
};

const FALLBACK_FEES: Record<FeeMultiplier, bigint> = {
  slow: BigInt(750),
  normal: BigInt(1500),
  fast: BigInt(3000),
  urgent: BigInt(6000),
};

const MAX_FEE = BigInt(500_000); // 0.5 STX cap
const MIN_FEE = BigInt(180); // Minimum relay fee

export interface FeeEstimate {
  slow: MicroStx;
  normal: MicroStx;
  fast: MicroStx;
  urgent: MicroStx;
  estimatedAt: number;
  source: 'node' | 'fallback';
}

export interface TransactionFeeEstimate {
  fee: MicroStx;
  multiplier: FeeMultiplier;
  estimatedAt: number;
}

/**
 * Fetch fee estimates from the Stacks node
 */
export async function fetchFeeEstimates(
  network?: StacksNetworkName
): Promise<FeeEstimate> {
  const apiUrl = getApiUrl(network);
  const now = Date.now();

  try {
    const response = await fetch(`${apiUrl}/v2/fees/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_payload: '0000000000', // minimal payload for estimation
        estimated_len: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Fee estimation failed: ${response.status}`);
    }

    const data = await response.json();
    const baseFee = BigInt(data.estimated_cost_scalar ?? 1500);

    const clamp = (fee: bigint): MicroStx =>
      (fee < MIN_FEE ? MIN_FEE : fee > MAX_FEE ? MAX_FEE : fee) as MicroStx;

    return {
      slow: clamp(BigInt(Math.floor(Number(baseFee) * FEE_MULTIPLIERS.slow))),
      normal: clamp(BigInt(Math.floor(Number(baseFee) * FEE_MULTIPLIERS.normal))),
      fast: clamp(BigInt(Math.floor(Number(baseFee) * FEE_MULTIPLIERS.fast))),
      urgent: clamp(BigInt(Math.floor(Number(baseFee) * FEE_MULTIPLIERS.urgent))),
      estimatedAt: now,
      source: 'node',
    };
  } catch {
    return {
      slow: FALLBACK_FEES.slow as MicroStx,
      normal: FALLBACK_FEES.normal as MicroStx,
      fast: FALLBACK_FEES.fast as MicroStx,
      urgent: FALLBACK_FEES.urgent as MicroStx,
      estimatedAt: now,
      source: 'fallback',
    };
  }
}

/**
 * Get fee for a specific speed tier
 */
export async function estimateFee(
  multiplier: FeeMultiplier = 'normal',
  network?: StacksNetworkName
): Promise<MicroStx> {
  const estimates = await fetchFeeEstimates(network);
  return estimates[multiplier];
}

/**
 * Simple contract call fee estimate based on arg count
 */
export function estimateContractCallFee(
  argCount: number,
  multiplier: FeeMultiplier = 'normal'
): MicroStx {
  const base = BigInt(1500);
  const perArg = BigInt(100);
  const raw = (base + perArg * BigInt(argCount));
  const scaled = BigInt(Math.floor(Number(raw) * FEE_MULTIPLIERS[multiplier]));
  const clamped = scaled < MIN_FEE ? MIN_FEE : scaled > MAX_FEE ? MAX_FEE : scaled;
  return clamped as MicroStx;
}

/**
 * Format fee in STX for display
 */
export function formatFee(fee: MicroStx): string {
  const stx = Number(fee) / 1_000_000;
  return `${stx.toFixed(6)} STX`;
}
