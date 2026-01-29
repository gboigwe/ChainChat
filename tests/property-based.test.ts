import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('Property-Based Tests - Invariants', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Vault Balance Invariants', () => {
    it('should maintain total deposits equal to sum of user balances', () => {
      const users = [wallet1, wallet2, wallet3];
      const deposits = [5000, 7000, 3000];
      let expectedTotal = 0;

      // Users deposit
      users.forEach((user, index) => {
        simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(deposits[index])],
          user
        );
        expectedTotal += deposits[index];
      });

      // Verify total deposits
      const { result: totalDeposits } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-total-deposits',
        [],
        deployer
      );

      expect(totalDeposits).toBeUint(expectedTotal);

      // Verify sum of individual balances matches total
      let sumOfBalances = 0;
      users.forEach((user) => {
        const { result: balance } = simnet.callReadOnlyFn(
          'quantum-ledger',
          'get-user-balance',
          [Cl.principal(user)],
          deployer
        );
        sumOfBalances += Number(Cl.unwrapUInt(balance));
      });

      expect(sumOfBalances).toBe(expectedTotal);
    });

    it('should maintain balance >= 0 invariant', () => {
      // Deposit
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Check balance is positive
      const { result: balanceAfterDeposit } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(Number(Cl.unwrapUInt(balanceAfterDeposit))).toBeGreaterThanOrEqual(
        0
      );

      // Withdraw
      simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(1000)],
        wallet1
      );

      // Check balance is still non-negative
      const { result: balanceAfterWithdraw } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(Number(Cl.unwrapUInt(balanceAfterWithdraw))).toBeGreaterThanOrEqual(
        0
      );
    });

    it('should preserve conservation of funds across operations', () => {
      // Initial state
      const initialDeposit = 10000;

      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(initialDeposit)],
        wallet1
      );

      const { result: initialBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      // Authorize and allocate
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      const allocateAmount = 5000;
      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(allocateAmount)],
        deployer
      );

      const { result: balanceAfterAllocate } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      // Return funds
      simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(allocateAmount)],
        deployer
      );

      const { result: finalBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      // Final balance should equal initial (conservation of funds)
      expect(finalBalance).toEqual(initialBalance);
    });

    it('should maintain user balance + allocated funds = original deposit', () => {
      const deposit = 10000;

      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(deposit)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      const allocate1 = 3000;
      const allocate2 = 2000;

      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(allocate1)],
        deployer
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(allocate2)],
        deployer
      );

      const { result: remainingBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      // Balance + allocated = original deposit
      const expected = deposit - allocate1 - allocate2;
      expect(remainingBalance).toBeUint(expected);
    });
  });

  describe('Role Assignment Invariants', () => {
    it('should maintain role uniqueness per user', () => {
      // Grant same role twice
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      // Should have role exactly once
      const { result: roles } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      const rolesList = Cl.unwrapList(Cl.unwrapOk(roles));
      expect(rolesList.length).toBe(1);
    });

    it('should maintain role consistency after revoke-grant cycles', () => {
      // Grant role
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(2)],
        deployer
      );

      // Multiple revoke-grant cycles
      for (let i = 0; i < 5; i++) {
        simnet.callPublicFn(
          'zephyr-gate',
          'revoke-role',
          [Cl.principal(wallet1), Cl.uint(2)],
          deployer
        );

        simnet.callPublicFn(
          'zephyr-gate',
          'grant-role',
          [Cl.principal(wallet1), Cl.uint(2)],
          deployer
        );
      }

      // Should still have the role
      const { result: hasRole } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), Cl.uint(2)],
        deployer
      );

      expect(hasRole).toBeBool(true);
    });

    it('should maintain role count consistency', () => {
      const roles = [1, 2, 3, 4];

      // Grant all roles
      roles.forEach((role) => {
        simnet.callPublicFn(
          'zephyr-gate',
          'grant-role',
          [Cl.principal(wallet1), Cl.uint(role)],
          deployer
        );
      });

      // Verify count
      const { result: allRoles } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      const rolesList = Cl.unwrapList(Cl.unwrapOk(allRoles));
      expect(rolesList.length).toBe(4);

      // Revoke one role
      simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), Cl.uint(2)],
        deployer
      );

      // Verify count decreased
      const { result: afterRevoke } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      const rolesAfter = Cl.unwrapList(Cl.unwrapOk(afterRevoke));
      expect(rolesAfter.length).toBe(3);
    });
  });

  describe('Strategy Counter Invariants', () => {
    it('should maintain strategy counter accuracy', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(15000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Allocate to 3 strategies
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn(
          'quantum-ledger',
          'allocate-funds',
          [Cl.principal(wallet1), Cl.uint(2000)],
          deployer
        );
      }

      // Verify counter
      const { result: count } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(count).toBeUint(3);

      // Return from 2 strategies
      for (let i = 0; i < 2; i++) {
        simnet.callPublicFn(
          'quantum-ledger',
          'return-funds',
          [Cl.principal(wallet1), Cl.uint(2000)],
          deployer
        );
      }

      // Counter should decrement
      const { result: afterReturn } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(afterReturn).toBeUint(1);
    });

    it('should maintain strategy counter >= 0', () => {
      // Initial counter should be 0
      const { result: initialCount } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(Number(Cl.unwrapUInt(initialCount))).toBeGreaterThanOrEqual(0);

      // After operations, counter should remain >= 0
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(2000)],
        deployer
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(2000)],
        deployer
      );

      const { result: finalCount } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(Number(Cl.unwrapUInt(finalCount))).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Authorization Invariants', () => {
    it('should maintain authorization state consistency', () => {
      // Authorize
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(wallet3)],
        deployer
      );

      // Contract should be able to allocate
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      const { result: allocate1 } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet3
      );

      expect(allocate1).toBeOk(Cl.uint(1000));

      // Revoke
      simnet.callPublicFn(
        'quantum-ledger',
        'revoke-contract',
        [Cl.principal(wallet3)],
        deployer
      );

      // Contract should not be able to allocate
      const { result: allocate2 } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet3
      );

      expect(allocate2).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED

      // Re-authorize
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(wallet3)],
        deployer
      );

      // Should work again
      const { result: allocate3 } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet3
      );

      expect(allocate3).toBeOk(Cl.uint(1000));
    });
  });

  describe('Pause State Invariants', () => {
    it('should maintain pause state consistency', () => {
      // Pause
      simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);

      // Operations should fail
      const { result: deposit1 } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(deposit1).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED

      // Resume
      simnet.callPublicFn('quantum-ledger', 'resume-vault', [], deployer);

      // Operations should work
      const { result: deposit2 } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(deposit2).toBeOk(Cl.uint(1000));
    });

    it('should maintain emergency mode immutability', () => {
      // Activate emergency mode
      simnet.callPublicFn(
        'quantum-ledger',
        'activate-emergency-mode',
        [],
        deployer
      );

      // Vault should be paused
      const { result: deposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(deposit).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED

      // Resume should not work (emergency mode overrides)
      simnet.callPublicFn('quantum-ledger', 'resume-vault', [], deployer);

      // Still paused due to emergency mode
      const { result: depositAfter } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // This will fail because emergency mode was activated
      expect(depositAfter).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED
    });
  });

  describe('Commutative Operation Tests', () => {
    it('should maintain order independence for deposits', () => {
      // Scenario 1: wallet1 then wallet2
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(2000)],
        wallet2
      );

      const { result: total1 } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-total-deposits',
        [],
        deployer
      );

      // Reset by withdrawing
      simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(1000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(2000)],
        wallet2
      );

      // Scenario 2: wallet2 then wallet1
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(2000)],
        wallet2
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      const { result: total2 } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-total-deposits',
        [],
        deployer
      );

      // Order should not matter
      expect(total1).toEqual(total2);
    });
  });
});
