// Clarity contract error code registry
/** Error: sender is not a channel member */
export const ERR_NOT_MEMBER = 100n;
/** Error: channel does not exist */
export const ERR_CHANNEL_NOT_FOUND = 101n;
/** Error: message does not exist */
export const ERR_MESSAGE_NOT_FOUND = 102n;
/** Error: sender has already reacted */
export const ERR_ALREADY_REACTED = 103n;
/** Error: principal is already a member */
export const ERR_ALREADY_MEMBER = 104n;
/** Error: cannot kick channel owner */
export const ERR_CANNOT_KICK_OWNER = 105n;
/** Error: permission denied for action */
export const ERR_PERMISSION_DENIED = 106n;
/** Error: message content is empty */
export const ERR_EMPTY_CONTENT = 107n;
/** Error: invite has expired */
export const ERR_INVITE_EXPIRED = 108n;
/** Error: channel is at capacity */
export const ERR_CHANNEL_CAPACITY = 109n;

/** Map from error code to description */
export const CONTRACT_ERROR_DESCRIPTIONS: Record<number, string> = {
  100: 'Not a channel member',
  101: 'Channel not found',
  102: 'Message not found',
  103: 'Already reacted',
  104: 'Already a member',
  105: 'Cannot kick channel owner',
  106: 'Permission denied',
  107: 'Empty content',
  108: 'Invite expired',
  109: 'Channel at capacity',
};

/** Look up description for contract error code */
export function describeContractError(code: bigint): string {
  return CONTRACT_ERROR_DESCRIPTIONS[Number(code)] ?? `Unknown contract error: ${code}`;
}

/** Error: reply target message not found */
export const ERR_REPLY_TARGET_NOT_FOUND = 110n;

/** Error: attachment too large */
export const ERR_ATTACHMENT_TOO_LARGE = 111n;

/** Error: invalid reaction code */
export const ERR_INVALID_REACTION = 112n;
/** Error: rate limit exceeded */
export const ERR_RATE_LIMIT = 429n;
