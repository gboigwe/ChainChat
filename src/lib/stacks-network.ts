/**
 * Stacks Network utilities - multi-network support
 * Wraps @stacks/network with typed configuration
 */

import {
  STACKS_MAINNET,
  STACKS_TESTNET,
  STACKS_DEVNET,
  type StacksNetworkName as SdkNetworkName,
} from '@stacks/network';
import { getCurrentNetworkName, getNetworkConfig, type StacksNetworkName } from '../config/network-config';

/**
 * Get the Stacks.js network object for a given environment
 */
export function getStacksNetwork(name?: StacksNetworkName) {
  const networkName = name ?? getCurrentNetworkName();
  switch (networkName) {
    case 'mainnet':
      return STACKS_MAINNET;
    case 'testnet':
      return STACKS_TESTNET;
    case 'devnet':
      return STACKS_DEVNET;
    default:
      return STACKS_MAINNET;
  }
}

/**
 * Get the base API URL for a given network
 */
export function getApiUrl(name?: StacksNetworkName): string {
  const config = getNetworkConfig(name ?? getCurrentNetworkName());
  return config.endpoints.hiroApiUrl;
}

/**
 * Get the Stacks node RPC URL
 */
export function getNodeUrl(name?: StacksNetworkName): string {
  const config = getNetworkConfig(name ?? getCurrentNetworkName());
  return config.endpoints.stacksNode;
}

/**
 * Check if a network name is mainnet
 */
export function isMainnet(name?: StacksNetworkName): boolean {
  return (name ?? getCurrentNetworkName()) === 'mainnet';
}

/**
 * Check if a network name is a test network
 */
export function isTestNetwork(name?: StacksNetworkName): boolean {
  const n = name ?? getCurrentNetworkName();
  return n === 'testnet' || n === 'devnet';
}

/**
 * Get the chain ID for a given network
 */
export function getChainId(name?: StacksNetworkName): number {
  return getNetworkConfig(name ?? getCurrentNetworkName()).chainId;
}

/**
 * Format contract ID with the network's deployer address
 */
export function formatContractId(contractName: string, name?: StacksNetworkName): string {
  const config = getNetworkConfig(name ?? getCurrentNetworkName());
  return `${config.contractOwner}.${contractName}`;
}

/**
 * Parse a contract ID into address and name parts
 */
export function parseContractId(contractId: string): { address: string; name: string } {
  const parts = contractId.split('.');
  if (parts.length !== 2) {
    throw new Error(`Invalid contract ID: ${contractId}`);
  }
  return { address: parts[0], name: parts[1] };
}

/**
 * Validate a Stacks address format (C32 check encoding)
 */
export function isValidStacksAddress(address: string): boolean {
  return /^S[PM][A-Z0-9]{38,41}$/.test(address);
}

/**
 * Get human-readable network label
 */
export function getNetworkLabel(name?: StacksNetworkName): string {
  const n = name ?? getCurrentNetworkName();
  switch (n) {
    case 'mainnet':
      return 'Mainnet';
    case 'testnet':
      return 'Testnet';
    case 'devnet':
      return 'Devnet (local)';
    default:
      return 'Unknown';
  }
}

export { type StacksNetworkName };
