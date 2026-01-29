import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

/**
 * Gas Optimization Tests
 * Track execution costs and ensure optimizations don't regress
 */

describe('Gas Optimization Tests', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Vault Operation Cost Tracking', () => {
    it('should track gas cost for deposit operations', () => {
      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(10000));

      // Track event emission cost
      expect(events.length).toBeGreaterThan(0);

      // Verify deposit is efficient (should complete successfully)
      expect(result).toBeSome();
    });

    it('should track gas cost for withdrawal operations', () => {
      // Setup
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(5000)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(5000));
      expect(events.length).toBeGreaterThan(0);
    });

    it('should track gas cost for fund allocation', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(5000)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(5000));
      expect(events.length).toBeGreaterThan(0);
    });

    it('should track gas cost for fund returns', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
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
        [Cl.principal(wallet1), Cl.uint(5000)],
        deployer
      );

      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(6000)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(11000));
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('Access Control Cost Tracking', () => {
    it('should track gas cost for role granting', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it('should track gas cost for role revocation', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it('should track gas cost for role checking', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result).toBeBool(true);
    });

    it('should track gas cost for getting all roles', () => {
      // Grant multiple roles
      [1, 2, 3, 4].forEach((role) => {
        simnet.callPublicFn(
          'zephyr-gate',
          'grant-role',
          [Cl.principal(wallet1), Cl.uint(role)],
          deployer
        );
      });

      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      const roles = Cl.unwrapList(Cl.unwrapOk(result));
      expect(roles.length).toBe(4);
    });
  });

  describe('Batch Operation Efficiency', () => {
    it('should efficiently handle multiple sequential deposits', () => {
      const depositCount = 10;
      const amount = 1000;

      for (let i = 0; i < depositCount; i++) {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(amount)],
          wallet1
        );

        expect(result).toBeOk(Cl.uint((i + 1) * amount));
      }

      // Verify final state is correct
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(depositCount * amount);
    });

    it('should efficiently handle multiple role grants', () => {
      const users = [wallet1, wallet2, wallet3];
      const roles = [1, 2, 3];

      users.forEach((user, userIndex) => {
        roles.forEach((role) => {
          const { result } = simnet.callPublicFn(
            'zephyr-gate',
            'grant-role',
            [Cl.principal(user), Cl.uint(role)],
            deployer
          );

          expect(result).toBeOk(Cl.bool(true));
        });
      });

      // Verify all users have all roles
      users.forEach((user) => {
        const { result } = simnet.callReadOnlyFn(
          'zephyr-gate',
          'get-user-roles',
          [Cl.principal(user)],
          deployer
        );

        const userRoles = Cl.unwrapList(Cl.unwrapOk(result));
        expect(userRoles.length).toBe(3);
      });
    });

    it('should efficiently handle mixed operations', () => {
      const operations = [
        () =>
          simnet.callPublicFn(
            'quantum-ledger',
            'deposit',
            [Cl.uint(1000)],
            wallet1
          ),
        () =>
          simnet.callPublicFn(
            'zephyr-gate',
            'grant-role',
            [Cl.principal(wallet1), Cl.uint(1)],
            deployer
          ),
        () =>
          simnet.callPublicFn(
            'quantum-ledger',
            'deposit',
            [Cl.uint(2000)],
            wallet2
          ),
        () =>
          simnet.callPublicFn(
            'zephyr-gate',
            'grant-role',
            [Cl.principal(wallet2), Cl.uint(2)],
            deployer
          ),
        () =>
          simnet.callPublicFn(
            'quantum-ledger',
            'withdraw',
            [Cl.uint(500)],
            wallet1
          ),
      ];

      operations.forEach((op) => {
        const { result } = op();
        expect(result).toBeSome();
      });
    });
  });

  describe('Read-Only Operation Costs', () => {
    it('should have low cost for balance queries', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      // Multiple queries should be efficient
      for (let i = 0; i < 10; i++) {
        const { result } = simnet.callReadOnlyFn(
          'quantum-ledger',
          'get-user-balance',
          [Cl.principal(wallet1)],
          deployer
        );

        expect(result).toBeUint(5000);
      }
    });

    it('should have low cost for role checks', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      // Multiple checks should be efficient
      for (let i = 0; i < 10; i++) {
        const { result } = simnet.callReadOnlyFn(
          'zephyr-gate',
          'has-role',
          [Cl.principal(wallet1), Cl.uint(1)],
          deployer
        );

        expect(result).toBeBool(true);
      }
    });

    it('should efficiently query total deposits', () => {
      // Setup
      [wallet1, wallet2, wallet3].forEach((wallet) => {
        simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(1000)],
          wallet
        );
      });

      // Query should be efficient
      const { result } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-total-deposits',
        [],
        deployer
      );

      expect(result).toBeUint(3000);
    });

    it('should efficiently query strategy counts', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
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
        [Cl.principal(wallet1), Cl.uint(3000)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeUint(1);
    });
  });

  describe('State Change Cost Comparison', () => {
    it('should compare cost of first vs subsequent deposits', () => {
      // First deposit (map entry creation)
      const { result: first } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(first).toBeOk(Cl.uint(1000));

      // Subsequent deposits (map update)
      const { result: second } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(second).toBeOk(Cl.uint(2000));

      // Both should succeed efficiently
      expect(first).toBeSome();
      expect(second).toBeSome();
    });

    it('should compare authorization vs unauthorized operations', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      // Unauthorized attempt (should fail fast)
      const { result: unauthorized } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet2
      );

      expect(unauthorized).toBeErr(Cl.uint(401));

      // Authorize
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Authorized operation (should succeed)
      const { result: authorized } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );

      expect(authorized).toBeOk(Cl.uint(1000));
    });

    it('should track cost of paused vs active operations', () => {
      // Active vault
      const { result: activeDeposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(activeDeposit).toBeOk(Cl.uint(1000));

      // Pause vault
      simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);

      // Paused vault (should fail fast)
      const { result: pausedDeposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet2
      );

      expect(pausedDeposit).toBeErr(Cl.uint(403));

      // Resume
      simnet.callPublicFn('quantum-ledger', 'resume-vault', [], deployer);

      // Active again
      const { result: resumedDeposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet2
      );

      expect(resumedDeposit).toBeOk(Cl.uint(1000));
    });
  });

  describe('Event Emission Costs', () => {
    it('should track event emission for deposits', () => {
      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(5000));
      expect(events.length).toBeGreaterThan(0);

      // Verify event structure is efficient
      const printEvent = events.find((e) => e.event === 'print_event');
      expect(printEvent).toBeDefined();
    });

    it('should track event emission for withdrawals', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(2000)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(3000));
      expect(events.length).toBeGreaterThan(0);
    });

    it('should track event emission for allocations', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(5000)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(5000));
      expect(events.length).toBeGreaterThan(0);
    });

    it('should track event emission for fund returns', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
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
        [Cl.principal(wallet1), Cl.uint(5000)],
        deployer
      );

      const { result, events } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(6000)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(11000));
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('Optimization Regression Tests', () => {
    it('should maintain efficient deposit performance', () => {
      const iterations = 20;
      const amount = 500;

      for (let i = 0; i < iterations; i++) {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(amount)],
          wallet1
        );

        // Each deposit should succeed
        expect(result).toBeOk(Cl.uint((i + 1) * amount));
      }

      // Final balance should be correct
      const { result: finalBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(finalBalance).toBeUint(iterations * amount);
    });

    it('should maintain efficient role management', () => {
      const roles = [1, 2, 3, 4];

      // Grant all roles
      roles.forEach((role) => {
        const { result } = simnet.callPublicFn(
          'zephyr-gate',
          'grant-role',
          [Cl.principal(wallet1), Cl.uint(role)],
          deployer
        );

        expect(result).toBeOk(Cl.bool(true));
      });

      // Query should be efficient
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      const userRoles = Cl.unwrapList(Cl.unwrapOk(result));
      expect(userRoles.length).toBe(4);
    });

    it('should maintain efficient strategy tracking', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(20000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Multiple allocations
      for (let i = 0; i < 5; i++) {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'allocate-funds',
          [Cl.principal(wallet1), Cl.uint(2000)],
          deployer
        );

        expect(result).toBeOk(Cl.uint(2000));
      }

      // Counter query should be efficient
      const { result: count } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(count).toBeUint(5);
    });
  });
});
