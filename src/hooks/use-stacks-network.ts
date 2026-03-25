/**
 * React hook for Stacks network state
 * Provides current network config and switching utilities
 */

import { useState, useCallback, useEffect } from 'react';
import {
  type StacksNetworkName,
  type NetworkConfig,
  getNetworkConfig,
  getCurrentNetworkName,
  NETWORK_CONFIGS,
} from '../config/network-config';
import { getStacksNetwork, getNetworkLabel } from '../lib/stacks-network';

interface UseStacksNetworkResult {
  networkName: StacksNetworkName;
  networkConfig: NetworkConfig;
  networkLabel: string;
  isMainnet: boolean;
  isTestnet: boolean;
  isDevnet: boolean;
  switchNetwork: (name: StacksNetworkName) => void;
  availableNetworks: StacksNetworkName[];
}

const STORAGE_KEY = 'chainchat_network';

function persistNetwork(name: StacksNetworkName): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // ignore storage errors
  }
}

function loadPersistedNetwork(): StacksNetworkName | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'mainnet' || stored === 'testnet' || stored === 'devnet') return stored;
  } catch {
    // ignore
  }
  return null;
}

export function useStacksNetwork(): UseStacksNetworkResult {
  const [networkName, setNetworkName] = useState<StacksNetworkName>(() => {
    return loadPersistedNetwork() ?? getCurrentNetworkName();
  });

  const networkConfig = getNetworkConfig(networkName);
  const networkLabel = getNetworkLabel(networkName);

  const switchNetwork = useCallback((name: StacksNetworkName) => {
    setNetworkName(name);
    persistNetwork(name);
  }, []);

  return {
    networkName,
    networkConfig,
    networkLabel,
    isMainnet: networkName === 'mainnet',
    isTestnet: networkName === 'testnet',
    isDevnet: networkName === 'devnet',
    switchNetwork,
    availableNetworks: Object.keys(NETWORK_CONFIGS) as StacksNetworkName[],
  };
}
