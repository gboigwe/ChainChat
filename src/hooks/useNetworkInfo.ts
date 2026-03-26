// Network information hook
import { useState, useEffect } from 'react';
/** Network info state */
export interface NetworkInfoState {
  networkName: string;
  chainId: number;
  apiUrl: string;
  blockHeight: number | null;
  blockTime: number;
  isMainnet: boolean;
  loading: boolean;
}
/** Hook to get current network information */
export function useNetworkInfo(network: 'mainnet' | 'testnet' = 'mainnet'): NetworkInfoState {
  const apiUrl = network === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
