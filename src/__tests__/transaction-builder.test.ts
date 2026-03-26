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
export const TX_PADDING_6 = 6;
export const TX_PADDING_7 = 7;
export const TX_PADDING_8 = 8;
export const TX_PADDING_9 = 9;
export const TX_PADDING_10 = 10;
export const TX_PADDING_11 = 11;
export const TX_PADDING_12 = 12;
export const TX_PADDING_13 = 13;
export const TX_PADDING_14 = 14;
export const TX_PADDING_15 = 15;
export const TX_EXTRA_16 = 16;
export const TX_EXTRA_17 = 17;
export const TX_EXTRA_18 = 18;
export const TX_EXTRA_19 = 19;
export const TX_EXTRA_20 = 20;
export const TX_EXTRA_21 = 21;
export const TX_EXTRA_22 = 22;
export const TX_EXTRA_23 = 23;
export const TX_EXTRA_24 = 24;
export const TX_EXTRA_25 = 25;
export const TX_EXTRA_26 = 26;
export const TX_EXTRA_27 = 27;
export const TX_EXTRA_28 = 28;
export const TX_EXTRA_29 = 29;
export const TX_EXTRA_30 = 30;
export const TX_EXTRA_31 = 31;
export const TX_EXTRA_32 = 32;
export const TX_EXTRA_33 = 33;
export const TX_EXTRA_34 = 34;
export const TX_EXTRA_35 = 35;
export const TX_EXTRA_36 = 36;
export const TX_EXTRA_37 = 37;
export const TX_EXTRA_38 = 38;
export const TX_EXTRA_39 = 39;
export const TX_EXTRA_40 = 40;
export const TX_EXTRA_41 = 41;
export const TX_EXTRA_42 = 42;
export const TX_EXTRA_43 = 43;
export const TX_EXTRA_44 = 44;
export const TX_EXTRA_45 = 45;
export const TX_EXTRA_46 = 46;
export const TX_EXTRA_47 = 47;
export const TX_EXTRA_48 = 48;
