/**
 * Mainnet Contract Interaction Test
 * Tests reading data from deployed ChainChat contracts on Stacks Mainnet
 */

import { getContractId } from '../src/config/contracts.js';
import { callReadOnlyFunction, getContractInfo, getContractSource } from '../src/lib/stacks-client.js';
import { cv } from '../src/lib/stacks-client.js';

// Use any Stacks address for read-only calls
const SENDER_ADDRESS = 'SP000000000000000000002Q6VF78';

async function testVaultFactory() {
  console.log('\n=== Testing Vault Factory ===');
  const contractId = getContractId('vaultFactory');
  console.log('Contract ID:', contractId);

  try {
    // Get contract info
    const info = await getContractInfo(contractId);
    console.log('✅ Contract exists on mainnet');
    console.log('Functions available:', info.functions.length);

    // Try to get vault count (if the contract has this function)
    try {
      const vaultCount = await callReadOnlyFunction(
        contractId,
        'get-vault-count',
        [],
        SENDER_ADDRESS
      );
      console.log('Total vaults created:', vaultCount);
    } catch (e) {
      console.log('Note: get-vault-count function may not exist in this contract');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testVaultRegistry() {
  console.log('\n=== Testing Vault Registry ===');
  const contractId = getContractId('vaultRegistry');
  console.log('Contract ID:', contractId);

  try {
    const info = await getContractInfo(contractId);
    console.log('✅ Contract exists on mainnet');
    console.log('Functions available:', info.functions.length);

    // Try to get vault info for vault ID 1
    try {
      const vaultInfo = await callReadOnlyFunction(
        contractId,
        'get-vault-info',
        [cv.uint(1)],
        SENDER_ADDRESS
      );
      console.log('Vault #1 info:', vaultInfo);
    } catch (e) {
      console.log('Note: No vault with ID 1 found (this is expected if no vaults created yet)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testGovernanceToken() {
  console.log('\n=== Testing Governance Token ===');
  const contractId = getContractId('governanceToken');
  console.log('Contract ID:', contractId);

  try {
    const info = await getContractInfo(contractId);
    console.log('✅ Contract exists on mainnet');

    // Get token name and symbol
    try {
      const name = await callReadOnlyFunction(
        contractId,
        'get-name',
        [],
        SENDER_ADDRESS
      );
      console.log('Token name:', name);

      const symbol = await callReadOnlyFunction(
        contractId,
        'get-symbol',
        [],
        SENDER_ADDRESS
      );
      console.log('Token symbol:', symbol);

      const decimals = await callReadOnlyFunction(
        contractId,
        'get-decimals',
        [],
        SENDER_ADDRESS
      );
      console.log('Token decimals:', decimals);
    } catch (e) {
      console.log('Note: Token info functions may have different names');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testPriceOracle() {
  console.log('\n=== Testing Price Oracle ===');
  const contractId = getContractId('priceOraclePyth');
  console.log('Contract ID:', contractId);

  try {
    const info = await getContractInfo(contractId);
    console.log('✅ Contract exists on mainnet');
    console.log('Functions available:', info.functions.length);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function listAllContracts() {
  console.log('\n=== All Deployed Contracts ===');

  const contractNames = [
    'vaultFactory',
    'vaultRegistry',
    'vaultStaking',
    'vaultRewards',
    'governanceToken',
    'collateralManager',
    'liquidationEngine',
    'priceOraclePyth',
  ];

  for (const name of contractNames) {
    try {
      const contractId = getContractId(name as any);
      const info = await getContractInfo(contractId);
      console.log(`✅ ${name}: ${info.functions.length} functions`);
    } catch (error) {
      console.log(`❌ ${name}: Not found or error`);
    }
  }
}

async function main() {
  console.log('🌐 Testing ChainChat Contracts on Stacks Mainnet');
  console.log('Contract Owner: SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84');
  console.log('Network: https://api.hiro.so\n');

  await testVaultFactory();
  await testVaultRegistry();
  await testGovernanceToken();
  await testPriceOracle();
  await listAllContracts();

  console.log('\n✨ Mainnet interaction test complete!');
}

main().catch(console.error);
