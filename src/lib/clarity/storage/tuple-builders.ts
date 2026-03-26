// Typed tuple builders for Clarity contract data structures
/** Message storage tuple */
export interface MessageStorageTuple {
  sender: string;
  content: string;
  'channel-id': bigint;
  'created-at': bigint;
  'reply-to': bigint | null;
  reactions: bigint;
}
