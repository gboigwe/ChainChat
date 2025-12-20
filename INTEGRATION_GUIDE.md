# ChainChat Integration Guide

Complete guide for integrating with ChainChat contracts deployed on Stacks Mainnet.

## 🎉 Deployment Summary

**All 80 contracts successfully deployed!**

- **Network:** Stacks Mainnet
- **Contract Owner:** `SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84`
- **Total Cost:** 3.127270 STX
- **All contracts:** Renamed with `-v2` suffix

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Stacks.js Integration](#stacksjs-integration)
3. [Chainhooks Setup](#chainhooks-setup)
4. [Contract Interactions](#contract-interactions)
5. [Examples](#examples)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Build TypeScript

```bash
npm run build
```

## 📦 Stacks.js Integration

### Installation

```bash
npm install @stacks/transactions @stacks/network @stacks/common
```

### Basic Setup

```typescript
import { getContractId } from './src/config/contracts';
import { callReadOnlyFunction, executeContractCall, cv } from './src/lib/stacks-client';

// Get contract identifier
const vaultFactoryId = getContractId('vaultFactory');
// Returns: "SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.vault-factory-v2"
```

### Reading Contract Data

```typescript
// Get vault information
const vaultInfo = await callReadOnlyFunction(
  getContractId('vaultRegistry'),
  'get-vault-info',
  [cv.uint(1)],
  'YOUR_STACKS_ADDRESS'
);

console.log(vaultInfo);
```

### Executing Transactions

```typescript
// Create a new vault
const txId = await executeContractCall(
  getContractId('vaultFactory'),
  'create-vault',
  [cv.stringAscii('standard')],
  'YOUR_PRIVATE_KEY'
);

console.log('Transaction ID:', txId);
```

## 🔗 Chainhooks Setup

Chainhooks allow you to listen to on-chain events in real-time.

### Installation

```bash
# Install Chainhook CLI
cargo install chainhook

# Or download from releases
# https://github.com/hirosystems/chainhook/releases
```

### Starting Chainhook Service

```bash
# Start Redis (required for Chainhooks)
docker run -d -p 6379:6379 redis

# Start Chainhook service
npm run chainhook:start
```

### Registering Event Listeners

```bash
# Register all chainhooks
npm run chainhook:register-all

# Or register individually
npm run chainhook:register:vault
npm run chainhook:register:staking
npm run chainhook:register:rewards
npm run chainhook:register:emergency
npm run chainhook:register:liquidation
```

### List Active Chainhooks

```bash
npm run chainhook:list
```

## 📝 Contract Interactions

### Vault System

#### Create Vault
```typescript
import { createVault } from './src/examples/vault-integration';

const txId = await createVault(privateKey, 'standard');
```

#### Stake Tokens
```typescript
import { stakeTokens } from './src/examples/vault-integration';

// Stake 1000 tokens with 30-day lock
const txId = await stakeTokens(privateKey, 1000000000, 2592000);
```

#### Claim Rewards
```typescript
import { claimRewards } from './src/examples/vault-integration';

const txId = await claimRewards(privateKey, poolId);
```

### Collateral Management

```typescript
const collateralId = getContractId('collateralManager');

// Deposit collateral
const depositTxId = await executeContractCall(
  collateralId,
  'deposit-collateral',
  [
    cv.principal('TOKEN_CONTRACT'),
    cv.uint(1000000)
  ],
  privateKey
);

// Check collateral balance
const balance = await callReadOnlyFunction(
  collateralId,
  'get-collateral-balance',
  [
    cv.principal(userAddress),
    cv.principal('TOKEN_CONTRACT')
  ],
  userAddress
);
```

### Liquidation Engine

```typescript
const liquidationId = getContractId('liquidationEngine');

// Check if position is liquidatable
const isLiquidatable = await callReadOnlyFunction(
  liquidationId,
  'is-liquidatable',
  [cv.principal(positionAddress)],
  userAddress
);

// Execute liquidation
if (isLiquidatable) {
  const txId = await executeContractCall(
    liquidationId,
    'liquidate-position',
    [cv.principal(positionAddress)],
    privateKey
  );
}
```

### Governance

```typescript
const governanceId = getContractId('governanceToken');

// Get voting power
const votingPower = await callReadOnlyFunction(
  governanceId,
  'get-voting-power',
  [cv.principal(userAddress)],
  userAddress
);

// Cast vote
const voteTxId = await executeContractCall(
  governanceId,
  'vote',
  [
    cv.uint(proposalId),
    cv.bool(true) // vote for
  ],
  privateKey
);
```

## 💡 Examples

### Example 1: Vault Creation and Staking

```typescript
import { createVault, stakeTokens, getStakeInfo } from './src/examples/vault-integration';

async function example1() {
  const privateKey = process.env.STACKS_PRIVATE_KEY!;
  const address = process.env.STACKS_ADDRESS!;

  // Step 1: Create vault
  console.log('Creating vault...');
  const vaultTxId = await createVault(privateKey, 'yield');
  console.log('Vault created:', vaultTxId);

  // Step 2: Stake tokens
  console.log('Staking tokens...');
  const stakeTxId = await stakeTokens(
    privateKey,
    5000000000, // 5000 tokens
    7776000 // 90-day lock
  );
  console.log('Tokens staked:', stakeTxId);

  // Step 3: Check stake info
  const stakeInfo = await getStakeInfo(address);
  console.log('Stake information:', stakeInfo);
}
```

### Example 2: Monitoring Events with Chainhooks

```typescript
// webhook-handler.ts
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/vault-created', async (req, res) => {
  const event = req.body;

  console.log('New vault created!');
  console.log('Transaction:', event.apply[0].transactions[0]);

  // Process the event
  // - Send notification
  // - Update database
  // - Trigger other actions

  res.status(200).send('OK');
});

app.post('/webhooks/staking-event', async (req, res) => {
  const event = req.body;

  console.log('Staking event detected!');

  event.apply.forEach(block => {
    block.transactions.forEach(tx => {
      tx.metadata.events.forEach(e => {
        if (e.type === 'print_event' && e.data.includes('tokens-staked')) {
          console.log('User staked tokens:', e.data);
        }
      });
    });
  });

  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Example 3: Real-time Liquidation Monitoring

```typescript
app.post('/webhooks/liquidation-event', async (req, res) => {
  const event = req.body;

  event.apply.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.metadata.success) {
        tx.metadata.events.forEach(e => {
          if (e.type === 'print_event' && e.data.includes('position-liquidated')) {
            // Extract liquidation data
            const liquidationData = JSON.parse(e.data);

            console.log('Liquidation executed:', {
              position: liquidationData.position,
              liquidator: liquidationData.liquidator,
              amount: liquidationData.amount,
              block: block.block_identifier.index
            });

            // Alert system or take action
            sendLiquidationAlert(liquidationData);
          }
        });
      }
    });
  });

  res.status(200).send('OK');
});
```

## 🔧 Available Contracts

### Core Contracts (25)
- vault-factory-v2
- vault-registry-v2
- vault-staking-v2
- vault-rewards-v2
- vault-emergency-v2
- collateral-manager-v2
- liquidation-engine-v2
- governance-token-v2
- swap-router-v2
- ... and 16 more

### Strategy Contracts (17)
- strategy-alex-pool-v2
- strategy-arkadiko-stake-v2
- strategy-ststx-stake-v2
- strategy-velar-lp-v2
- strategy-yield-farming-v2
- ... and 12 more

### Utility Contracts (21)
- math-library-v2
- array-utils-v2
- string-utils-v2
- time-utils-v2
- ... and 17 more

### Oracle & Risk (13)
- price-oracle-pyth-v2
- price-oracle-redstone-v2
- price-feed-aggregator-v2
- risk-assessment-v2
- ... and 9 more

### Access & Security (6)
- access-control-v2
- multi-sig-v2
- kyc-registry-v2
- ... and 3 more

See `src/config/contracts.ts` for the complete list.

## 📚 Resources

- [Stacks.js Documentation](https://docs.hiro.so/stacks.js)
- [Chainhooks Documentation](https://github.com/hirosystems/chainhook)
- [Stacks API Reference](https://docs.hiro.so/api)
- [Contract Source Code](https://github.com/gboigwe/ChainChat)

## 🆘 Support

For issues or questions:
- Check the contract source in `contracts/`
- Review example code in `src/examples/`
- Consult Chainhooks README in `chainhooks/README.md`

## 📄 License

MIT
