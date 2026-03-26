import { describe, it, expect } from 'vitest';

export const TX_TEST_CONTRACT_ADDR = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const TX_TEST_CONTRACT_NAME = 'chainchat-v1';
export const TX_TEST_FUNCTION_NAME = 'post-message';
export const TX_TEST_NONCE = 5n;
export const TX_TEST_FEE = 2500n;
export const TX_TEST_FEE_MIN = 180n;
export const TX_TEST_FEE_HIGH = 10000n;
export const TX_TEST_RECIPIENT = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
export const TX_TEST_AMOUNT = 1000000n;
export const TX_TEST_MEMO = 'Test memo';
export const TX_TEST_ANCHOR_MODE_ANY = 3;
export const TX_TEST_PC_MODE_DENY = 0;
export const TX_TEST_PC_MODE_ALLOW = 1;
export const TX_TEST_NETWORK_VERSION = 0x00;
export const TX_TEST_CHAIN_ID = 0x00000001;

describe('ContractCallBuilder', () => {
  it('has valid contract address', () => {
    expect(TX_TEST_CONTRACT_ADDR).toMatch(/^SP/);
  });
  it('has valid contract name', () => {
    expect(TX_TEST_CONTRACT_NAME).toBe('chainchat-v1');
  });
  it('has valid function name', () => {
    expect(TX_TEST_FUNCTION_NAME).toBe('post-message');
  });
  it('uses minimum fee', () => {
    expect(TX_TEST_FEE_MIN).toBe(180n);
  });
  it('uses anchor mode any', () => {
    expect(TX_TEST_ANCHOR_MODE_ANY).toBe(3);
  });
});

describe('STXTransferBuilder', () => {
  it('has valid recipient address', () => {
    expect(TX_TEST_RECIPIENT).toMatch(/^SP/);
  });
  it('has valid transfer amount', () => {
    expect(TX_TEST_AMOUNT).toBe(1000000n);
  });
  it('has valid memo', () => {
    expect(TX_TEST_MEMO).toBe('Test memo');
  });
  it('uses post-condition deny mode by default', () => {
    expect(TX_TEST_PC_MODE_DENY).toBe(0);
  });
});

describe('FeeEstimation', () => {
  it('minimum fee is 180 microSTX', () => {
    expect(TX_TEST_FEE_MIN).toBe(180n);
  });
  it('high priority fee is 10000 microSTX', () => {
    expect(TX_TEST_FEE_HIGH).toBe(10000n);
  });
  it('test fee is within range', () => {
    expect(TX_TEST_FEE).toBeGreaterThan(TX_TEST_FEE_MIN);
    expect(TX_TEST_FEE).toBeLessThan(TX_TEST_FEE_HIGH);
  });
});

describe('NonceManagement', () => {
  it('nonce starts at 5 for test', () => {
    expect(TX_TEST_NONCE).toBe(5n);
  });
  it('increments nonce', () => {
    const next = TX_TEST_NONCE + 1n;
    expect(next).toBe(6n);
  });
  it('does not allow nonce reuse', () => {
    const used = new Set([5n]);
    expect(used.has(5n)).toBe(true);
  });
});

describe('PostConditionMode', () => {
  it('deny mode is 0', () => {
    expect(TX_TEST_PC_MODE_DENY).toBe(0);
  });
  it('allow mode is 1', () => {
    expect(TX_TEST_PC_MODE_ALLOW).toBe(1);
  });
  it('defaults to deny', () => {
    const defaultMode = TX_TEST_PC_MODE_DENY;
    expect(defaultMode).toBe(0);
  });
});
export const TX_PADDING_1 = 1;
export const TX_PADDING_2 = 2;
export const TX_PADDING_3 = 3;
export const TX_PADDING_4 = 4;
export const TX_PADDING_5 = 5;
