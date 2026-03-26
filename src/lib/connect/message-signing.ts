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
