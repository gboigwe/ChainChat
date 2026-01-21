#!/usr/bin/env node
/**
 * STACKS ULTIMATE AUTOMATION SCRIPT
 * Multi-wallet contract interaction for Stacks blockchain
 * Similar to susu-ultimate.sh but for Stacks
 */

import {
  makeContractCall,
  makeSTXTokenTransfer,
  broadcastTransaction,
  getNonce,
  AnchorMode,
  PostConditionMode,
  Cl,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  cvToJSON,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { generateWallet, generateSecretKey, generateNewAccount, getStxAddress } from '@stacks/wallet-sdk';
import { TransactionVersion } from '@stacks/common';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  network: process.env.STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet(),
  networkName: process.env.STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',

  // Your deployed contracts (update these!)
  vaultContract: process.env.VAULT_CONTRACT || 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.vault',
  engineContract: process.env.ENGINE_CONTRACT || 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.ai-engine',
  tokenContract: process.env.TOKEN_CONTRACT || 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.token',

  // Wallet configuration
  mainMnemonic: process.env.MAIN_MNEMONIC,
  numSupportingWallets: parseInt(process.env.NUM_WALLETS || '10'),

  // Transaction amounts (in micro-STX: 1 STX = 1,000,000 micro-STX)
  distributionAmount: 500000n, // 0.5 STX per wallet
  contributionAmount: 100000n, // 0.1 STX per contribution
};

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[0;32m',
  blue: '\x1b[0;34m',
  yellow: '\x1b[1;33m',
  red: '\x1b[0;31m',
  cyan: '\x1b[0;36m',
  purple: '\x1b[0;35m',
};

// Nonce tracker
class NonceTracker {
  constructor() {
    this.nonces = new Map();
  }

  async getNonce(address, network) {
    if (!this.nonces.has(address)) {
      const nonce = await getNonce(address, network);
      this.nonces.set(address, nonce);
    }
    return this.nonces.get(address);
  }

  incrementNonce(address) {
    const current = this.nonces.get(address) || 0n;
    this.nonces.set(address, current + 1n);
  }
}

const nonceTracker = new NonceTracker();
let txCount = 0;

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatAddress(address) {
  return `${address.slice(0, 10)}...${address.slice(-4)}`;
}

function microStxToStx(microStx) {
  return Number(microStx) / 1000000;
}

async function getBalance(address, network) {
  try {
    const url = `${network.coreApiUrl}/v2/accounts/${address}`;
    const response = await fetch(url);
    const data = await response.json();
    return BigInt(data.balance);
  } catch (error) {
    console.error(`Error getting balance for ${address}:`, error.message);
    return 0n;
  }
}

async function waitForConfirmation(txid, network, maxAttempts = 20) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txid}`;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.tx_status === 'success') {
        return true;
      } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        return false;
      }

      await sleep(5000);
    } catch (error) {
      // Transaction not yet in mempool, keep waiting
      await sleep(5000);
    }
  }

  return false;
}

// ═══════════════════════════════════════════════════════════
// WALLET MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function setupWallets() {
  log('\n🔑 Setting up wallets...', 'cyan');

  if (!CONFIG.mainMnemonic) {
    throw new Error('MAIN_MNEMONIC not set in .env');
  }

  const password = 'stacks-ultimate';
  let wallet = await generateWallet({
    secretKey: CONFIG.mainMnemonic,
    password
  });

  // Generate additional accounts
  for (let i = 1; i < CONFIG.numSupportingWallets; i++) {
    wallet = generateNewAccount(wallet);
  }

  const transactionVersion = CONFIG.network.isMainnet()
    ? TransactionVersion.Mainnet
    : TransactionVersion.Testnet;

  const accounts = wallet.accounts.map((account, index) => ({
    index,
    address: getStxAddress({ account, transactionVersion }),
    privateKey: account.stxPrivateKey,
    account
  }));

  log(`   ✅ Created ${accounts.length} wallet accounts`, 'green');

  return accounts;
}

// ═══════════════════════════════════════════════════════════
// TRANSACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function transferSTX(fromAccount, toAddress, amount, memo = '') {
  try {
    const nonce = await nonceTracker.getNonce(fromAccount.address, CONFIG.network);

    const txOptions = {
      recipient: toAddress,
      amount: amount,
      memo: memo,
      senderKey: fromAccount.privateKey,
      network: CONFIG.network,
      nonce: nonce,
      anchorMode: AnchorMode.Any,
      fee: 1000n,
    };

    const transaction = await makeSTXTokenTransfer(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network: CONFIG.network });

    if (broadcastResponse.error) {
      throw new Error(`${broadcastResponse.error}: ${broadcastResponse.reason}`);
    }

    nonceTracker.incrementNonce(fromAccount.address);
    txCount++;

    return {
      success: true,
      txid: broadcastResponse.txid,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function callContract(account, contractAddress, contractName, functionName, functionArgs = [], postConditions = []) {
  try {
    const nonce = await nonceTracker.getNonce(account.address, CONFIG.network);

    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      senderKey: account.privateKey,
      network: CONFIG.network,
      nonce: nonce,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      fee: 10000n,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network: CONFIG.network });

    if (broadcastResponse.error) {
      throw new Error(`${broadcastResponse.error}: ${broadcastResponse.reason}`);
    }

    nonceTracker.incrementNonce(account.address);
    txCount++;

    return {
      success: true,
      txid: broadcastResponse.txid,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function callReadOnly(contractAddress, contractName, functionName, functionArgs = [], senderAddress) {
  try {
    const url = `${CONFIG.network.coreApiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: senderAddress,
        arguments: functionArgs.map(arg => {
          if (typeof arg === 'object' && arg.buffer) {
            return `0x${arg.buffer.toString('hex')}`;
          }
          return Cl.serialize(arg);
        }),
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Read-only call failed:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN SCRIPT EXECUTION
// ═══════════════════════════════════════════════════════════

async function main() {
  log('═══════════════════════════════════════════════════════════', 'purple');
  log('  STACKS ULTIMATE SCRIPT - Maximum Contract Interactions', 'purple');
  log('═══════════════════════════════════════════════════════════\n', 'purple');

  // Parse contract addresses
  const [vaultAddr, vaultName] = CONFIG.vaultContract.split('.');
  const [engineAddr, engineName] = CONFIG.engineContract.split('.');
  const [tokenAddr, tokenName] = CONFIG.tokenContract ? CONFIG.tokenContract.split('.') : [null, null];

  // Setup wallets
  const accounts = await setupWallets();
  const mainAccount = accounts[0];
  const supportAccounts = accounts.slice(1);

  log(`\n📋 Main Address: ${mainAccount.address}`, 'blue');
  log(`   Supporting: ${supportAccounts.length} addresses`, 'blue');

  // Check initial balance
  const initialBalance = await getBalance(mainAccount.address, CONFIG.network);
  log(`\n💰 Initial Balance: ${microStxToStx(initialBalance)} STX\n`, 'blue');

  // ═══════════════════════════════════════════════════════════
  // PART 1: DISTRIBUTE FUNDS
  // ═══════════════════════════════════════════════════════════

  log('[PART 1] Distributing funds to supporting addresses...', 'green');
  log(`   Amount per address: ${microStxToStx(CONFIG.distributionAmount)} STX\n`, 'green');

  for (const [i, account] of supportAccounts.entries()) {
    log(`  📤 Support${i + 1}: ${formatAddress(account.address)}`, 'reset');

    const result = await transferSTX(
      mainAccount,
      account.address,
      CONFIG.distributionAmount,
      `Distribution ${i + 1}`
    );

    if (result.success) {
      log(`     ✅ ${result.txid}`, 'green');
    } else {
      log(`     ❌ ${result.error}`, 'red');
    }

    await sleep(2000);
  }

  log(`\n  ✅ Distributed to ${supportAccounts.length} addresses\n`, 'green');

  // ═══════════════════════════════════════════════════════════
  // PART 2: READ-ONLY CONTRACT QUERIES
  // ═══════════════════════════════════════════════════════════

  log('[PART 2] Querying contract state (read-only)...', 'cyan');

  // Query vault contract
  if (vaultAddr && vaultName) {
    log(`\n  📊 Vault Contract: ${vaultAddr}.${vaultName}`, 'cyan');

    // Example read-only calls (adjust based on your contract functions)
    const examples = [
      { fn: 'get-total-deposits', args: [] },
      { fn: 'get-user-balance', args: [Cl.principal(mainAccount.address)] },
      { fn: 'get-contract-balance', args: [] },
    ];

    for (const { fn, args } of examples) {
      try {
        const result = await callReadOnly(vaultAddr, vaultName, fn, args, mainAccount.address);
        if (result && result.okay) {
          log(`     ${fn}: ${JSON.stringify(cvToJSON(Cl.deserialize(result.result)))}`, 'reset');
        }
      } catch (e) {
        // Function might not exist, skip
      }
      await sleep(1000);
    }
  }

  log(`\n  ✅ Contract queries complete\n`, 'cyan');

  // ═══════════════════════════════════════════════════════════
  // PART 3: CONTRACT INTERACTIONS FROM MAIN ACCOUNT
  // ═══════════════════════════════════════════════════════════

  log('[PART 3] Main account contract interactions...', 'yellow');

  if (vaultAddr && vaultName) {
    // Example: Deposit to vault (adjust function name and args for your contract)
    log(`\n  💰 Depositing to vault...`, 'yellow');

    const postConditions = [
      makeStandardSTXPostCondition(
        mainAccount.address,
        FungibleConditionCode.LessEqual,
        CONFIG.contributionAmount
      ),
    ];

    const result = await callContract(
      mainAccount,
      vaultAddr,
      vaultName,
      'deposit', // Adjust to your contract's function
      [Cl.uint(CONFIG.contributionAmount)],
      postConditions
    );

    if (result.success) {
      log(`     ✅ Deposit successful: ${result.txid}`, 'green');
    } else {
      log(`     ❌ Deposit failed: ${result.error}`, 'red');
    }

    await sleep(3000);
  }

  log(`\n  ✅ Main account interactions complete\n`, 'yellow');

  // ═══════════════════════════════════════════════════════════
  // PART 4: ALL ACCOUNTS INTERACT WITH CONTRACT
  // ═══════════════════════════════════════════════════════════

  log('[PART 4] All supporting accounts interacting...', 'blue');

  if (vaultAddr && vaultName) {
    log(`\n  👥 ${supportAccounts.length} addresses calling contract...`, 'blue');

    for (const [i, account] of supportAccounts.entries()) {
      log(`     Support${i + 1}: ${formatAddress(account.address)}`, 'reset');

      const postConditions = [
        makeStandardSTXPostCondition(
          account.address,
          FungibleConditionCode.LessEqual,
          CONFIG.contributionAmount
        ),
      ];

      const result = await callContract(
        account,
        vaultAddr,
        vaultName,
        'deposit', // Adjust to your contract's function
        [Cl.uint(CONFIG.contributionAmount / 2n)], // Smaller amount for supporting accounts
        postConditions
      );

      if (result.success) {
        log(`        ✅ ${result.txid}`, 'green');
      } else {
        log(`        ❌ ${result.error}`, 'red');
      }

      await sleep(2000);
    }
  }

  log(`\n  ✅ All supporting accounts interacted\n`, 'blue');

  // ═══════════════════════════════════════════════════════════
  // PART 5: ENGINE CONTRACT INTERACTIONS (if configured)
  // ═══════════════════════════════════════════════════════════

  if (engineAddr && engineName && engineAddr !== vaultAddr) {
    log('[PART 5] AI Engine contract interactions...', 'cyan');

    // Example engine interactions (adjust for your contract)
    for (let i = 0; i < 3; i++) {
      const result = await callContract(
        mainAccount,
        engineAddr,
        engineName,
        'execute-strategy', // Adjust to your contract's function
        [
          Cl.stringAscii(`Strategy${i + 1}`),
          Cl.uint(1000000),
        ],
        []
      );

      if (result.success) {
        log(`  ✅ Engine call ${i + 1}: ${result.txid}`, 'green');
      } else {
        log(`  ❌ Engine call ${i + 1}: ${result.error}`, 'red');
      }

      await sleep(3000);
    }

    log(`\n  ✅ Engine interactions complete\n`, 'cyan');
  }

  // ═══════════════════════════════════════════════════════════
  // PART 6: TOKEN INTERACTIONS (if token contract configured)
  // ═══════════════════════════════════════════════════════════

  if (tokenAddr && tokenName) {
    log('[PART 6] Token contract interactions...', 'purple');

    // Transfer tokens to supporting addresses
    for (const [i, account] of supportAccounts.slice(0, 5).entries()) {
      const result = await callContract(
        mainAccount,
        tokenAddr,
        tokenName,
        'transfer', // SIP-010 standard
        [
          Cl.uint(100000n), // 0.1 tokens (adjust decimals)
          Cl.principal(mainAccount.address),
          Cl.principal(account.address),
          Cl.none(),
        ],
        []
      );

      if (result.success) {
        log(`  💸 Transferred to Support${i + 1}: ${result.txid}`, 'green');
      } else {
        log(`  ❌ Transfer failed: ${result.error}`, 'red');
      }

      await sleep(2000);
    }

    log(`\n  ✅ Token interactions complete\n`, 'purple');
  }

  // ═══════════════════════════════════════════════════════════
  // PART 7: SWEEP FUNDS BACK
  // ═══════════════════════════════════════════════════════════

  log('[PART 7] Sweeping funds back to main account...', 'yellow');

  for (const [i, account] of supportAccounts.entries()) {
    const balance = await getBalance(account.address, CONFIG.network);

    // Keep 0.01 STX for future transactions, sweep the rest
    const reserveAmount = 10000n; // 0.01 STX
    const feeAmount = 1000n; // Transaction fee

    if (balance > reserveAmount + feeAmount) {
      const toSweep = balance - reserveAmount - feeAmount;

      const result = await transferSTX(
        account,
        mainAccount.address,
        toSweep,
        'Sweep'
      );

      if (result.success) {
        log(`  💸 Swept ${microStxToStx(toSweep)} STX from Support${i + 1}`, 'green');
      }

      await sleep(1000);
    }
  }

  log(`\n  ✅ Sweep complete\n`, 'yellow');

  // ═══════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════

  const finalBalance = await getBalance(mainAccount.address, CONFIG.network);
  const spent = initialBalance - finalBalance;

  log('\n═══════════════════════════════════════════════════════════', 'purple');
  log('              🎉 STACKS SCRIPT COMPLETE! 🎉', 'purple');
  log('═══════════════════════════════════════════════════════════\n', 'purple');

  log('📊 SUMMARY:', 'cyan');
  log(`   ✅ Total Transactions: ${txCount}`, 'green');
  log('', 'reset');
  log('💰 BALANCE:', 'cyan');
  log(`   Starting: ${microStxToStx(initialBalance)} STX`, 'reset');
  log(`   Final: ${microStxToStx(finalBalance)} STX`, 'reset');
  log(`   Spent: ${microStxToStx(spent)} STX (fees)`, 'reset');
  log('', 'reset');
  log('📈 CONTRACT INTERACTIONS:', 'cyan');
  log(`   ${vaultAddr ? '✅' : '⚠️ '} Vault: ${vaultAddr || 'Not configured'}`, 'green');
  log(`   ${engineAddr ? '✅' : '⚠️ '} Engine: ${engineAddr || 'Not configured'}`, 'green');
  log(`   ${tokenAddr ? '✅' : '⚠️ '} Token: ${tokenAddr || 'Not configured'}`, 'green');
  log('', 'reset');
  log('🔗 View Activity:', 'cyan');
  const explorerBase = CONFIG.network.isMainnet()
    ? 'https://explorer.hiro.so'
    : 'https://explorer.hiro.so/?chain=testnet';
  log(`   ${explorerBase}/address/${mainAccount.address}`, 'reset');
  log('', 'reset');
}

// Run the script
main()
  .then(() => {
    log('\n✅ Script execution completed successfully', 'green');
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Script failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
