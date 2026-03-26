// Contract events polling hook
import { useState, useCallback, useEffect } from 'react';
/** Contract event */
export interface ContractEvent {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log?: { contract_id: string; topic: string; value: string };
}
