/**
 * Message signing utilities for Stacks
 * Supports structured data signing and signature verification
 */

import { openSignatureRequestPopup, type SignatureData } from '@stacks/connect';
import { verifyMessageSignatureRsv } from '@stacks/encryption';
import { getPublicKey } from '@stacks/transactions';
import { type StacksAddress } from '../types/stacks';
import { getCurrentNetworkName } from '../config/network-config';

export interface SignMessageOptions {
  message: string;
  appName?: string;
  onFinish?: (data: SignatureData) => void;
  onCancel?: () => void;
}

export interface SignedMessage {
  message: string;
  signature: string;
  publicKey: string;
  address: StacksAddress;
  signedAt: number;
}

export interface VerifyResult {
  isValid: boolean;
  address: StacksAddress | null;
  error?: string;
}

// ─── Signing ──────────────────────────────────────────────────────────────────

/**
 * Request user to sign an arbitrary message via wallet popup
 */
export async function signMessage(options: SignMessageOptions): Promise<SignedMessage> {
  return new Promise((resolve, reject) => {
    openSignatureRequestPopup({
      message: options.message,
      appDetails: {
        name: options.appName ?? 'ChainChat',
        icon: `${window.location.origin}/logo.png`,
      },
      onFinish: (data: SignatureData) => {
        options.onFinish?.(data);

        // Derive address from public key
        const address = deriveAddressFromPublicKey(data.publicKey) as StacksAddress;

        resolve({
          message: options.message,
          signature: data.signature,
          publicKey: data.publicKey,
          address,
          signedAt: Math.floor(Date.now() / 1000),
        });
      },
      onCancel: () => {
        options.onCancel?.();
        reject(new Error('Message signing cancelled'));
      },
    });
  });
}

// ─── Verification ─────────────────────────────────────────────────────────────

/**
 * Verify a signed message matches a given address
 */
export function verifyMessageSignature(
  message: string,
  signature: string,
  address: StacksAddress | string
): VerifyResult {
  try {
    const isValid = verifyMessageSignatureRsv({
      message,
      signature,
      publicKey: address.toString(), // works with publicKey too
    });

    return { isValid, address: address as StacksAddress };
  } catch (error) {
    return {
      isValid: false,
      address: null,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Create a structured sign-in challenge message
 */
export function createSignInChallenge(address: StacksAddress | string, nonce: string): string {
  const timestamp = new Date().toISOString();
  return [
    'Sign in to ChainChat',
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${timestamp}`,
    'This request will not trigger any blockchain transaction or cost any gas.',
  ].join('\n');
}

/**
 * Create a transaction authorization message for display
 */
export function createTxAuthMessage(
  contractId: string,
  functionName: string,
  address: StacksAddress | string
): string {
  return [
    `Authorize ChainChat to call:`,
    `Contract: ${contractId}`,
    `Function: ${functionName}`,
    `Signer: ${address}`,
    `Time: ${new Date().toISOString()}`,
  ].join('\n');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Derive a C32-encoded Stacks address from a public key (simplified)
 */
function deriveAddressFromPublicKey(publicKey: string): string {
  // In a real implementation this would use c32check
  // For now return a placeholder that will be populated from wallet data
  return publicKey;
}

/**
 * Generate a cryptographically random nonce for challenges
 */
export function generateNonce(length = 32): string {
  const bytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
