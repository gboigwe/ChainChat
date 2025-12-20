# ChainChat Stacks Project Issues & Fixes

This document outlines all identified issues in the ChainChat Stacks project and their proposed solutions. Each issue should be fixed in a separate branch with multiple commits.

---

## Issue #1: Contracts Not Registered in Clarinet.toml

### Priority: CRITICAL
### Category: Configuration

### Problem:
The Clarinet.toml configuration file has the contracts section commented out (lines 8-9). This means Clarinet cannot recognize, test, or deploy the smart contracts.

```toml
# [contracts.counter]
# path = "contracts/counter.clar"
```

### Impact:
- Cannot run `clarinet test`
- Cannot use `clarinet console`
- Cannot deploy contracts via Clarinet
- Testing infrastructure is non-functional
- Local devnet cannot load contracts

### Expected Fix:
1. Register both smart contracts in Clarinet.toml
2. Set correct paths for each contract
3. Verify contracts load in Clarinet console
4. Ensure proper syntax in TOML format

### Implementation:
```toml
[contracts.strategy-vault]
path = "contracts/strategy-vault.clar"

[contracts.strategy-engine]
path = "contracts/strategy-engine.clar"
```

### Acceptance Criteria:
- ✅ Clarinet recognizes both contracts
- ✅ `clarinet check` passes without errors
- ✅ Contracts load in local devnet
- ✅ Can interact with contracts in console

---

## Issue #2: Incorrect Transaction Encoding in Frontend

### Priority: CRITICAL
### Category: Frontend Integration

### Problem:
The StrategyDashboard.jsx component incorrectly encodes function arguments when calling smart contracts:

**Line 44-50**: Passing raw address instead of Clarity Value:
```javascript
functionArgs: [address],  // WRONG
```

**Line 107**: Using incorrect parameter name:
```javascript
senderKey: address,  // WRONG - this is for private key signing
```

### Impact:
- All contract calls will fail
- Deposits won't work
- Strategy execution won't work
- No error messages explain the problem
- Users can't interact with contracts

### Expected Fix:
1. Import Clarity Value constructors from @stacks/transactions
2. Encode all function arguments with proper CV types:
   - Addresses → `principalCV(address)`
   - Numbers → `uintCV(amount)`
   - Strings → `stringAsciiCV(text)`
3. Replace `senderKey` with `senderAddress`
4. Add proper post-conditions for STX transfers
5. Implement transaction status monitoring

### Implementation Files:
- src/components/StrategyDashboard.jsx
- src/utils/wallet.js (add transaction helpers)

### Required Imports:
```javascript
import {
  uintCV,
  principalCV,
  stringAsciiCV,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  PostConditionMode
} from '@stacks/transactions';
```

### Acceptance Criteria:
- ✅ Vault deposits work correctly
- ✅ Contract calls succeed with proper encoding
- ✅ Post-conditions protect user funds
- ✅ Transaction status is displayed to users
- ✅ Error messages are user-friendly

---

## Issue #3: Missing Test Suite

### Priority: HIGH
### Category: Testing

### Problem:
Despite having vitest and clarinet-sdk configured:
- No tests/ directory exists
- No test files written
- 0% test coverage for contracts
- No frontend component tests
- Testing infrastructure is unused

### Impact:
- No validation of contract logic
- Can't verify security properties
- No regression testing
- Manual testing only
- High risk of bugs in production

### Expected Fix:
1. Create tests/ directory
2. Write unit tests for strategy-vault.clar:
   - Test deposit function
   - Test withdraw function with/without active strategies
   - Test authorization system
   - Test emergency mode
   - Test pause functionality
3. Write unit tests for strategy-engine.clar:
   - Test command parsing
   - Test strategy execution
   - Test risk management
   - Test portfolio queries
4. Configure test runner scripts
5. Add CI/CD test automation

### Implementation Structure:
```
tests/
├── strategy-vault.test.ts
├── strategy-engine.test.ts
└── integration.test.ts
```

### Test Framework:
- Use vitest with vitest-environment-clarinet
- Use @hirosystems/clarinet-sdk for contract interactions
- Test both success and failure cases
- Test edge cases and security boundaries

### Acceptance Criteria:
- ✅ All contract functions have unit tests
- ✅ Test coverage > 80%
- ✅ Tests pass on local devnet
- ✅ CI/CD pipeline runs tests automatically
- ✅ Security properties are verified

---

## Issue #4: Hardcoded Placeholder Contract Addresses

### Priority: HIGH
### Category: Configuration

### Problem:
Multiple files contain hardcoded placeholder addresses that don't exist:

**strategy-engine.clar (lines 31-32)**:
```clarity
(define-data-var vault-contract principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.strategy-vault)
(define-data-var alex-connector principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.alex-connector)
```

**.env.example**:
```env
VITE_VAULT_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.strategy-vault
VITE_ENGINE_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.strategy-engine
```

### Impact:
- Contract-to-contract calls will fail
- Frontend can't connect to real contracts
- No way to update addresses after deployment
- Each environment (testnet/mainnet) needs different addresses
- Manual configuration errors likely

### Expected Fix:
1. Remove hardcoded addresses from smart contracts
2. Create deployment scripts that:
   - Deploy contracts in correct order
   - Set contract references after deployment
   - Update .env files automatically
   - Generate deployment manifests
3. Create separate config files for each network
4. Document deployment process
5. Add address validation

### Implementation:
Create scripts/deploy.ts:
```typescript
// Automated deployment script
// 1. Deploy strategy-vault
// 2. Deploy strategy-engine
// 3. Authorize strategy-engine in vault
// 4. Update .env files
// 5. Output deployment manifest
```

### Acceptance Criteria:
- ✅ Deployment script works for testnet
- ✅ Deployment script works for mainnet
- ✅ .env files are auto-updated
- ✅ Contract references are set correctly
- ✅ Deployment is documented and repeatable

---

## Issue #5: Missing ALEX DeFi Protocol Integration

### Priority: HIGH
### Category: Smart Contract Integration

### Problem:
The project claims ALEX DeFi integration but:
- No ALEX SDK installed
- All ALEX calls in strategy-engine.clar are commented out (lines 202, 214, 236, 239, 310)
- No alex-connector.clar contract exists
- No actual yield farming implementation
- Strategies don't execute any DeFi operations

**Currently in strategy-engine.clar**:
```clarity
;; Execute strategy through ALEX connector (will implement in next contract)
;; (try! (contract-call? (var-get alex-connector) execute-strategy strategy-id amount))
```

### Impact:
- "Start strategy" commands do nothing
- No yield generation
- Core functionality is missing
- Project can't fulfill its purpose
- Users can't earn returns

### Expected Fix:
1. Install ALEX SDK (@alexgo/sdk)
2. Create contracts/alex-connector.clar:
   - Interface with ALEX liquidity pools
   - Handle token swaps
   - Manage yield farming positions
   - Track rewards and APY
3. Uncomment and complete ALEX integration in strategy-engine.clar
4. Implement actual strategy execution
5. Add ALEX pool monitoring
6. Connect frontend to display real APY data

### ALEX Integration Points:
- Swap Protocol - Token exchanges
- AMM Pools - Liquidity provision
- Yield Token - Yield farming
- Staking - Reward generation

### Acceptance Criteria:
- ✅ ALEX SDK integrated
- ✅ alex-connector.clar implemented
- ✅ Can execute swaps on ALEX
- ✅ Can provide liquidity to pools
- ✅ Real yield data displayed
- ✅ Strategies actually generate returns

---

## Issue #6: No Chainhooks Implementation

### Priority: MEDIUM
### Category: Monitoring & Automation

### Problem:
No Chainhooks configured for real-time blockchain event monitoring:
- Can't monitor vault deposits/withdrawals
- Can't track strategy state changes
- No automatic risk management triggers
- No alerts for critical events
- Manual monitoring only

### Impact:
- No real-time notifications
- Delayed response to market conditions
- Can't automate stop-loss execution
- Poor user experience (no updates)
- Manual intervention required for everything

### Expected Fix:
1. Install and configure Chainhooks
2. Create chainhooks/ directory with configuration files
3. Set up webhooks for critical events:
   - Vault deposits (trigger balance updates)
   - Vault withdrawals (update UI)
   - Strategy start/stop (notify users)
   - Emergency mode activation (alert admins)
   - Large STX movements (risk monitoring)
4. Create backend service to handle webhook calls
5. Integrate webhook handlers with frontend notifications

### Chainhooks Configuration:
```yaml
# chainhooks/vault-events.yaml
name: vault-deposit-monitor
network: mainnet
predicate:
  scope: contract_call
  contract_identifier: <VAULT_CONTRACT>
  method: deposit
actions:
  - http_post:
      url: https://api.chainchat.app/webhooks/vault-deposit
```

### Acceptance Criteria:
- ✅ Chainhooks configured for all critical events
- ✅ Webhook endpoint receives events
- ✅ Frontend updates in real-time
- ✅ Users receive notifications
- ✅ Event history is logged

---

## Issue #7: No Oracle Integration for Price Feeds

### Priority: MEDIUM
### Category: Risk Management

### Problem:
The check-stop-loss function exists but returns `(ok true)` without any logic:

```clarity
(define-public (check-stop-loss (user principal))
  ;; This will be called by oracle or monitoring system
  ;; Implementation depends on price feed integration
  (ok true)
)
```

No oracle integration means:
- Can't track STX price
- Can't calculate USD values
- Can't implement stop-loss
- Can't measure real returns
- Risk management is non-functional

### Impact:
- "Stop loss" feature doesn't work
- Can't protect users from losses
- No real risk management
- USD denominated limits don't work
- False sense of security

### Expected Fix:
1. Choose oracle provider (Redstone, Pyth, or Pragma)
2. Install oracle SDK
3. Create contracts/oracle-connector.clar:
   - Fetch STX/USD price
   - Cache prices with timestamps
   - Provide price to other contracts
4. Implement check-stop-loss logic:
   - Get current strategy value
   - Compare to user's stop-loss percentage
   - Auto-exit if threshold breached
5. Add price monitoring to Chainhooks
6. Display USD values in frontend

### Oracle Options:
- **Redstone**: Most Stacks integrations
- **Pyth**: Fast updates, low latency
- **Pragma**: Stacks-native oracle

### Acceptance Criteria:
- ✅ Oracle integrated and functional
- ✅ Price feeds update regularly
- ✅ Stop-loss triggers automatically
- ✅ USD values displayed in UI
- ✅ Price history tracked

---

## Issue #8: Incomplete Authorization System

### Priority: MEDIUM
### Category: Security

### Problem:
Strategy-vault.clar has authorization system for strategy contracts, but:
- Strategy-engine is never authorized after deployment
- No deployment script sets up authorization
- Manual authorization required (easy to forget)
- No way to verify authorization status from frontend
- Multiple strategies would all need individual authorization

**In strategy-vault.clar**:
```clarity
(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set authorized-contracts contract true)
    (ok true)
  )
)
```

### Impact:
- Strategy-engine can't call allocate-funds
- All strategy execution will fail with ERR-UNAUTHORIZED
- Deployment is incomplete
- Security risk if forgotten
- No audit trail

### Expected Fix:
1. Add authorization setup to deployment script
2. Automatically authorize strategy-engine after deploying vault
3. Create admin panel to manage authorized contracts
4. Add frontend display of authorized contracts
5. Implement authorization revocation for security
6. Log all authorization changes
7. Add emergency authorization override for CONTRACT-OWNER

### Enhanced Authorization:
```clarity
;; Add authorization with expiry
(define-map authorized-contracts
  principal
  { authorized: bool, expires-at: uint }
)

;; Add authorization levels
(define-map contract-permissions
  principal
  { can-allocate: bool, can-return: bool, max-amount: uint }
)
```

### Acceptance Criteria:
- ✅ Authorization automatically configured during deployment
- ✅ Frontend displays authorization status
- ✅ Admin can manage authorizations
- ✅ Authorization changes are logged
- ✅ Security best practices followed

---

## Issue #9: Network Configuration Issues

### Priority: MEDIUM
### Category: Configuration

### Problem:
Network configuration has several issues:

**wallet.js (line 12-14)**:
```javascript
const NETWORK = process.env.VITE_NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();
```

Issues:
- No validation of VITE_NETWORK value
- No API URL configuration
- No way to use custom Stacks nodes
- No devnet support (only testnet/mainnet)
- Network info not displayed to users
- Can't easily switch networks

### Impact:
- Typo in .env breaks app silently
- Can't test on local devnet
- Can't use custom Stacks nodes
- Users don't know which network they're on
- Network mismatch causes confusing errors

### Expected Fix:
1. Add network validation
2. Support all network types (devnet, testnet, mainnet, custom)
3. Add network switcher in UI
4. Display current network prominently
5. Validate contract addresses match network
6. Add network-specific configurations:
   - API URLs
   - Explorer URLs
   - Faucet links (for testnet)
7. Prevent mainnet operations in development

### Enhanced Configuration:
```javascript
const NETWORKS = {
  devnet: {
    type: new StacksDevnet(),
    apiUrl: 'http://localhost:3999',
    explorerUrl: 'http://localhost:8000',
    faucetUrl: null
  },
  testnet: {
    type: new StacksTestnet(),
    apiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    faucetUrl: 'https://explorer.hiro.so/sandbox/faucet'
  },
  mainnet: {
    type: new StacksMainnet(),
    apiUrl: 'https://api.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    faucetUrl: null
  }
};
```

### Acceptance Criteria:
- ✅ Network validation prevents errors
- ✅ All network types supported
- ✅ Network switcher in UI
- ✅ Current network clearly displayed
- ✅ Network-specific links work
- ✅ Devnet works for local testing

---

## Issue #10: Missing Transaction Status Monitoring

### Priority: MEDIUM
### Category: User Experience

### Problem:
When users submit transactions (deposits, withdrawals, strategy commands):
- No transaction status displayed
- No pending state shown
- Users don't know if transaction succeeded
- No link to explorer
- No retry mechanism on failure
- No transaction history

**Current implementation**:
```javascript
onFinish: async (data) => {
  setMessage({ type: 'success', text: `Deposit successful! TX: ${data.txId}` });
}
```

Issues:
- Only shows txId, not status
- No way to track if transaction confirms
- No error recovery
- Users must manually check explorer

### Impact:
- Poor user experience
- Confusion about transaction state
- Users think transactions failed when pending
- No way to track transaction history
- Can't diagnose issues

### Expected Fix:
1. Create transaction monitoring system:
   - Track pending transactions
   - Poll for confirmation status
   - Show progress indicators
   - Display confirmation count
2. Add transaction history feature:
   - Store recent transactions
   - Show success/failure status
   - Allow filtering and search
3. Integrate with Stacks Explorer:
   - Add "View in Explorer" links
   - Deep link to specific transactions
4. Implement error recovery:
   - Retry failed transactions
   - Clear explanation of errors
   - Suggested fixes
5. Add notifications:
   - Toast messages for confirmations
   - Sound/visual alerts
   - Browser notifications (with permission)

### Transaction States:
```typescript
enum TxStatus {
  PENDING = 'pending',
  PENDING_CONFIRMATION = 'pending_confirmation',
  SUCCESS = 'success',
  FAILED = 'failed',
  DROPPED = 'dropped'
}
```

### Acceptance Criteria:
- ✅ Transaction status displayed in real-time
- ✅ Progress indicators shown
- ✅ Transaction history accessible
- ✅ Explorer links provided
- ✅ Error recovery implemented
- ✅ Notifications work correctly

---

## Issue #11: No Production Build Optimization

### Priority: LOW
### Category: Performance

### Problem:
The Vite configuration (vite.config.frontend.js) uses defaults without production optimizations:
- No code splitting configuration
- No bundle size limits
- No compression
- No caching strategy
- No CDN configuration
- No asset optimization

### Impact:
- Large bundle sizes
- Slow initial load
- Unnecessary code in production
- Poor performance on mobile
- High bandwidth usage

### Expected Fix:
1. Configure code splitting:
   - Split vendor bundles
   - Lazy load components
   - Dynamic imports for routes
2. Add bundle analysis:
   - Install rollup-plugin-visualizer
   - Set size limits
   - Track bundle growth
3. Enable compression:
   - Gzip assets
   - Brotli compression
4. Optimize assets:
   - Image optimization
   - Font subsetting
   - SVG optimization
5. Configure caching:
   - Content hashing
   - Long-term caching headers
   - Service worker (optional)
6. Add production checks:
   - Remove console.logs
   - Strip source maps (or upload separately)
   - Environment-specific configs

### Enhanced Vite Config:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-stacks': ['@stacks/connect', '@stacks/transactions'],
          'vendor-react': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
});
```

### Acceptance Criteria:
- ✅ Bundle size < 500KB (gzipped)
- ✅ Lighthouse score > 90
- ✅ First Contentful Paint < 2s
- ✅ Code splitting working
- ✅ Assets optimized
- ✅ Production ready

---

## Issue #12: Missing Environment Variable Validation

### Priority: LOW
### Category: Developer Experience

### Problem:
.env.example exists but no validation of required variables:
- App runs with missing VITE_WALLETCONNECT_PROJECT_ID
- Only console warning shown
- Can deploy without proper configuration
- No check for valid contract addresses
- No network validation

**Current validation** (wallet.js line 136):
```javascript
export const validateWalletConnectSetup = () => {
  if (!WALLETCONNECT_PROJECT_ID || WALLETCONNECT_PROJECT_ID === 'YOUR_PROJECT_ID') {
    console.warn('WalletConnect Project ID not configured...');
    return false;
  }
  return true;
};
```

Issues:
- Warning only, doesn't prevent usage
- No validation at startup
- No validation of other env vars
- Poor developer experience

### Impact:
- Developers forget to set env vars
- Runtime errors instead of startup errors
- Confusing bugs
- Wasted debugging time
- Production incidents

### Expected Fix:
1. Create config validation utility:
   - Check all required env vars at startup
   - Validate format (URLs, addresses, etc.)
   - Show clear error messages
   - Prevent app from starting if misconfigured
2. Add .env.development and .env.production templates
3. Create setup script:
   - Interactive configuration
   - Validate inputs
   - Generate .env file
4. Add config documentation:
   - Explain each variable
   - Provide examples
   - Link to external services (Reown, etc.)
5. Implement config health check endpoint

### Enhanced Validation:
```javascript
// src/config/validate.js
const requiredEnvVars = {
  VITE_WALLETCONNECT_PROJECT_ID: {
    required: true,
    validate: (val) => val && val.length > 0 && val !== 'YOUR_PROJECT_ID',
    error: 'Get your Project ID from https://cloud.reown.com/'
  },
  VITE_NETWORK: {
    required: true,
    validate: (val) => ['devnet', 'testnet', 'mainnet'].includes(val),
    error: 'Must be: devnet, testnet, or mainnet'
  },
  VITE_VAULT_CONTRACT: {
    required: true,
    validate: (val) => val.match(/^S[A-Z0-9]+\.[a-z0-9-]+$/),
    error: 'Must be valid Stacks contract address (e.g., SP2...ABC.contract-name)'
  }
};

export function validateConfig() {
  const errors = [];
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = import.meta.env[key];
    if (config.required && !value) {
      errors.push(`Missing required env var: ${key}`);
    } else if (value && !config.validate(value)) {
      errors.push(`Invalid ${key}: ${config.error}`);
    }
  }

  if (errors.length > 0) {
    console.error('Configuration Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Invalid configuration. Please check your .env file.');
  }
}
```

### Acceptance Criteria:
- ✅ All required env vars validated at startup
- ✅ Clear error messages for missing/invalid config
- ✅ Setup script helps developers configure
- ✅ Documentation explains all variables
- ✅ Health check endpoint available

---

## Summary of Issues

| # | Issue | Priority | Category | Estimated Fixes |
|---|-------|----------|----------|-----------------|
| 1 | Contracts Not Registered in Clarinet | CRITICAL | Config | 2 commits |
| 2 | Incorrect Transaction Encoding | CRITICAL | Frontend | 4 commits |
| 3 | Missing Test Suite | HIGH | Testing | 5 commits |
| 4 | Hardcoded Placeholder Addresses | HIGH | Config | 3 commits |
| 5 | Missing ALEX DeFi Integration | HIGH | Smart Contract | 6+ commits |
| 6 | No Chainhooks Implementation | MEDIUM | Monitoring | 4 commits |
| 7 | No Oracle Integration | MEDIUM | Risk Mgmt | 4 commits |
| 8 | Incomplete Authorization System | MEDIUM | Security | 3 commits |
| 9 | Network Configuration Issues | MEDIUM | Config | 3 commits |
| 10 | Missing Transaction Status Monitoring | MEDIUM | UX | 4 commits |
| 11 | No Production Build Optimization | LOW | Performance | 3 commits |
| 12 | Missing Environment Variable Validation | LOW | DevEx | 2 commits |

**Total Issues**: 12
**Critical**: 2
**High**: 3
**Medium**: 5
**Low**: 2

---

## Fixing Strategy

Each issue will be fixed in its own branch following this pattern:

1. **Branch naming**: `fix/issue-{number}-{short-description}`
   - Example: `fix/issue-1-register-contracts`

2. **Commit messages**: Maximum 50 characters
   - Use imperative mood: "Add", "Fix", "Update", not "Added", "Fixed"
   - Be specific and descriptive
   - No co-author mentions

3. **Commit frequency**: Multiple small commits per issue
   - Each logical change = one commit
   - Make commits atomic and reversible

4. **Testing**: Each fix must be verified before pushing

5. **Documentation**: Update relevant docs in same branch

---

## Next Steps

1. User manually deploys contracts to mainnet
2. User provides contract addresses
3. We fix issues sequentially (#1 → #12)
4. Each fix gets its own branch and PR
5. User merges PRs between fixes

**Ready to proceed with Issue #1!**
