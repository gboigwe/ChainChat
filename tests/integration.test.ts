import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('Integration Tests - Multi-Contract Interactions', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Vault and Access Control Integration', () => {
    it('should integrate vault operations with access control', () => {
      // Grant admin role
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      // Verify role was granted
      const { result: hasRole } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(hasRole).toBeBool(true);

      // User with role should be able to deposit
      const { result: deposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      expect(deposit).toBeOk(Cl.uint(5000));
    });

    it('should coordinate role-based vault access', () => {
      // Grant operator role to wallet2
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet2), Cl.uint(2)],
        deployer
      );

      // Operator should be able to interact with vault
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(3000)],
        wallet2
      );

      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet2)],
        deployer
      );

      expect(balance).toBeUint(3000);

      // Revoke role
      simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet2), Cl.uint(2)],
        deployer
      );

      // Verify role revoked
      const { result: hasRole } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet2), Cl.uint(2)],
        deployer
      );

      expect(hasRole).toBeBool(false);
    });
  });

  describe('Complete User Journey', () => {
    it('should handle full deposit-allocate-return-withdraw flow', () => {
      // Step 1: User deposits funds
      const { result: deposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      expect(deposit).toBeOk(Cl.uint(10000));

      // Step 2: Authorize strategy contract
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Step 3: Allocate funds to strategy
      const { result: allocate } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(5000)],
        deployer
      );

      expect(allocate).toBeOk(Cl.uint(5000));

      // Verify balance reduced
      const { result: afterAllocate } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(afterAllocate).toBeUint(5000);

      // Step 4: Strategy returns funds with profit
      const { result: returnFunds } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(6000)],
        deployer
      );

      expect(returnFunds).toBeOk(Cl.uint(11000));

      // Step 5: User withdraws
      const { result: withdraw } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(11000)],
        wallet1
      );

      expect(withdraw).toBeOk(Cl.uint(0));

      // Verify final balance is zero
      const { result: finalBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(finalBalance).toBeUint(0);
    });

    it('should handle multiple concurrent user journeys', () => {
      const users = [wallet1, wallet2, wallet3];
      const amounts = [5000, 7000, 3000];

      // All users deposit
      users.forEach((user, index) => {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(amounts[index])],
          user
        );
        expect(result).toBeOk(Cl.uint(amounts[index]));
      });

      // Verify total deposits
      const { result: totalDeposits } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-total-deposits',
        [],
        deployer
      );

      expect(totalDeposits).toBeUint(15000);

      // Each user withdraws partially
      const withdrawAmounts = [2000, 3000, 1000];
      users.forEach((user, index) => {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'withdraw',
          [Cl.uint(withdrawAmounts[index])],
          user
        );
        expect(result).toBeOk(Cl.uint(amounts[index] - withdrawAmounts[index]));
      });

      // Verify remaining balances
      const expectedBalances = [3000, 4000, 2000];
      users.forEach((user, index) => {
        const { result } = simnet.callReadOnlyFn(
          'quantum-ledger',
          'get-user-balance',
          [Cl.principal(user)],
          deployer
        );
        expect(result).toBeUint(expectedBalances[index]);
      });
    });
  });

  describe('Emergency Scenarios', () => {
    it('should handle emergency mode activation and recovery', () => {
      // Setup: Users deposit funds
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(3000)],
        wallet2
      );

      // Authorize and allocate funds
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

      // Emergency: Activate emergency mode
      const { result: emergency } = simnet.callPublicFn(
        'quantum-ledger',
        'activate-emergency-mode',
        [],
        deployer
      );

      expect(emergency).toBeOk(Cl.bool(true));

      // Users can emergency withdraw
      const { result: emergencyWithdraw1 } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet1
      );

      expect(emergencyWithdraw1).toBeOk(Cl.uint(3000)); // Only unallocated funds

      const { result: emergencyWithdraw2 } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet2
      );

      expect(emergencyWithdraw2).toBeOk(Cl.uint(3000));
    });

    it('should prevent operations during pause state', () => {
      // Deposit first
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Pause vault
      simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);

      // All operations should fail
      const { result: deposit } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(500)],
        wallet1
      );

      expect(deposit).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED

      const { result: withdraw } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(500)],
        wallet1
      );

      expect(withdraw).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED

      // Resume vault
      simnet.callPublicFn('quantum-ledger', 'resume-vault', [], deployer);

      // Operations should work again
      const { result: depositAfter } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(500)],
        wallet1
      );

      expect(depositAfter).toBeOk(Cl.uint(1500));
    });
  });

  describe('Strategy Coordination', () => {
    it('should coordinate multiple strategies for single user', () => {
      // User deposits
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(20000)],
        wallet1
      );

      // Authorize multiple strategy contracts
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(wallet3)],
        deployer
      );

      // Allocate to first strategy
      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(8000)],
        deployer
      );

      // Allocate to second strategy
      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(7000)],
        wallet3
      );

      // Verify remaining balance
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(5000);

      // Verify strategy count
      const { result: strategyCount } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-strategy-count',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(strategyCount).toBeUint(2);

      // Cannot withdraw with active strategies
      const { result: withdraw } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(1000)],
        wallet1
      );

      expect(withdraw).toBeErr(Cl.uint(405)); // ERR-WITHDRAWAL-LIMIT
    });

    it('should handle strategy profit and loss scenarios', () => {
      // Setup
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
        [Cl.principal(wallet1), Cl.uint(10000)],
        deployer
      );

      // Strategy returns with profit
      const { result: returnWithProfit } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(12000)],
        deployer
      );

      expect(returnWithProfit).toBeOk(Cl.uint(12000));

      // Verify balance increased
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(12000);

      // Allocate again for loss scenario
      simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(12000)],
        deployer
      );

      // Strategy returns with loss
      const { result: returnWithLoss } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(9000)],
        deployer
      );

      expect(returnWithLoss).toBeOk(Cl.uint(9000));

      // Verify balance decreased
      const { result: finalBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(finalBalance).toBeUint(9000);
    });
  });

  describe('Contract Authorization Flow', () => {
    it('should manage contract authorization lifecycle', () => {
      // Authorize contract
      const { result: authorize } = simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(wallet3)],
        deployer
      );

      expect(authorize).toBeOk(Cl.bool(true));

      // Authorized contract can allocate funds
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      const { result: allocate } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(2000)],
        wallet3
      );

      expect(allocate).toBeOk(Cl.uint(2000));

      // Return funds
      simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(2000)],
        wallet3
      );

      // Revoke authorization
      const { result: revoke } = simnet.callPublicFn(
        'quantum-ledger',
        'revoke-contract',
        [Cl.principal(wallet3)],
        deployer
      );

      expect(revoke).toBeOk(Cl.bool(true));

      // Contract can no longer allocate
      const { result: allocateAfter } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet3
      );

      expect(allocateAfter).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });
  });

  describe('Role-Based Strategy Access', () => {
    it('should coordinate roles with vault operations', () => {
      // Grant guardian role
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(3)],
        deployer
      );

      // Guardian deposits
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(8000)],
        wallet1
      );

      // Verify role persists after vault operations
      const { result: hasRole } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), Cl.uint(3)],
        deployer
      );

      expect(hasRole).toBeBool(true);

      // Withdraw
      simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(3000)],
        wallet1
      );

      // Role still exists
      const { result: hasRoleAfter } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), Cl.uint(3)],
        deployer
      );

      expect(hasRoleAfter).toBeBool(true);
    });

    it('should handle role changes during active strategies', () => {
      // Grant admin role
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      // Deposit and allocate
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

      // Revoke role during active strategy
      simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      // Strategy completion should still work
      const { result: returnFunds } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(2500)],
        deployer
      );

      expect(returnFunds).toBeOk(Cl.uint(5500));
    });
  });
});
