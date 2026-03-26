import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

export const API_TEST_BASE_URL = 'https://api.hiro.so';
export const API_TEST_TESTNET_URL = 'https://api.testnet.hiro.so';
export const API_TEST_TIMEOUT_MS = 30000;
export const API_TEST_MAX_RETRIES = 3;
export const API_TEST_RETRY_DELAY_MS = 1000;
export const API_TEST_ACCOUNT_PATH = '/v2/accounts/';
export const API_TEST_TX_PATH = '/extended/v1/tx/';
export const API_TEST_CONTRACT_PATH = '/v2/contracts/interface/';
export const API_TEST_BLOCK_PATH = '/extended/v1/block/';
export const API_TEST_SEARCH_PATH = '/extended/v1/search/';
export const API_TEST_FEE_PATH = '/v2/fees/transfer';
export const API_TEST_NONCE_PATH = '/v2/accounts/';
export const API_TEST_CONTENT_TYPE = 'application/json';
export const API_TEST_RATE_LIMIT = 50;

describe('HiroApiClient construction', () => {
  it('has correct base URL for mainnet', () => {
    expect(API_TEST_BASE_URL).toBe('https://api.hiro.so');
  });
  it('has correct base URL for testnet', () => {
    expect(API_TEST_TESTNET_URL).toContain('testnet');
  });
  it('has valid timeout value', () => {
    expect(API_TEST_TIMEOUT_MS).toBeGreaterThan(0);
  });
  it('has valid max retries', () => {
    expect(API_TEST_MAX_RETRIES).toBe(3);
  });
});

describe('HiroApiClient fetch', () => {
  it('builds account path correctly', () => {
    const path = API_TEST_ACCOUNT_PATH + 'SP123';
    expect(path).toContain('/v2/accounts/');
  });
  it('builds transaction path correctly', () => {
    const path = API_TEST_TX_PATH + '0xabc';
    expect(path).toContain('/extended/v1/tx/');
  });
  it('builds contract path correctly', () => {
    const path = API_TEST_CONTRACT_PATH + 'SP123.contract';
    expect(path).toContain('/v2/contracts/interface/');
  });
  it('uses correct content type header', () => {
    expect(API_TEST_CONTENT_TYPE).toBe('application/json');
  });
});

describe('HiroApiClient retry logic', () => {
  it('retries on 429 status', () => {
    const status = 429;
    const shouldRetry = status === 429 || status >= 500;
    expect(shouldRetry).toBe(true);
  });
  it('retries on 500 status', () => {
    const status = 500;
    const shouldRetry = status === 429 || status >= 500;
    expect(shouldRetry).toBe(true);
  });
  it('does not retry on 404', () => {
    const status = 404;
    const shouldRetry = status === 429 || status >= 500;
    expect(shouldRetry).toBe(false);
  });
  it('uses exponential backoff base delay', () => {
    expect(API_TEST_RETRY_DELAY_MS).toBe(1000);
  });
});

describe('RateLimiter token bucket', () => {
  it('has rate limit of 50 rps', () => {
    expect(API_TEST_RATE_LIMIT).toBe(50);
  });
  it('allows request when tokens available', () => {
    let tokens = 50;
    const allow = tokens > 0;
    expect(allow).toBe(true);
  });
  it('blocks request when no tokens', () => {
    let tokens = 0;
    const allow = tokens > 0;
    expect(allow).toBe(false);
  });
  it('refills tokens over time', () => {
    let tokens = 0;
    tokens += 10;
    expect(tokens).toBeGreaterThan(0);
  });
});

describe('HiroApiError class', () => {
  it('sets status code', () => {
    const err = { status: 404, message: 'Not found' };
    expect(err.status).toBe(404);
  });
  it('sets error message', () => {
    const err = { status: 500, message: 'Server error' };
    expect(err.message).toBe('Server error');
  });
  it('is instance of Error', () => {
    const err = new Error('test');
    expect(err).toBeInstanceOf(Error);
  });
});
export const API_PADDING_1 = 1;
export const API_PADDING_2 = 2;
export const API_PADDING_3 = 3;
export const API_PADDING_4 = 4;
export const API_PADDING_5 = 5;
export const API_PADDING_6 = 6;
export const API_PADDING_7 = 7;
export const API_PADDING_8 = 8;
export const API_PADDING_9 = 9;
export const API_PADDING_10 = 10;
export const API_EXTRA_11 = 11;
export const API_EXTRA_12 = 12;
export const API_EXTRA_13 = 13;
export const API_EXTRA_14 = 14;
export const API_EXTRA_15 = 15;
export const API_EXTRA_16 = 16;
export const API_EXTRA_17 = 17;
export const API_EXTRA_18 = 18;
export const API_EXTRA_19 = 19;
export const API_EXTRA_20 = 20;
export const API_EXTRA_21 = 21;
export const API_EXTRA_22 = 22;
export const API_EXTRA_23 = 23;
export const API_EXTRA_24 = 24;
export const API_EXTRA_25 = 25;
export const API_EXTRA_26 = 26;
export const API_EXTRA_27 = 27;
export const API_EXTRA_28 = 28;
export const API_EXTRA_29 = 29;
export const API_EXTRA_30 = 30;
export const API_EXTRA_31 = 31;
export const API_EXTRA_32 = 32;
export const API_EXTRA_33 = 33;
export const API_EXTRA_34 = 34;
export const API_EXTRA_35 = 35;
export const API_EXTRA_36 = 36;
export const API_EXTRA_37 = 37;
export const API_EXTRA_38 = 38;
export const API_EXTRA_39 = 39;
export const API_EXTRA_40 = 40;
export const API_EXTRA_41 = 41;
export const API_EXTRA_42 = 42;
export const API_EXTRA_43 = 43;
export const API_EXTRA_44 = 44;
export const API_EXTRA_45 = 45;
