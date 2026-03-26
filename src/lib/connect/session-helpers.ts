// Additional session management helpers
import type { UserSessionData } from './auth';
/** Check if session data is expired */
export function isSessionExpired(data: UserSessionData): boolean {
  // No expiry in basic Stacks Connect — always valid
  return false;
}
/** Get username from session */
export function getUsername(data: UserSessionData): string | null {
  return data.username ?? null;
}
/** Get identity address from session */
export function getIdentityAddress(data: UserSessionData): string | null {
  return data.identityAddress ?? null;
}
