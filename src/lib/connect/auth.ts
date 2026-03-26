// Stacks Connect authentication helpers
/** Auth options passed to openAuth */
export interface AuthOptions {
  appDetails: { name: string; icon: string };
  onFinish?: (payload: UserSessionData) => void;
  onCancel?: () => void;
  network?: string;
}
