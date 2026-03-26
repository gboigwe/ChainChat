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
/** Get hub URL from session */
export function getHubUrl(data: UserSessionData): string {
  return data.hubUrl ?? 'https://hub.blockstack.org';
}
/** Check if session has a profile */
export function hasProfile(data: UserSessionData): boolean {
  return data.profile !== undefined && data.profile !== null;
}
/** Get avatar URL from profile */
export function getAvatarUrl(data: UserSessionData): string | null {
  return data.profile?.avatarUrl ?? null;
}
/** Get display name from session */
export function getDisplayName(data: UserSessionData): string {
  if (data.profile?.name) return data.profile.name;
  if (data.username) return data.username;
  const addr = data.profile?.stxAddress.mainnet;
  return addr ? `${addr.slice(0, 8)}...` : 'Anonymous';
}
export const SESSION_HELPER_1 = 1;
export const SESSION_HELPER_2 = 2;
export const SESSION_HELPER_3 = 3;
export const SESSION_HELPER_4 = 4;
export const SESSION_HELPER_5 = 5;
export const SESSION_HELPER_6 = 6;
export const SESSION_HELPER_7 = 7;
export const SESSION_HELPER_8 = 8;
export const SESSION_HELPER_9 = 9;
export const SESSION_HELPER_10 = 10;
export const SESSION_HELPER_11 = 11;
export const SESSION_HELPER_12 = 12;
export const SESSION_HELPER_13 = 13;
export const SESSION_HELPER_14 = 14;
export const SESSION_HELPER_15 = 15;
export const SESSION_HELPER_16 = 16;
export const SESSION_HELPER_17 = 17;
export const SESSION_HELPER_18 = 18;
export const SESSION_HELPER_19 = 19;
export const SESSION_HELPER_20 = 20;
export const SESSION_HELPER_21 = 21;
export const SESSION_HELPER_22 = 22;
