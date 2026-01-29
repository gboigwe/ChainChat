import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

/**
 * Fuzzing Tests - Discover Edge Cases
 * Tests with random/boundary values to find unexpected behaviors
 */

describe('Fuzzing Tests - Random Input Testing', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Random Amount Fuzzing', () => {
    it('should handle random deposit amounts safely', () => {
      const testAmounts = [
        1, 99, 100, 999, 1000, 9999, 10000, 99999, 100000, 1000000,
        12345, 54321, 77777, 88888, 42069, 13371337,
      ];

      testAmounts.forEach((amount) => {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(amount)],
          wallet1
        );

        // Should either succeed or return a valid error
        expect(result).toBeSome();

        // If successful, verify balance
        if (Cl.isOk(result)) {
          const { result: balance } = simnet.callReadOnlyFn(
            'quantum-ledger',
            'get-user-balance',
            [Cl.principal(wallet1)],
            deployer
          );

          expect(Number(Cl.unwrapUInt(balance))).toBeGreaterThanOrEqual(amount);
        }

        // Withdraw for next iteration
        simnet.callPublicFn(
          'quantum-ledger',
          'withdraw',
          [Cl.uint(amount)],
          wallet1
        );
      });
    });

    it('should handle boundary value deposits', () => {
      const boundaryValues = [
        0, // Zero
        1, // Minimum valid
        100, // Small
        340282366920938463463374607431768211455n, // u128 max
      ];

      boundaryValues.forEach((value) => {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(value)],
          wallet1
        );

        // Zero should fail, others may succeed
        if (value === 0) {
          expect(result).toBeErr(Cl.uint(404)); // ERR-INVALID-AMOUNT
        } else {
          expect(result).toBeSome();
        }
      });
    });

    it('should handle random withdrawal amounts', () => {
      // Deposit first
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000000)],
        wallet1
      );

      const withdrawAmounts = [
        1, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 999999,
        1000000,
      ];

      let remainingBalance = 1000000;

      withdrawAmounts.forEach((amount) => {
        if (amount <= remainingBalance) {
          const { result } = simnet.callPublicFn(
            'quantum-ledger',
            'withdraw',
            [Cl.uint(amount)],
            wallet1
          );

          expect(result).toBeOk(Cl.uint(remainingBalance - amount));
          remainingBalance -= amount;
        } else {
          const { result } = simnet.callPublicFn(
            'quantum-ledger',
            'withdraw',
            [Cl.uint(amount)],
            wallet1
          );

          expect(result).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
        }
      });
    });
  });

  describe('Random Role ID Fuzzing', () => {
    it('should handle random role IDs safely', () => {
      const roleIds = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 255, 256, 1000, 9999, 65535,
        100000,
      ];

      roleIds.forEach((roleId) => {
        const { result } = simnet.callPublicFn(
          'zephyr-gate',
          'grant-role',
          [Cl.principal(wallet1), Cl.uint(roleId)],
          deployer
        );

        // Valid roles: 1-4, others should fail
        if (roleId >= 1 && roleId <= 4) {
          expect(result).toBeOk(Cl.bool(true));

          // Clean up
          simnet.callPublicFn(
            'zephyr-gate',
            'revoke-role',
            [Cl.principal(wallet1), Cl.uint(roleId)],
            deployer
          );
        } else {
          expect(result).toBeErr(Cl.uint(4601)); // ERR-INVALID-ROLE
        }
      });
    });

    it('should handle random role check queries', () => {
      // Grant a known role
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(2)],
        deployer
      );

      const testRoleIds = [1, 2, 3, 4, 5, 10, 99, 255];

      testRoleIds.forEach((roleId) => {
        const { result } = simnet.callReadOnlyFn(
          'zephyr-gate',
          'has-role',
          [Cl.principal(wallet1), Cl.uint(roleId)],
          deployer
        );

        if (roleId === 2) {
          expect(result).toBeBool(true);
        } else {
          expect(result).toBeBool(false);
        }
      });
    });
  });

  describe('Random Operation Sequences', () => {
    it('should handle random deposit-withdraw sequences', () => {
      const operations = [
        { type: 'deposit', amount: 5000 },
        { type: 'withdraw', amount: 1000 },
        { type: 'deposit', amount: 3000 },
        { type: 'withdraw', amount: 2000 },
        { type: 'deposit', amount: 1000 },
        { type: 'withdraw', amount: 6000 },
        { type: 'deposit', amount: 10000 },
        { type: 'withdraw', amount: 10000 },
      ];

      let expectedBalance = 0;

      operations.forEach((op) => {
        if (op.type === 'deposit') {
          simnet.callPublicFn(
            'quantum-ledger',
            'deposit',
            [Cl.uint(op.amount)],
            wallet1
          );
          expectedBalance += op.amount;
        } else {
          const { result } = simnet.callPublicFn(
            'quantum-ledger',
            'withdraw',
            [Cl.uint(op.amount)],
            wallet1
          );

          if (op.amount <= expectedBalance) {
            expect(result).toBeOk(Cl.uint(expectedBalance - op.amount));
            expectedBalance -= op.amount;
          } else {
            expect(result).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
          }
        }
      });
    });

    it('should handle random role grant-revoke sequences', () => {
      const operations = [
        { type: 'grant', role: 1 },
        { type: 'grant', role: 2 },
        { type: 'revoke', role: 1 },
        { type: 'grant', role: 3 },
        { type: 'grant', role: 1 },
        { type: 'revoke', role: 2 },
        { type: 'revoke', role: 3 },
        { type: 'grant', role: 4 },
      ];

      operations.forEach((op) => {
        if (op.type === 'grant') {
          simnet.callPublicFn(
            'zephyr-gate',
            'grant-role',
            [Cl.principal(wallet1), Cl.uint(op.role)],
            deployer
          );
        } else {
          simnet.callPublicFn(
            'zephyr-gate',
            'revoke-role',
            [Cl.principal(wallet1), Cl.uint(op.role)],
            deployer
          );
        }
      });

      // Verify final state
      const { result: roles } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      // Should have roles 1 and 4 (based on sequence)
      const rolesList = Cl.unwrapList(Cl.unwrapOk(roles));
      expect(rolesList.length).toBe(2);
    });

    it('should handle random multi-user operations', () => {
      const users = [wallet1, wallet2, wallet3];
      const operations = [
        { user: 0, action: 'deposit', amount: 1000 },
        { user: 1, action: 'deposit', amount: 2000 },
        { user: 2, action: 'deposit', amount: 1500 },
        { user: 0, action: 'withdraw', amount: 500 },
        { user: 1, action: 'withdraw', amount: 1000 },
        { user: 2, action: 'withdraw', amount: 1500 },
        { user: 0, action: 'deposit', amount: 5000 },
        { user: 1, action: 'deposit', amount: 3000 },
      ];

      const balances = [0, 0, 0];

      operations.forEach((op) => {
        const user = users[op.user];

        if (op.action === 'deposit') {
          simnet.callPublicFn(
            'quantum-ledger',
            'deposit',
            [Cl.uint(op.amount)],
            user
          );
          balances[op.user] += op.amount;
        } else if (op.action === 'withdraw') {
          const { result } = simnet.callPublicFn(
            'quantum-ledger',
            'withdraw',
            [Cl.uint(op.amount)],
            user
          );

          if (op.amount <= balances[op.user]) {
            balances[op.user] -= op.amount;
            expect(result).toBeOk(Cl.uint(balances[op.user]));
          } else {
            expect(result).toBeErr(Cl.uint(402));
          }
        }
      });

      // Verify final balances
      users.forEach((user, index) => {
        const { result } = simnet.callReadOnlyFn(
          'quantum-ledger',
          'get-user-balance',
          [Cl.principal(user)],
          deployer
        );

        expect(result).toBeUint(balances[index]);
      });
    });
  });

  describe('Edge Case Discovery', () => {
    it('should handle rapid state changes', () => {
      // Rapid pause/resume
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);
        simnet.callPublicFn('quantum-ledger', 'resume-vault', [], deployer);
      }

      // Should be able to deposit after
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1000));
    });

    it('should handle authorization churn', () => {
      // Rapid authorize/revoke
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          'quantum-ledger',
          'authorize-contract',
          [Cl.principal(wallet3)],
          deployer
        );

        simnet.callPublicFn(
          'quantum-ledger',
          'revoke-contract',
          [Cl.principal(wallet3)],
          deployer
        );
      }

      // Contract should not be authorized
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet3
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should handle allocation edge cases', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Try to allocate exact balance
      const { result: allocateExact } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );

      expect(allocateExact).toBeOk(Cl.uint(1000));

      // Try to allocate more
      const { result: allocateMore } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(allocateMore).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });

    it('should handle withdrawal with zero balance', () => {
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(100)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });

    it('should handle emergency withdraw with no balance', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'activate-emergency-mode',
        [],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });

    it('should handle multiple emergency withdrawals', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'activate-emergency-mode',
        [],
        deployer
      );

      // First emergency withdraw
      const { result: first } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet1
      );

      expect(first).toBeOk(Cl.uint(5000));

      // Second should fail
      const { result: second } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet1
      );

      expect(second).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });
  });

  describe('Stress Testing', () => {
    it('should handle high volume of deposits', () => {
      for (let i = 0; i < 50; i++) {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(100)],
          wallet1
        );

        expect(result).toBeOk(Cl.uint((i + 1) * 100));
      }

      // Verify final balance
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(5000);
    });

    it('should handle high volume of role operations', () => {
      const roles = [1, 2, 3, 4];

      for (let i = 0; i < 25; i++) {
        const role = roles[i % 4];

        simnet.callPublicFn(
          'zephyr-gate',
          'grant-role',
          [Cl.principal(wallet1), Cl.uint(role)],
          deployer
        );

        if (i % 2 === 0) {
          simnet.callPublicFn(
            'zephyr-gate',
            'revoke-role',
            [Cl.principal(wallet1), Cl.uint(role)],
            deployer
          );
        }
      }

      // Final state should be consistent
      const { result: roles_result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(roles_result).toBeSome();
    });

    it('should handle concurrent strategy operations', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(100000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Allocate and return multiple times
      for (let i = 0; i < 20; i++) {
        simnet.callPublicFn(
          'quantum-ledger',
          'allocate-funds',
          [Cl.principal(wallet1), Cl.uint(1000)],
          deployer
        );

        simnet.callPublicFn(
          'quantum-ledger',
          'return-funds',
          [Cl.principal(wallet1), Cl.uint(1000)],
          deployer
        );
      }

      // Balance should be back to original
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(100000);
    });
  });
});
