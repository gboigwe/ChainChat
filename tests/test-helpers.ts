/**
 * Test Helper Utilities
 * Reusable functions for smart contract testing
 */

import { Cl, ClarityValue } from '@stacks/transactions';

/**
 * Test Constants
 */
export const TEST_CONSTANTS = {
  // Error codes
  ERR_UNAUTHORIZED: 401,
  ERR_INSUFFICIENT_BALANCE: 402,
  ERR_VAULT_PAUSED: 403,
  ERR_INVALID_AMOUNT: 404,
  ERR_WITHDRAWAL_LIMIT: 405,
  ERR_INVALID_ROLE: 4601,
  ERR_UNAUTHORIZED_ROLE: 4600,

  // Role IDs
  ROLE_ADMIN: 1,
  ROLE_OPERATOR: 2,
  ROLE_GUARDIAN: 3,
  ROLE_AUDITOR: 4,

  // Contract names (as deployed in Clarinet.toml)
  CONTRACT_ACCESS_CONTROL: 'zephyr-gate',
  CONTRACT_VAULT: 'quantum-ledger',
};

/**
 * Create Clarity uint value
 */
export function uint(value: number | bigint): ClarityValue {
  return Cl.uint(value);
}

/**
 * Create Clarity bool value
 */
export function bool(value: boolean): ClarityValue {
  return Cl.bool(value);
}

/**
 * Create Clarity principal value
 */
export function principal(address: string): ClarityValue {
  return Cl.principal(address);
}

/**
 * Create Clarity list value
 */
export function list(items: ClarityValue[]): ClarityValue {
  return Cl.list(items);
}

/**
 * Unwrap Clarity uint value
 */
export function unwrapUint(value: ClarityValue): number {
  return Number(Cl.unwrapUInt(value));
}

/**
 * Unwrap Clarity bool value
 */
export function unwrapBool(value: ClarityValue): boolean {
  return Cl.unwrapBool(value);
}

/**
 * Unwrap Clarity list value
 */
export function unwrapList(value: ClarityValue): ClarityValue[] {
  return Cl.unwrapList(value);
}

/**
 * Check if value is Ok response
 */
export function isOk(value: ClarityValue): boolean {
  return Cl.isOk(value);
}

/**
 * Check if value is Err response
 */
export function isErr(value: ClarityValue): boolean {
  return Cl.isErr(value);
}

/**
 * Vault Helper Functions
 */
export class VaultHelper {
  constructor(
    private simnet: any,
    private contractName: string = TEST_CONSTANTS.CONTRACT_VAULT
  ) {}

  deposit(amount: number, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'deposit',
      [uint(amount)],
      sender
    );
  }

  withdraw(amount: number, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'withdraw',
      [uint(amount)],
      sender
    );
  }

  getBalance(user: string, caller: string) {
    return this.simnet.callReadOnlyFn(
      this.contractName,
      'get-user-balance',
      [principal(user)],
      caller
    );
  }

  getTotalDeposits(caller: string) {
    return this.simnet.callReadOnlyFn(
      this.contractName,
      'get-total-deposits',
      [],
      caller
    );
  }

  getStrategyCount(user: string, caller: string) {
    return this.simnet.callReadOnlyFn(
      this.contractName,
      'get-user-strategy-count',
      [principal(user)],
      caller
    );
  }

  allocateFunds(user: string, amount: number, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'allocate-funds',
      [principal(user), uint(amount)],
      sender
    );
  }

  returnFunds(user: string, amount: number, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'return-funds',
      [principal(user), uint(amount)],
      sender
    );
  }

  pauseVault(sender: string) {
    return this.simnet.callPublicFn(this.contractName, 'pause-vault', [], sender);
  }

  resumeVault(sender: string) {
    return this.simnet.callPublicFn(this.contractName, 'resume-vault', [], sender);
  }

  activateEmergencyMode(sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'activate-emergency-mode',
      [],
      sender
    );
  }

  emergencyWithdraw(sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'emergency-withdraw',
      [],
      sender
    );
  }

  authorizeContract(contract: string, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'authorize-contract',
      [principal(contract)],
      sender
    );
  }

  revokeContract(contract: string, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'revoke-contract',
      [principal(contract)],
      sender
    );
  }
}

/**
 * Access Control Helper Functions
 */
export class AccessControlHelper {
  constructor(
    private simnet: any,
    private contractName: string = TEST_CONSTANTS.CONTRACT_ACCESS_CONTROL
  ) {}

  grantRole(user: string, roleId: number, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'grant-role',
      [principal(user), uint(roleId)],
      sender
    );
  }

  revokeRole(user: string, roleId: number, sender: string) {
    return this.simnet.callPublicFn(
      this.contractName,
      'revoke-role',
      [principal(user), uint(roleId)],
      sender
    );
  }

  hasRole(user: string, roleId: number, caller: string) {
    return this.simnet.callReadOnlyFn(
      this.contractName,
      'has-role',
      [principal(user), uint(roleId)],
      caller
    );
  }

  getUserRoles(user: string, caller: string) {
    return this.simnet.callReadOnlyFn(
      this.contractName,
      'get-user-roles',
      [principal(user)],
      caller
    );
  }

  getContractOwner(caller: string) {
    return this.simnet.callReadOnlyFn(
      this.contractName,
      'get-contract-owner',
      [],
      caller
    );
  }

  grantAllRoles(user: string, sender: string) {
    [1, 2, 3, 4].forEach((role) => {
      this.grantRole(user, role, sender);
    });
  }

  revokeAllRoles(user: string, sender: string) {
    [1, 2, 3, 4].forEach((role) => {
      this.revokeRole(user, role, sender);
    });
  }
}

/**
 * Test Scenario Builders
 */
export class ScenarioBuilder {
  private operations: Array<() => void> = [];

  addDeposit(
    vaultHelper: VaultHelper,
    amount: number,
    sender: string
  ): ScenarioBuilder {
    this.operations.push(() => {
      vaultHelper.deposit(amount, sender);
    });
    return this;
  }

  addWithdraw(
    vaultHelper: VaultHelper,
    amount: number,
    sender: string
  ): ScenarioBuilder {
    this.operations.push(() => {
      vaultHelper.withdraw(amount, sender);
    });
    return this;
  }

  addRoleGrant(
    aclHelper: AccessControlHelper,
    user: string,
    roleId: number,
    sender: string
  ): ScenarioBuilder {
    this.operations.push(() => {
      aclHelper.grantRole(user, roleId, sender);
    });
    return this;
  }

  addRoleRevoke(
    aclHelper: AccessControlHelper,
    user: string,
    roleId: number,
    sender: string
  ): ScenarioBuilder {
    this.operations.push(() => {
      aclHelper.revokeRole(user, roleId, sender);
    });
    return this;
  }

  addCustomOperation(operation: () => void): ScenarioBuilder {
    this.operations.push(operation);
    return this;
  }

  execute(): void {
    this.operations.forEach((op) => op());
  }

  clear(): ScenarioBuilder {
    this.operations = [];
    return this;
  }
}

/**
 * Assertion Helpers
 */
export class AssertionHelpers {
  static expectOk(result: ClarityValue, expectedValue?: ClarityValue): void {
    if (!isOk(result)) {
      throw new Error(`Expected Ok, got Err: ${result}`);
    }
    if (expectedValue) {
      const unwrapped = Cl.unwrapOk(result);
      if (unwrapped.toString() !== expectedValue.toString()) {
        throw new Error(
          `Expected ${expectedValue}, got ${unwrapped}`
        );
      }
    }
  }

  static expectErr(result: ClarityValue, expectedError?: number): void {
    if (!isErr(result)) {
      throw new Error(`Expected Err, got Ok: ${result}`);
    }
    if (expectedError !== undefined) {
      const error = Number(Cl.unwrapErr(result));
      if (error !== expectedError) {
        throw new Error(`Expected error ${expectedError}, got ${error}`);
      }
    }
  }

  static expectUint(result: ClarityValue, expectedValue: number): void {
    const value = unwrapUint(result);
    if (value !== expectedValue) {
      throw new Error(`Expected ${expectedValue}, got ${value}`);
    }
  }

  static expectBool(result: ClarityValue, expectedValue: boolean): void {
    const value = unwrapBool(result);
    if (value !== expectedValue) {
      throw new Error(`Expected ${expectedValue}, got ${value}`);
    }
  }

  static expectListLength(result: ClarityValue, expectedLength: number): void {
    const list = unwrapList(result);
    if (list.length !== expectedLength) {
      throw new Error(`Expected list length ${expectedLength}, got ${list.length}`);
    }
  }
}

/**
 * Random Data Generators
 */
export class RandomDataGenerator {
  static randomUint(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomBool(): boolean {
    return Math.random() < 0.5;
  }

  static randomRoleId(): number {
    return this.randomUint(1, 4);
  }

  static randomAmount(min: number = 100, max: number = 100000): number {
    return this.randomUint(min, max);
  }

  static randomOperationSequence(length: number): Array<{
    type: 'deposit' | 'withdraw';
    amount: number;
  }> {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push({
        type: this.randomBool() ? 'deposit' : 'withdraw',
        amount: this.randomAmount(),
      });
    }
    return sequence;
  }

  static randomRoleSequence(length: number): Array<{
    type: 'grant' | 'revoke';
    roleId: number;
  }> {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push({
        type: this.randomBool() ? 'grant' : 'revoke',
        roleId: this.randomRoleId(),
      });
    }
    return sequence;
  }
}

/**
 * Test State Manager
 */
export class TestStateManager {
  private userBalances: Map<string, number> = new Map();
  private userRoles: Map<string, Set<number>> = new Map();
  private totalDeposits: number = 0;

  recordDeposit(user: string, amount: number): void {
    const current = this.userBalances.get(user) || 0;
    this.userBalances.set(user, current + amount);
    this.totalDeposits += amount;
  }

  recordWithdraw(user: string, amount: number): void {
    const current = this.userBalances.get(user) || 0;
    this.userBalances.set(user, current - amount);
    this.totalDeposits -= amount;
  }

  recordRoleGrant(user: string, roleId: number): void {
    if (!this.userRoles.has(user)) {
      this.userRoles.set(user, new Set());
    }
    this.userRoles.get(user)!.add(roleId);
  }

  recordRoleRevoke(user: string, roleId: number): void {
    if (this.userRoles.has(user)) {
      this.userRoles.get(user)!.delete(roleId);
    }
  }

  getExpectedBalance(user: string): number {
    return this.userBalances.get(user) || 0;
  }

  getExpectedRoles(user: string): number[] {
    return Array.from(this.userRoles.get(user) || []);
  }

  getExpectedTotalDeposits(): number {
    return this.totalDeposits;
  }

  reset(): void {
    this.userBalances.clear();
    this.userRoles.clear();
    this.totalDeposits = 0;
  }
}

/**
 * Performance Tracking
 */
export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();

  recordExecution(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getAverage(name: string): number {
    const times = this.metrics.get(name) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getMin(name: string): number {
    const times = this.metrics.get(name) || [];
    if (times.length === 0) return 0;
    return Math.min(...times);
  }

  getMax(name: string): number {
    const times = this.metrics.get(name) || [];
    if (times.length === 0) return 0;
    return Math.max(...times);
  }

  getSummary(name: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } {
    return {
      avg: this.getAverage(name),
      min: this.getMin(name),
      max: this.getMax(name),
      count: (this.metrics.get(name) || []).length,
    };
  }

  reset(): void {
    this.metrics.clear();
  }
}

/**
 * Export all helpers
 */
export default {
  TEST_CONSTANTS,
  uint,
  bool,
  principal,
  list,
  unwrapUint,
  unwrapBool,
  unwrapList,
  isOk,
  isErr,
  VaultHelper,
  AccessControlHelper,
  ScenarioBuilder,
  AssertionHelpers,
  RandomDataGenerator,
  TestStateManager,
  PerformanceTracker,
};
