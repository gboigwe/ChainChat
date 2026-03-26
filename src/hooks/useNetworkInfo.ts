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
