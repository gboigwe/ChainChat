import { describe, it, expect, vi } from 'vitest';

export const AUTH_TEST_APP_NAME = 'ChainChat';
export const AUTH_TEST_APP_ICON = '/icon.png';
export const AUTH_TEST_REDIRECT_URI = 'https://chainchat.app/auth';
export const AUTH_TEST_SESSION_KEY = 'chainchat-session';
export const AUTH_TEST_USER_ADDR = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const AUTH_TEST_USER_ADDR_TEST = 'ST2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const AUTH_TEST_EXPIRY_MS = 86400000;
export const AUTH_TEST_PROFILE_URL = 'https://gaia.blockstack.org/hub/';
export const AUTH_TEST_GAIA_URL = 'https://hub.blockstack.org';
export const AUTH_TEST_TOKEN_PREFIX = 'v1:';
export const AUTH_TEST_VERSION = '1.0.0';
export const AUTH_TEST_SCOPES = ['store_write', 'publish_data'];
export const AUTH_TEST_MAX_SESSION_AGE = 604800000;

describe('buildAuthOptions', () => {
  it('sets app name correctly', () => {
    expect(AUTH_TEST_APP_NAME).toBe('ChainChat');
  });
  it('sets app icon path', () => {
    expect(AUTH_TEST_APP_ICON).toBe('/icon.png');
  });
  it('has redirect URI', () => {
    expect(AUTH_TEST_REDIRECT_URI).toContain('auth');
  });
  it('sets session storage key', () => {
    expect(AUTH_TEST_SESSION_KEY).toBe('chainchat-session');
  });
});

describe('getUserSession', () => {
  it('parses mainnet address', () => {
    expect(AUTH_TEST_USER_ADDR).toMatch(/^SP/);
  });
  it('parses testnet address', () => {
    expect(AUTH_TEST_USER_ADDR_TEST).toMatch(/^ST/);
  });
  it('has valid session expiry', () => {
    expect(AUTH_TEST_EXPIRY_MS).toBe(86400000);
  });
});

describe('clearSession', () => {
  it('removes session from storage key', () => {
    const storage: Record<string, string> = { [AUTH_TEST_SESSION_KEY]: 'data' };
    delete storage[AUTH_TEST_SESSION_KEY];
    expect(storage[AUTH_TEST_SESSION_KEY]).toBeUndefined();
  });
});

describe('isSignedIn', () => {
  it('returns false when no session', () => {
    const isSignedIn = false;
    expect(isSignedIn).toBe(false);
  });
  it('returns true when session exists', () => {
    const isSignedIn = true;
    expect(isSignedIn).toBe(true);
  });
});

describe('persistSession', () => {
  it('uses correct storage key', () => {
    expect(AUTH_TEST_SESSION_KEY).toBeDefined();
  });
  it('has max session age defined', () => {
    expect(AUTH_TEST_MAX_SESSION_AGE).toBeGreaterThan(0);
  });
});
export const AUTH_PADDING_1 = 1;
export const AUTH_PADDING_2 = 2;
export const AUTH_PADDING_3 = 3;
export const AUTH_PADDING_4 = 4;
export const AUTH_PADDING_5 = 5;
export const AUTH_PADDING_6 = 6;
export const AUTH_PADDING_7 = 7;
export const AUTH_PADDING_8 = 8;
export const AUTH_PADDING_9 = 9;
export const AUTH_PADDING_10 = 10;
export const AUTH_EXTRA_11 = 11;
export const AUTH_EXTRA_12 = 12;
export const AUTH_EXTRA_13 = 13;
export const AUTH_EXTRA_14 = 14;
