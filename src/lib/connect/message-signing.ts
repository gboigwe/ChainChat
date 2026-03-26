// Stacks Connect message signing helpers
/** Message signing options */
export interface SignMessageOptions {
  message: string;
  onFinish?: (data: SignatureData) => void;
  onCancel?: () => void;
  network?: string;
}
