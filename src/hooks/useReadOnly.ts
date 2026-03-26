// Generic read-only contract call hook
import { useState, useCallback } from 'react';
/** Options for useReadOnly hook */
export interface UseReadOnlyOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: unknown[];
  sender?: string;
  apiUrl?: string;
}
