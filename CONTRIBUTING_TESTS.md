# Contributing Tests

Thank you for contributing to ChainChat testing!

## Before You Start

1. Read [tests/README.md](tests/README.md)
2. Understand test structure and patterns
3. Ensure you have Clarinet installed
4. Run existing tests to verify setup

## Adding New Tests

### 1. Choose the Right Test File

- **Unit tests**: `tests/access-control.test.ts` or create new
- **Security**: `tests/security.test.ts`
- **Integration**: `tests/integration.test.ts`
- **Property-based**: `tests/property-based.test.ts`
- **Fuzzing**: `tests/fuzzing.test.ts`
- **Gas**: `tests/gas-optimization.test.ts`

### 2. Follow Test Patterns

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  it('should do something specific', () => {
    // Arrange
    const input = Cl.uint(1000);

    // Act
    const { result } = simnet.callPublicFn(/*...*/);

    // Assert
    expect(result).toBeOk(/*...*/);
  });
});
```

### 3. Use Test Helpers

Import and use helpers from `test-helpers.ts`:

```typescript
import { VaultHelper, uint, unwrapUint } from './test-helpers';

const vault = new VaultHelper(simnet);
vault.deposit(1000, wallet1);
```

## Coverage Requirements

- All new code must have e90% coverage
- Test both success and failure cases
- Include edge cases
- Add security tests for sensitive operations

## Pre-commit Checklist

- [ ] All tests pass
- [ ] Coverage meets threshold
- [ ] ESLint passes
- [ ] Prettier formatted
- [ ] Clarinet check passes

## Running Tests Locally

```bash
# All tests
npm test

# Specific suite
npm run test:unit
npm run test:security

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Common Patterns

### Testing Errors

```typescript
it('should reject unauthorized access', () => {
  const { result } = simnet.callPublicFn(/*...*/);
  expect(result).toBeErr(Cl.uint(401));
});
```

### Testing State Changes

```typescript
it('should update balance correctly', () => {
  // Initial state
  const { result: before } = vault.getBalance(wallet1, deployer);
  expect(before).toBeUint(0);

  // Action
  vault.deposit(1000, wallet1);

  // Final state
  const { result: after } = vault.getBalance(wallet1, deployer);
  expect(after).toBeUint(1000);
});
```

### Testing Multiple Operations

```typescript
it('should handle complete user flow', () => {
  vault.deposit(5000, wallet1);
  vault.authorizeContract(deployer, deployer);
  vault.allocateFunds(wallet1, 2000, deployer);
  vault.returnFunds(wallet1, 2500, deployer);
  vault.withdraw(5500, wallet1);

  const { result } = vault.getBalance(wallet1, deployer);
  expect(result).toBeUint(0);
});
```

## Security Testing

Always test:
- Unauthorized access attempts
- Integer overflow/underflow
- Reentrancy scenarios
- State consistency
- Edge cases (0, max values)

## Need Help?

- Check [tests/README.md](tests/README.md)
- Review existing tests
- Ask in pull request comments

## Pull Request Requirements

1. Add tests for new features
2. Ensure all tests pass
3. Maintain e90% coverage
4. Update documentation if needed
5. Run pre-commit hooks

## Thank You!

Your contributions help keep ChainChat secure and reliable.
