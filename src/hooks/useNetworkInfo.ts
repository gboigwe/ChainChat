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
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${apiUrl}/extended/v1/block?limit=1`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setBlockHeight(data.results?.[0]?.height ?? null); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [apiUrl]);
  return {
    networkName: network,
    chainId: network === 'mainnet' ? 1 : 2147483648,
    apiUrl,
    blockHeight,
    blockTime: 600,
    isMainnet: network === 'mainnet',
    loading,
  };
}
export const NETWORK_INFO_1 = 1;
export const NETWORK_INFO_2 = 2;
export const NETWORK_INFO_3 = 3;
export const NETWORK_INFO_4 = 4;
export const NETWORK_INFO_5 = 5;
export const NETWORK_INFO_6 = 6;
export const NETWORK_INFO_7 = 7;
export const NETWORK_INFO_8 = 8;
export const NETWORK_INFO_9 = 9;
export const NETWORK_INFO_10 = 10;
export const NETWORK_INFO_11 = 11;
export const NETWORK_INFO_12 = 12;
export const NETWORK_INFO_13 = 13;
export const NETWORK_INFO_14 = 14;
export const NETWORK_INFO_15 = 15;
export const NETWORK_INFO_16 = 16;
export const NETWORK_INFO_17 = 17;
