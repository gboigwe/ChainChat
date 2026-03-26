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
