// Stacks Connect authentication helpers
/** Auth options passed to openAuth */
export interface AuthOptions {
  appDetails: { name: string; icon: string };
  onFinish?: (payload: UserSessionData) => void;
  onCancel?: () => void;
  network?: string;
}
/** User session data returned after auth */
export interface UserSessionData {
  username?: string;
  profile?: UserProfile;
  identityAddress?: string;
  appPrivateKey?: string;
  hubUrl?: string;
}
/** User profile data */
export interface UserProfile {
  stxAddress: { mainnet: string; testnet: string };
  btcAddress?: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
}
/** Session state */
export interface SessionState {
  isSignedIn: boolean;
  userData: UserSessionData | null;
  network: string;
}
/** Build default auth options */
export function buildAuthOptions(
  appName: string,
  appIcon: string,
  onFinish: (data: UserSessionData) => void,
  onCancel?: () => void,
): AuthOptions {
  return { appDetails: { name: appName, icon: appIcon }, onFinish, onCancel };
}
