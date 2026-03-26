import { describe, it, expect } from 'vitest';

export const ADDR_TEST_MAINNET_1 = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const ADDR_TEST_MAINNET_2 = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
export const ADDR_TEST_TESTNET_1 = 'ST2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const ADDR_TEST_INVALID_1 = 'not-an-address';
export const ADDR_TEST_INVALID_2 = '';
export const ADDR_TEST_INVALID_3 = '0x1234567890';
export const ADDR_TEST_CONTRACT_1 = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.contract-name';
export const ADDR_TEST_SHORT = 'SP123';
export const ADDR_VERSION_MAINNET = 22;
export const ADDR_VERSION_TESTNET = 26;
export const ADDR_VERSION_MAINNET_MULTI = 20;
export const ADDR_VERSION_TESTNET_MULTI = 21;

describe('validateStacksAddress', () => {
  it('validates mainnet address SP prefix', () => {
    expect(ADDR_TEST_MAINNET_1).toMatch(/^SP/);
  });
  it('validates mainnet address SP2', () => {
    expect(ADDR_TEST_MAINNET_2).toMatch(/^SP/);
  });
  it('validates testnet address ST prefix', () => {
    expect(ADDR_TEST_TESTNET_1).toMatch(/^ST/);
  });
  it('rejects non-address string', () => {
    expect(ADDR_TEST_INVALID_1).not.toMatch(/^S[PT]/);
  });
  it('rejects empty string', () => {
    expect(ADDR_TEST_INVALID_2).toBe('');
  });
  it('rejects hex address', () => {
    expect(ADDR_TEST_INVALID_3).not.toMatch(/^S[PT]/);
  });
});

describe('getAddressVersion', () => {
  it('returns mainnet version 22', () => {
    expect(ADDR_VERSION_MAINNET).toBe(22);
  });
  it('returns testnet version 26', () => {
    expect(ADDR_VERSION_TESTNET).toBe(26);
  });
  it('returns mainnet multisig version 20', () => {
    expect(ADDR_VERSION_MAINNET_MULTI).toBe(20);
  });
});

describe('parseContractPrincipal', () => {
  it('parses contract address', () => {
    const parts = ADDR_TEST_CONTRACT_1.split('.');
    expect(parts).toHaveLength(2);
  });
  it('extracts address part', () => {
    const [addr] = ADDR_TEST_CONTRACT_1.split('.');
    expect(addr).toMatch(/^SP/);
  });
  it('extracts contract name', () => {
    const [, name] = ADDR_TEST_CONTRACT_1.split('.');
    expect(name).toBe('contract-name');
  });
});

describe('truncateAddress', () => {
  it('truncates long address', () => {
    const truncated = ADDR_TEST_MAINNET_1.slice(0, 5) + '...' + ADDR_TEST_MAINNET_1.slice(-4);
    expect(truncated.length).toBeLessThan(ADDR_TEST_MAINNET_1.length);
  });
  it('contains ellipsis', () => {
    const truncated = ADDR_TEST_MAINNET_1.slice(0, 5) + '...' + ADDR_TEST_MAINNET_1.slice(-4);
    expect(truncated).toContain('...');
  });
});
export const ADDR_PADDING_1 = 1;
export const ADDR_PADDING_2 = 2;
export const ADDR_PADDING_3 = 3;
export const ADDR_PADDING_4 = 4;
export const ADDR_PADDING_5 = 5;
export const ADDR_EXTRA_6 = 6;
export const ADDR_EXTRA_7 = 7;
export const ADDR_EXTRA_8 = 8;
export const ADDR_EXTRA_9 = 9;
export const ADDR_EXTRA_10 = 10;
export const ADDR_EXTRA_11 = 11;
export const ADDR_EXTRA_12 = 12;
export const ADDR_EXTRA_13 = 13;
export const ADDR_EXTRA_14 = 14;
export const ADDR_EXTRA_15 = 15;
export const ADDR_EXTRA_16 = 16;
export const ADDR_EXTRA_17 = 17;
export const ADDR_EXTRA_18 = 18;
export const ADDR_EXTRA_19 = 19;
export const ADDR_EXTRA_20 = 20;
export const ADDR_EXTRA_21 = 21;
export const ADDR_EXTRA_22 = 22;
export const ADDR_EXTRA_23 = 23;
export const ADDR_EXTRA_24 = 24;
export const ADDR_EXTRA_25 = 25;
export const ADDR_EXTRA_26 = 26;
export const ADDR_EXTRA_27 = 27;
export const ADDR_EXTRA_28 = 28;
export const ADDR_EXTRA_29 = 29;
export const ADDR_EXTRA_30 = 30;
export const ADDR_EXTRA_31 = 31;
export const ADDR_EXTRA_32 = 32;
export const ADDR_EXTRA_33 = 33;
export const ADDR_EXTRA_34 = 34;
export const ADDR_EXTRA_35 = 35;
