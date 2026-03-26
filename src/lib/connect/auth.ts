// Stacks Connect authentication helpers
/** Auth options passed to openAuth */
export interface AuthOptions {
  appDetails: { name: string; icon: string };
  onFinish?: (payload: UserSessionData) => void;
  onCancel?: () => void;
  network?: string;
}
/** User session data returned after auth */
export interface UserSessionData {
  username?: string;
  profile?: UserProfile;
  identityAddress?: string;
  appPrivateKey?: string;
  hubUrl?: string;
}
/** User profile data */
export interface UserProfile {
  stxAddress: { mainnet: string; testnet: string };
  btcAddress?: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
}
/** Session state */
export interface SessionState {
  isSignedIn: boolean;
  userData: UserSessionData | null;
  network: string;
}
/** Build default auth options */
export function buildAuthOptions(
  appName: string,
  appIcon: string,
  onFinish: (data: UserSessionData) => void,
  onCancel?: () => void,
): AuthOptions {
  return { appDetails: { name: appName, icon: appIcon }, onFinish, onCancel };
}
/** Parse user session from storage */
export function parseUserSession(raw: string): UserSessionData | null {
  try {
    return JSON.parse(raw) as UserSessionData;
  } catch {
    return null;
  }
}
/** Get user session from localStorage */
export function getUserSession(): UserSessionData | null {
  try {
    const raw = localStorage.getItem('blockstack-session');
    if (!raw) return null;
    return parseUserSession(raw);
  } catch {
    return null;
  }
}
/** Get user data from session */
export function getUserData(): UserSessionData | null {
  return getUserSession();
}
/** Clear user session from storage */
export function clearSession(): void {
  try {
    localStorage.removeItem('blockstack-session');
  } catch {
    // ignore
  }
}
/** Check if user is signed in */
export function isSignedIn(): boolean {
  return getUserSession() !== null;
}
/** Get Stacks address for a given network */
export function getStacksAddress(
  userData: UserSessionData,
  network: 'mainnet' | 'testnet',
): string | null {
  return userData.profile?.stxAddress[network] ?? null;
}
/** Get current address based on network env */
export function getCurrentAddress(
  userData: UserSessionData,
  isMainnet: boolean,
): string | null {
  return getStacksAddress(userData, isMainnet ? 'mainnet' : 'testnet');
}
/** Session storage key */
export const SESSION_KEY = 'blockstack-session';
/** App details for ChainChat */
export const CHAINCHAT_APP_DETAILS = {
  name: 'ChainChat',
  icon: '/favicon.ico',
} as const;
/** Persist session data to localStorage */
export function persistSession(data: UserSessionData): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}
/** Merge partial user profile into existing */
export function mergeProfile(
  existing: UserSessionData,
  updates: Partial<UserProfile>,
): UserSessionData {
  return {
    ...existing,
    profile: { ...existing.profile, ...updates } as UserProfile,
  };
}
/** Auth event types */
export type AuthEvent = 'sign-in' | 'sign-out' | 'session-updated';
/** Auth event listener type */
export type AuthEventListener = (event: AuthEvent, data?: UserSessionData) => void;
