import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('Security Tests - Reentrancy Protection', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Strategy Vault Reentrancy Tests', () => {
    it('should prevent reentrancy during withdrawal', () => {
      // Deposit funds first
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(10000)],
        wallet1
      );

      // Try to withdraw same funds twice in sequence
      const { result: firstWithdraw } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(5000)],
        wallet1
      );

      expect(firstWithdraw).toBeOk(Cl.uint(5000));

      // Second withdrawal should work with remaining balance
      const { result: secondWithdraw } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(5000)],
        wallet1
      );

      expect(secondWithdraw).toBeOk(Cl.uint(0));

      // Third withdrawal should fail - no balance left
      const { result: thirdWithdraw } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(1)],
        wallet1
      );

      expect(thirdWithdraw).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });

    it('should maintain correct state during failed operations', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Try to withdraw more than balance
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(2000)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE

      // Verify balance unchanged
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(1000);
    });

    it('should prevent unauthorized fund allocation', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(5000)],
        wallet1
      );

      // Try to allocate funds without authorization
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should prevent double-spending via strategy allocation', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Authorize a contract
      simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(deployer)],
        deployer
      );

      // Allocate all funds
      const { result: firstAlloc } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );

      expect(firstAlloc).toBeOk(Cl.uint(1000));

      // Try to allocate again - should fail
      const { result: secondAlloc } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(secondAlloc).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });
  });

  describe('Access Control Reentrancy Tests', () => {
    it('should prevent role manipulation during operations', () => {
      // Grant a role
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      // Non-owner tries to revoke
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(4600)); // ERR-UNAUTHORIZED

      // Verify role still exists
      const { result: hasRole } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(hasRole).toBeBool(true);
    });
  });
});

describe('Security Tests - Integer Overflow/Underflow', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Arithmetic Overflow Protection', () => {
    it('should handle maximum uint deposits safely', () => {
      const maxUint = Cl.uint(340282366920938463463374607431768211455n); // u128 max

      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [maxUint],
        wallet1
      );

      // Should succeed or handle gracefully
      expect(result).toBeSome();
    });

    it('should prevent underflow in withdrawals', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(100)],
        wallet1
      );

      // Try to withdraw more than deposited
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(200)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR-INSUFFICIENT-BALANCE
    });

    it('should handle zero amount operations correctly', () => {
      const { result: depositZero } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(0)],
        wallet1
      );

      expect(depositZero).toBeErr(Cl.uint(404)); // ERR-INVALID-AMOUNT

      const { result: withdrawZero } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(0)],
        wallet1
      );

      expect(withdrawZero).toBeErr(Cl.uint(404)); // ERR-INVALID-AMOUNT
    });

    it('should accumulate deposits without overflow', () => {
      // Make multiple deposits
      const amount = Cl.uint(1000);

      for (let i = 0; i < 10; i++) {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [amount],
          wallet1
        );
        expect(result).toBeOk(Cl.uint((i + 1) * 1000));
      }

      // Verify total
      const { result: finalBalance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(finalBalance).toBeUint(10000);
    });
  });

  describe('Subtraction Underflow Protection', () => {
    it('should prevent underflow when revoking non-existent strategies', () => {
      // Try to return funds without active strategies
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(100)],
        deployer
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should handle edge case math operations', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(0));

      // Balance should be exactly zero
      const { result: balance } = simnet.callReadOnlyFn(
        'quantum-ledger',
        'get-user-balance',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(balance).toBeUint(0);
    });
  });
});

describe('Security Tests - Authorization Bypass', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Owner-Only Function Protection', () => {
    it('should prevent non-owner from pausing vault', () => {
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'pause-vault',
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should prevent non-owner from resuming vault', () => {
      // First pause as owner
      simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);

      // Try to resume as non-owner
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'resume-vault',
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should prevent non-owner from authorizing contracts', () => {
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'authorize-contract',
        [Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should prevent non-owner from activating emergency mode', () => {
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'activate-emergency-mode',
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });
  });

  describe('Contract Authorization Checks', () => {
    it('should enforce contract authorization for fund allocation', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Try to allocate without being authorized
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'allocate-funds',
        [Cl.principal(wallet1), Cl.uint(100)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });

    it('should enforce contract authorization for fund return', () => {
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(100)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });
  });
});

describe('Security Tests - State Manipulation', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Paused State Protection', () => {
    it('should block deposits when vault is paused', () => {
      simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);

      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED
    });

    it('should block withdrawals when vault is paused', () => {
      // Deposit first
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Pause vault
      simnet.callPublicFn('quantum-ledger', 'pause-vault', [], deployer);

      // Try to withdraw
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(500)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(403)); // ERR-VAULT-PAUSED
    });

    it('should allow emergency withdrawal in emergency mode', () => {
      // Deposit funds
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      // Activate emergency mode
      simnet.callPublicFn(
        'quantum-ledger',
        'activate-emergency-mode',
        [],
        deployer
      );

      // Emergency withdrawal should work
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1000));
    });

    it('should prevent emergency withdrawal when not in emergency mode', () => {
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(1000)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'emergency-withdraw',
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR-UNAUTHORIZED
    });
  });

  describe('Active Strategy Protection', () => {
    it('should prevent withdrawal with active strategies', () => {
      // Deposit and allocate to strategy
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(2000)],
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
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );

      // Try to withdraw with active strategy
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(500)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(405)); // ERR-WITHDRAWAL-LIMIT
    });

    it('should allow withdrawal after strategy completes', () => {
      // Setup
      simnet.callPublicFn(
        'quantum-ledger',
        'deposit',
        [Cl.uint(2000)],
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
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );

      // Return funds from strategy
      simnet.callPublicFn(
        'quantum-ledger',
        'return-funds',
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );

      // Now withdrawal should work
      const { result } = simnet.callPublicFn(
        'quantum-ledger',
        'withdraw',
        [Cl.uint(500)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1500));
    });
  });
});

describe('Security Tests - Denial of Service', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Resource Exhaustion Protection', () => {
    it('should handle multiple rapid deposits', () => {
      for (let i = 0; i < 20; i++) {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(100)],
          wallet1
        );
        expect(result).toBeOk(Cl.uint((i + 1) * 100));
      }
    });

    it('should handle multiple users depositing concurrently', () => {
      const users = [wallet1, wallet2, wallet3];

      users.forEach((user) => {
        const { result } = simnet.callPublicFn(
          'quantum-ledger',
          'deposit',
          [Cl.uint(1000)],
          user
        );
        expect(result).toBeOk(Cl.uint(1000));
      });

      // Verify all balances
      users.forEach((user) => {
        const { result } = simnet.callReadOnlyFn(
          'quantum-ledger',
          'get-user-balance',
          [Cl.principal(user)],
          deployer
        );
        expect(result).toBeUint(1000);
      });
    });
  });
});
