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
