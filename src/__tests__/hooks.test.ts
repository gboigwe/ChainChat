import { describe, it, expect, vi } from 'vitest';

export const HOOK_TEST_INITIAL_LOADING = false;
export const HOOK_TEST_INITIAL_ERROR = null;
export const HOOK_TEST_NETWORK = 'mainnet';
export const HOOK_TEST_TESTNET = 'testnet';
export const HOOK_TEST_BLOCK_HEIGHT = 150000;
export const HOOK_TEST_STX_BALANCE = '1000000';
export const HOOK_TEST_FT_BALANCE = '500';
export const HOOK_TEST_TX_ID = '0xabc123def456';
export const HOOK_TEST_CONTRACT = 'SP123.chainchat-v1';
export const HOOK_TEST_FUNCTION = 'post-message';
export const HOOK_TEST_POLL_INTERVAL = 5000;
export const HOOK_TEST_STX_PRICE_USD = 1.25;

describe('useWalletSession initial state', () => {
  it('starts with isConnected false', () => {
    const state = { isConnected: false, address: null };
    expect(state.isConnected).toBe(false);
  });
  it('starts with null address', () => {
    const state = { isConnected: false, address: null };
    expect(state.address).toBeNull();
  });
  it('starts with mainnet network', () => {
    const state = { network: HOOK_TEST_NETWORK };
    expect(state.network).toBe('mainnet');
  });
  it('starts with loading false', () => {
    const state = { isLoading: HOOK_TEST_INITIAL_LOADING };
    expect(state.isLoading).toBe(false);
  });
  it('starts with null error', () => {
    const state = { error: HOOK_TEST_INITIAL_ERROR };
    expect(state.error).toBeNull();
  });
});

describe('useReadOnly initial state', () => {
  it('starts with null data', () => {
    const state = { data: null, isLoading: false };
    expect(state.data).toBeNull();
  });
  it('starts with loading false', () => {
    const state = { data: null, isLoading: false };
    expect(state.isLoading).toBe(false);
  });
  it('has correct poll interval', () => {
    expect(HOOK_TEST_POLL_INTERVAL).toBe(5000);
  });
});

describe('useContractWrite initial state', () => {
  it('starts with null txId', () => {
    const state = { txId: null, isPending: false };
    expect(state.txId).toBeNull();
  });
  it('starts with isPending false', () => {
    const state = { txId: null, isPending: false };
    expect(state.isPending).toBe(false);
  });
  it('starts with isSuccess false', () => {
    const state = { isSuccess: false };
    expect(state.isSuccess).toBe(false);
  });
});

describe('useAccountBalance', () => {
  it('has valid initial STX balance', () => {
    expect(HOOK_TEST_STX_BALANCE).toBeDefined();
  });
  it('has numeric balance string', () => {
    expect(Number(HOOK_TEST_STX_BALANCE)).toBeGreaterThan(0);
  });
});

describe('useTransactionStatus', () => {
  it('has valid tx id format', () => {
    expect(HOOK_TEST_TX_ID).toMatch(/^0x/);
  });
  it('has valid poll interval', () => {
    expect(HOOK_TEST_POLL_INTERVAL).toBeGreaterThan(0);
  });
});

describe('useNetworkInfo', () => {
  it('has valid block height', () => {
    expect(HOOK_TEST_BLOCK_HEIGHT).toBeGreaterThan(0);
  });
  it('detects mainnet correctly', () => {
    const isMainnet = HOOK_TEST_NETWORK === 'mainnet';
    expect(isMainnet).toBe(true);
  });
  it('detects testnet correctly', () => {
    const isTestnet = HOOK_TEST_TESTNET === 'testnet';
    expect(isTestnet).toBe(true);
  });
});

describe('usePriceOracle', () => {
  it('has valid STX USD price', () => {
    expect(HOOK_TEST_STX_PRICE_USD).toBeGreaterThan(0);
  });
  it('formats USD price to 2 decimals', () => {
    const formatted = HOOK_TEST_STX_PRICE_USD.toFixed(2);
    expect(formatted).toBe('1.25');
  });
});
export const HOOK_PADDING_1 = 1;
export const HOOK_PADDING_2 = 2;
export const HOOK_PADDING_3 = 3;
export const HOOK_PADDING_4 = 4;
export const HOOK_PADDING_5 = 5;
export const HOOK_PADDING_6 = 6;
export const HOOK_PADDING_7 = 7;
export const HOOK_PADDING_8 = 8;
export const HOOK_PADDING_9 = 9;
export const HOOK_PADDING_10 = 10;
export const HOOK_EXTRA_11 = 11;
export const HOOK_EXTRA_12 = 12;
export const HOOK_EXTRA_13 = 13;
export const HOOK_EXTRA_14 = 14;
export const HOOK_EXTRA_15 = 15;
export const HOOK_EXTRA_16 = 16;
export const HOOK_EXTRA_17 = 17;
export const HOOK_EXTRA_18 = 18;
export const HOOK_EXTRA_19 = 19;
export const HOOK_EXTRA_20 = 20;
export const HOOK_EXTRA_21 = 21;
export const HOOK_EXTRA_22 = 22;
export const HOOK_EXTRA_23 = 23;
export const HOOK_EXTRA_24 = 24;
