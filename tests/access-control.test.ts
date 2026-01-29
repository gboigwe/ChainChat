import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

// Constants from contract
const ROLE_ADMIN = Cl.uint(1);
const ROLE_OPERATOR = Cl.uint(2);
const ROLE_GUARDIAN = Cl.uint(3);
const ROLE_AUDITOR = Cl.uint(4);

const ERR_UNAUTHORIZED = Cl.uint(4600);
const ERR_INVALID_ROLE = Cl.uint(4601);

describe('access-control contract', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Initialization', () => {
    it('should initialize with deployer as contract owner', () => {
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-contract-owner',
        [],
        deployer
      );
      expect(result).toBeOk(Cl.principal(deployer));
    });

    it('should start with no roles assigned', () => {
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.list([]));
    });
  });

  describe('Role Granting - Success Cases', () => {
    it('should allow owner to grant admin role', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow owner to grant operator role', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow owner to grant guardian role', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_GUARDIAN],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow owner to grant auditor role', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_AUDITOR],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow granting multiple roles to same user', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const { result: roles } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(roles).toBeOk(Cl.list([ROLE_ADMIN, ROLE_OPERATOR]));
    });

    it('should allow granting same role to multiple users', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet2), ROLE_ADMIN],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Role Granting - Failure Cases', () => {
    it('should reject grant from non-owner', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet2), ROLE_ADMIN],
        wallet1
      );
      expect(result).toBeErr(ERR_UNAUTHORIZED);
    });

    it('should reject invalid role ID (0)', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(0)],
        deployer
      );
      expect(result).toBeErr(ERR_INVALID_ROLE);
    });

    it('should reject invalid role ID (5)', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(5)],
        deployer
      );
      expect(result).toBeErr(ERR_INVALID_ROLE);
    });

    it('should reject invalid role ID (999)', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(999)],
        deployer
      );
      expect(result).toBeErr(ERR_INVALID_ROLE);
    });
  });

  describe('Role Revocation - Success Cases', () => {
    beforeEach(() => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );
    });

    it('should allow owner to revoke role', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should remove role from user roles list', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.list([]));
    });

    it('should revoke specific role while keeping others', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.list([ROLE_OPERATOR]));
    });
  });

  describe('Role Revocation - Failure Cases', () => {
    it('should reject revoke from non-owner', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        wallet2
      );

      expect(result).toBeErr(ERR_UNAUTHORIZED);
    });

    it('should handle revoking non-existent role gracefully', () => {
      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );
    });

    it('should return true for granted role', () => {
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );
      expect(result).toBeBool(true);
    });

    it('should return false for non-granted role', () => {
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );
      expect(result).toBeBool(false);
    });

    it('should return false for user with no roles', () => {
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet2), ROLE_ADMIN],
        deployer
      );
      expect(result).toBeBool(false);
    });

    it('should return all user roles correctly', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_GUARDIAN],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(
        Cl.list([ROLE_ADMIN, ROLE_OPERATOR, ROLE_GUARDIAN])
      );
    });
  });

  describe('Security Tests', () => {
    it('should prevent role escalation attacks', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        wallet1
      );

      expect(result).toBeErr(ERR_UNAUTHORIZED);
    });

    it('should prevent unauthorized role revocation', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        wallet2
      );

      expect(result).toBeErr(ERR_UNAUTHORIZED);
    });

    it('should prevent user from revoking their own role', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        wallet1
      );

      expect(result).toBeErr(ERR_UNAUTHORIZED);
    });

    it('should maintain role integrity after failed operations', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), Cl.uint(999)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'has-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      expect(result).toBeBool(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum roles per user', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_OPERATOR],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_GUARDIAN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_AUDITOR],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it('should handle duplicate role grants idempotently', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const { result: roles } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(roles).toBeOk(Cl.list([ROLE_ADMIN]));
    });

    it('should handle querying non-existent users', () => {
      const { result } = simnet.callReadOnlyFn(
        'zephyr-gate',
        'get-user-roles',
        [Cl.principal(wallet3)],
        deployer
      );

      expect(result).toBeOk(Cl.list([]));
    });

    it('should handle rapid role changes', () => {
      simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      simnet.callPublicFn(
        'zephyr-gate',
        'revoke-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'zephyr-gate',
        'grant-role',
        [Cl.principal(wallet1), ROLE_ADMIN],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
