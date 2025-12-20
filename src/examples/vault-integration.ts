/**
 * Example: Vault System Integration
 * Demonstrates how to interact with deployed vault contracts
 */

import { getContractId } from '../config/contracts';
import { callReadOnlyFunction, executeContractCall, cv, waitForTransaction } from '../lib/stacks-client';

/**
 * Create a new vault using vault-factory-v2
 */
export async function createVault(
  senderKey: string,
  vaultType: string
): Promise<string> {
  const contractId = getContractId('vaultFactory');

  const txId = await executeContractCall(
    contractId,
    'create-vault',
    [cv.stringAscii(vaultType)],
    senderKey
  );

  console.log(`Vault creation transaction: ${txId}`);

  // Wait for confirmation
  const result = await waitForTransaction(txId);
  console.log(`Vault created successfully!`, result);

  return txId;
}

/**
 * Get vault information from vault-registry-v2
 */
export async function getVaultInfo(
  vaultId: number,
  senderAddress: string
): Promise<any> {
  const contractId = getContractId('vaultRegistry');

  const result = await callReadOnlyFunction(
    contractId,
    'get-vault-info',
    [cv.uint(vaultId)],
    senderAddress
  );

  return result;
}

/**
 * Stake tokens in vault-staking-v2
 */
export async function stakeTokens(
  senderKey: string,
  amount: number,
  lockPeriod: number
): Promise<string> {
  const contractId = getContractId('vaultStaking');

  const txId = await executeContractCall(
    contractId,
    'stake',
    [cv.uint(amount), cv.uint(lockPeriod)],
    senderKey
  );

  console.log(`Staking transaction: ${txId}`);
  return txId;
}

/**
 * Get staking information for a user
 */
export async function getStakeInfo(
  userAddress: string
): Promise<any> {
  const contractId = getContractId('vaultStaking');

  const result = await callReadOnlyFunction(
    contractId,
    'get-stake',
    [cv.principal(userAddress)],
    userAddress
  );

  return result;
}

/**
 * Claim rewards from vault-rewards-v2
 */
export async function claimRewards(
  senderKey: string,
  poolId: number
): Promise<string> {
  const contractId = getContractId('vaultRewards');

  const txId = await executeContractCall(
    contractId,
    'claim-rewards',
    [cv.uint(poolId)],
    senderKey
  );

  console.log(`Claim rewards transaction: ${txId}`);
  return txId;
}

/**
 * Get pending rewards for a user
 */
export async function getPendingRewards(
  poolId: number,
  userAddress: string
): Promise<any> {
  const contractId = getContractId('vaultRewards');

  const result = await callReadOnlyFunction(
    contractId,
    'get-pending-rewards',
    [cv.uint(poolId), cv.principal(userAddress)],
    userAddress
  );

  return result;
}

/**
 * Check if emergency mode is active
 */
export async function isEmergencyActive(
  senderAddress: string
): Promise<boolean> {
  const contractId = getContractId('vaultEmergency');

  const result = await callReadOnlyFunction(
    contractId,
    'is-emergency-active',
    [],
    senderAddress
  );

  return result.value;
}

// Example usage
async function main() {
  const SENDER_KEY = process.env.STACKS_PRIVATE_KEY!;
  const SENDER_ADDRESS = process.env.STACKS_ADDRESS!;

  try {
    // Create a new vault
    console.log('Creating new vault...');
    const createTxId = await createVault(SENDER_KEY, 'standard');

    // Get vault info
    console.log('Fetching vault info...');
    const vaultInfo = await getVaultInfo(1, SENDER_ADDRESS);
    console.log('Vault Info:', vaultInfo);

    // Stake tokens (1000 tokens, 30 day lock)
    console.log('Staking tokens...');
    const stakeTxId = await stakeTokens(SENDER_KEY, 1000000000, 2592000);

    // Get stake info
    console.log('Fetching stake info...');
    const stakeInfo = await getStakeInfo(SENDER_ADDRESS);
    console.log('Stake Info:', stakeInfo);

    // Get pending rewards
    console.log('Checking pending rewards...');
    const pendingRewards = await getPendingRewards(1, SENDER_ADDRESS);
    console.log('Pending Rewards:', pendingRewards);

    // Check emergency status
    const emergencyActive = await isEmergencyActive(SENDER_ADDRESS);
    console.log('Emergency Active:', emergencyActive);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run
// main();
