// Extended message validation utilities
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, isAsciiOnly } from './message-types';

/** Validation result with field-level errors */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
