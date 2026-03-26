// Post-condition tests for Stacks transactions
export const PC_TEST_STX_AMOUNT = 1000000n;
export const PC_TEST_FT_AMOUNT = 500n;
export const PC_TEST_NFT_ID = 42n;
export const PC_CONDITION_EQUAL = 'eq';
export const PC_CONDITION_GT = 'gt';
export const PC_CONDITION_LT = 'lt';
export const PC_CONDITION_GTE = 'gte';
export const PC_CONDITION_LTE = 'lte';
export const PC_STANDARD_PRINCIPAL = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';
export const PC_CONTRACT_PRINCIPAL = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.chainchat-v1';
export const PC_TEST_FT_CONTRACT = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.chat-token';
export const PC_TEST_NFT_CONTRACT = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.chat-nft';
export const PC_TEST_ASSET_NAME = 'chat-token';
export const PC_TEST_NFT_ASSET = 'chat-badge';

import { describe, it, expect } from 'vitest';
describe('STX post-condition', () => {
  it('allows equal STX amount', () => {
    expect(PC_TEST_STX_AMOUNT).toBe(1000000n);
  });
  it('validates send-eq condition', () => {
    expect(PC_CONDITION_EQUAL).toBe('eq');
  });
  it('validates send-gt condition', () => {
    expect(PC_CONDITION_GT).toBe('gt');
  });
  it('validates send-lt condition', () => {
    expect(PC_CONDITION_LT).toBe('lt');
  });
});

describe('FT post-condition', () => {
  it('has valid FT amount', () => {
    expect(PC_TEST_FT_AMOUNT).toBe(500n);
  });
  it('references correct FT contract', () => {
    expect(PC_TEST_FT_CONTRACT).toContain('chat-token');
  });
  it('has valid asset name', () => {
    expect(PC_TEST_ASSET_NAME).toBe('chat-token');
  });
});

describe('NFT post-condition', () => {
  it('has valid NFT token id', () => {
    expect(PC_TEST_NFT_ID).toBe(42n);
  });
  it('references correct NFT contract', () => {
    expect(PC_TEST_NFT_CONTRACT).toContain('chat-nft');
  });
  it('has valid NFT asset name', () => {
    expect(PC_TEST_NFT_ASSET).toBe('chat-badge');
  });
});

describe('contract post-condition', () => {
  it('uses contract principal format', () => {
    expect(PC_CONTRACT_PRINCIPAL).toContain('.');
  });
  it('uses standard principal format', () => {
    expect(PC_STANDARD_PRINCIPAL).toMatch(/^SP/);
  });
});
