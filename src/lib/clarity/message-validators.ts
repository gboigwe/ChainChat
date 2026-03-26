// Extended message validation utilities
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, isAsciiOnly } from './message-types';

/** Validation result with field-level errors */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate raw message content string */
export function validateContent(content: string): ValidationResult {
  const errors: string[] = [];
  if (content.length < MIN_MESSAGE_LENGTH) errors.push('Content too short');
  if (content.length > MAX_MESSAGE_LENGTH) errors.push('Content too long');
  if (!isAsciiOnly(content)) errors.push('Content must be ASCII only');
  return { valid: errors.length === 0, errors };
}

/** Sanitize message content by trimming whitespace */
export function sanitizeContent(content: string): string {
  return content.trim();
}

/** Check for disallowed characters in channel names */
export function containsDisallowedChars(name: string): boolean {
  return /[^a-zA-Z0-9\-_ ]/.test(name);
}

/** Validate channel name meets contract rules */
export function validateChannelName(name: string): ValidationResult {
  const errors: string[] = [];
  if (name.length === 0) errors.push('Name cannot be empty');
  if (name.length > 64) errors.push('Name too long (max 64)');
  if (containsDisallowedChars(name)) errors.push('Name contains disallowed characters');
  return { valid: errors.length === 0, errors };
}

/** Compose multiple validators, returning first failure */
export function composeValidators(
  ...validators: Array<() => ValidationResult>
): ValidationResult {
  for (const v of validators) {
    const result = v();
    if (!result.valid) return result;
  }
  return { valid: true, errors: [] };
}

/** Validate principal address field on a message */
export function validateSender(sender: string): ValidationResult {
  const errors: string[] = [];
  if (!sender || sender.length === 0) errors.push('Sender cannot be empty');
  if (!sender.startsWith('SP') && !sender.startsWith('ST')) {
    errors.push('Sender must be a valid Stacks principal');
  }
  return { valid: errors.length === 0, errors };
}

/** Validate a full ClarityMessage object */
export function validateMessage(msg: {
  content: string;
  sender: string;
  channelId: bigint;
}): ValidationResult {
  return composeValidators(
    () => validateContent(msg.content),
    () => validateSender(msg.sender),
  );
}

/** Validate reaction code is within allowed range */
export function validateReactionCode(code: bigint): ValidationResult {
  const errors: string[] = [];
  if (code < 1n || code > 5n) errors.push('Reaction code must be between 1 and 5');
  return { valid: errors.length === 0, errors };
}

/** Validate block height is a positive bigint */
export function validateBlockHeight(height: unknown): ValidationResult {
  const errors: string[] = [];
  if (typeof height !== 'bigint') errors.push('Block height must be a bigint');
  else if (height < 0n) errors.push('Block height cannot be negative');
  return { valid: errors.length === 0, errors };
}
