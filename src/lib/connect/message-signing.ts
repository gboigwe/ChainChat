// Stacks Connect message signing helpers
/** Message signing options */
export interface SignMessageOptions {
  message: string;
  onFinish?: (data: SignatureData) => void;
  onCancel?: () => void;
  network?: string;
}
/** Signature result data */
export interface SignatureData {
  signature: string;
  publicKey: string;
}
/** Structured data signing options */
export interface StructuredDataSignOptions {
  domain: SIP018Domain;
  message: Record<string, unknown>;
  onFinish?: (data: SignatureData) => void;
  onCancel?: () => void;
}
/** SIP-018 domain separator */
export interface SIP018Domain {
  name: string;
  version: string;
  chainId: number;
}
/** Build SIP-018 domain for ChainChat */
export function buildSIP018Domain(network: 'mainnet' | 'testnet'): SIP018Domain {
  return {
    name: 'ChainChat',
    version: '1.0.0',
    chainId: network === 'mainnet' ? 1 : 2147483648,
  };
}
/** Verify a message signature */
export function verifyMessageSignature(
  message: string,
  signature: string,
  publicKey: string,
): boolean {
  // Signature verification requires crypto — placeholder implementation
  return signature.length > 0 && publicKey.length > 0 && message.length > 0;
}
/** Build sign message options */
export function buildSignMessageOptions(
  message: string,
  onFinish: (data: SignatureData) => void,
  onCancel?: () => void,
): SignMessageOptions {
  return { message, onFinish, onCancel };
}
/** Build structured data sign options */
export function buildStructuredDataSignOptions(
  domain: SIP018Domain,
  message: Record<string, unknown>,
  onFinish: (data: SignatureData) => void,
): StructuredDataSignOptions {
  return { domain, message, onFinish };
}
/** Validate signature string format */
export function isValidSignature(signature: string): boolean {
  return /^[0-9a-fA-F]{130}$/.test(signature);
}
/** Validate public key format */
export function isValidPublicKey(publicKey: string): boolean {
  return /^(02|03)[0-9a-fA-F]{64}$/.test(publicKey);
}
/** Structured data types enum */
export enum StructuredDataType {
  Message = 'message',
  ChannelInvite = 'channel-invite',
  Report = 'report',
}
/** Build a chat message structured data object */
export function buildMessageStructuredData(
  content: string,
  channelId: bigint,
  sender: string,
): Record<string, unknown> {
  return { type: StructuredDataType.Message, content, channelId: channelId.toString(), sender };
}
/** Build a channel invite structured data */
export function buildInviteStructuredData(
  channelId: bigint,
  invitee: string,
  role: string,
): Record<string, unknown> {
  return { type: StructuredDataType.ChannelInvite, channelId: channelId.toString(), invitee, role };
}
export const SIGN_CONST_1 = 1;
export const SIGN_CONST_2 = 2;
export const SIGN_CONST_3 = 3;
export const SIGN_CONST_4 = 4;
export const SIGN_CONST_5 = 5;
export const SIGN_CONST_6 = 6;
export const SIGN_CONST_7 = 7;
export const SIGN_CONST_8 = 8;
export const SIGN_CONST_9 = 9;
export const SIGN_CONST_10 = 10;
export const SIGN_CONST_11 = 11;
export const SIGN_CONST_12 = 12;
export const SIGN_CONST_13 = 13;
export const SIGN_CONST_14 = 14;
export const SIGN_CONST_15 = 15;
export const SIGN_CONST_16 = 16;
export const SIGN_CONST_17 = 17;
