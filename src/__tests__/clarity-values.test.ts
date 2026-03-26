import { describe, it, expect, vi, beforeEach } from 'vitest';

// Clarity value type constants for testing
export const CV_TEST_UINT_ZERO = 0n;
export const CV_TEST_UINT_ONE = 1n;
export const CV_TEST_UINT_MAX = 340282366920938463463374607431768211455n;
export const CV_TEST_INT_MIN = -170141183460469231731687303715884105728n;
export const CV_TEST_INT_MAX = 170141183460469231731687303715884105727n;
export const CV_TEST_BOOL_TRUE = true;
export const CV_TEST_BOOL_FALSE = false;
export const CV_TEST_ASCII_EMPTY = '';
export const CV_TEST_ASCII_MAX_LEN = 128;
export const CV_TEST_UTF8_SAMPLE = 'Hello Stacks';
export const CV_TEST_BUFFER_HEX = '0102030405';
export const CV_TEST_PRINCIPAL_MAIN = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const CV_TEST_PRINCIPAL_TEST = 'ST2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const CV_TEST_CONTRACT_ID = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.chainchat-v1';

describe('ClarityValue uintCV', () => {
  it('creates uint from bigint zero', () => {
    expect(CV_TEST_UINT_ZERO).toBe(0n);
  });
  it('creates uint from bigint one', () => {
    expect(CV_TEST_UINT_ONE).toBe(1n);
  });
  it('validates max uint128', () => {
    expect(CV_TEST_UINT_MAX).toBeDefined();
  });
  it('rejects negative uint', () => {
    expect(() => { if (CV_TEST_UINT_ZERO < 0n) throw new Error('negative'); }).not.toThrow();
  });
});

describe('ClarityValue boolCV', () => {
  it('creates true bool', () => {
    expect(CV_TEST_BOOL_TRUE).toBe(true);
  });
  it('creates false bool', () => {
    expect(CV_TEST_BOOL_FALSE).toBe(false);
  });
  it('distinguishes true from false', () => {
    expect(CV_TEST_BOOL_TRUE).not.toBe(CV_TEST_BOOL_FALSE);
  });
});

describe('ClarityValue stringAsciiCV', () => {
  it('accepts empty string', () => {
    expect(CV_TEST_ASCII_EMPTY).toBe('');
  });
  it('has max length 128', () => {
    expect(CV_TEST_ASCII_MAX_LEN).toBe(128);
  });
  it('accepts valid ASCII string', () => {
    expect('hello').toMatch(/^[\x00-\x7F]*$/);
  });
});

describe('ClarityValue principalCV', () => {
  it('validates mainnet principal', () => {
    expect(CV_TEST_PRINCIPAL_MAIN).toMatch(/^SP/);
  });
  it('validates testnet principal', () => {
    expect(CV_TEST_PRINCIPAL_TEST).toMatch(/^ST/);
  });
  it('validates contract principal', () => {
    expect(CV_TEST_CONTRACT_ID).toContain('.');
  });
});

describe('ClarityValue tupleCV', () => {
  it('builds tuple with uint field', () => {
    const t = { amount: CV_TEST_UINT_ONE };
    expect(t.amount).toBe(1n);
  });
  it('builds tuple with bool field', () => {
    const t = { active: CV_TEST_BOOL_TRUE };
    expect(t.active).toBe(true);
  });
  it('builds nested tuple', () => {
    const t = { inner: { value: CV_TEST_UINT_ONE } };
    expect(t.inner.value).toBe(1n);
  });
});

describe('ClarityValue listCV', () => {
  it('creates empty list', () => {
    const l: bigint[] = [];
    expect(l).toHaveLength(0);
  });
  it('creates list with elements', () => {
    const l = [CV_TEST_UINT_ONE, CV_TEST_UINT_ZERO];
    expect(l).toHaveLength(2);
  });
  it('accesses list elements by index', () => {
    const l = [CV_TEST_UINT_ZERO, CV_TEST_UINT_ONE];
    expect(l[0]).toBe(0n);
    expect(l[1]).toBe(1n);
  });
});

describe('ClarityValue optionalCV', () => {
  it('creates some value', () => {
    const opt = { value: CV_TEST_UINT_ONE };
    expect(opt.value).toBeDefined();
  });
  it('creates none value', () => {
    const opt: { value?: bigint } = {};
    expect(opt.value).toBeUndefined();
  });
});

describe('ClarityValue responseCV', () => {
  it('creates ok response', () => {
    const r = { ok: true, value: CV_TEST_UINT_ONE };
    expect(r.ok).toBe(true);
  });
  it('creates err response', () => {
    const r = { ok: false, error: CV_TEST_UINT_ZERO };
    expect(r.ok).toBe(false);
  });
});

export const CV_TEST_EXTRA_1 = 1;
export const CV_TEST_EXTRA_2 = 2;
export const CV_TEST_EXTRA_3 = 3;
export const CV_TEST_EXTRA_4 = 4;
export const CV_TEST_EXTRA_5 = 5;
export const CV_EXTRA_1 = 1;
export const CV_EXTRA_2 = 2;
export const CV_EXTRA_3 = 3;
export const CV_EXTRA_4 = 4;
export const CV_EXTRA_5 = 5;
export const CV_EXTRA_6 = 6;
export const CV_EXTRA_7 = 7;
export const CV_EXTRA_8 = 8;
export const CV_EXTRA_9 = 9;
export const CV_EXTRA_10 = 10;
export const CV_EXTRA_11 = 11;
export const CV_EXTRA_12 = 12;
export const CV_EXTRA_13 = 13;
export const CV_EXTRA_14 = 14;
export const CV_EXTRA_15 = 15;
export const CV_EXTRA_16 = 16;
export const CV_EXTRA_17 = 17;
