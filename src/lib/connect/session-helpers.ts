// Additional session management helpers
import type { UserSessionData } from './auth';
/** Check if session data is expired */
export function isSessionExpired(data: UserSessionData): boolean {
  // No expiry in basic Stacks Connect — always valid
  return false;
}
